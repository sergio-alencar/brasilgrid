-- Funções do jogo. Cada palpite é uma única chamada atômica ao banco.

CREATE OR REPLACE FUNCTION brasilia_today() RETURNS date
LANGUAGE sql STABLE AS $$
  SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION submit_guess(
  p_user_id text,
  p_puzzle_id integer,
  p_cell smallint,
  p_uf text,
  p_max_guesses smallint
) RETURNS TABLE (
  result text,
  is_correct boolean,
  pick_percent real,
  guesses_left smallint,
  game_status text,
  correct_count smallint
)
LANGUAGE plpgsql AS $$
DECLARE
  v_game game%ROWTYPE;
  v_valid text[];
  v_correct boolean;
  v_players integer;
  v_picks integer;
  v_inserted boolean := false;
BEGIN
  IF p_cell NOT BETWEEN 0 AND 8 THEN
    RETURN QUERY SELECT 'invalid_cell', false, NULL::real, NULL::smallint, NULL::text, NULL::smallint;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM puzzle
    WHERE id = p_puzzle_id AND status = 'published' AND play_date = brasilia_today()
  ) THEN
    RETURN QUERY SELECT 'puzzle_unavailable', false, NULL::real, NULL::smallint, NULL::text, NULL::smallint;
    RETURN;
  END IF;

  INSERT INTO game (user_id, puzzle_id) VALUES (p_user_id, p_puzzle_id)
  ON CONFLICT (user_id, puzzle_id) DO NOTHING
  RETURNING true INTO v_inserted;

  IF v_inserted THEN
    INSERT INTO puzzle_stats (puzzle_id, players) VALUES (p_puzzle_id, 1)
    ON CONFLICT (puzzle_id) DO UPDATE SET players = puzzle_stats.players + 1;
  END IF;

  SELECT * INTO v_game FROM game
  WHERE user_id = p_user_id AND puzzle_id = p_puzzle_id
  FOR UPDATE;

  IF v_game.status <> 'in_progress' THEN
    RETURN QUERY SELECT 'game_over', false, NULL::real, 0::smallint, v_game.status, v_game.correct_count;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM guess g WHERE g.game_id = v_game.id AND g.cell = p_cell AND g.is_correct) THEN
    RETURN QUERY SELECT 'cell_filled', false, NULL::real,
      (p_max_guesses - v_game.guesses_used)::smallint, v_game.status, v_game.correct_count;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM guess g WHERE g.game_id = v_game.id AND g.uf = p_uf AND g.is_correct) THEN
    RETURN QUERY SELECT 'uf_used', false, NULL::real,
      (p_max_guesses - v_game.guesses_used)::smallint, v_game.status, v_game.correct_count;
    RETURN;
  END IF;

  SELECT valid_ufs INTO v_valid FROM puzzle_cell WHERE puzzle_id = p_puzzle_id AND cell = p_cell;
  v_correct := p_uf = ANY (v_valid);

  INSERT INTO guess (game_id, cell, uf, is_correct) VALUES (v_game.id, p_cell, p_uf, v_correct);

  v_game.guesses_used := v_game.guesses_used + 1;
  IF v_correct THEN
    v_game.correct_count := v_game.correct_count + 1;
    INSERT INTO cell_pick_count (puzzle_id, cell, uf, picks) VALUES (p_puzzle_id, p_cell, p_uf, 1)
    ON CONFLICT (puzzle_id, cell, uf) DO UPDATE SET picks = cell_pick_count.picks + 1
    RETURNING picks INTO v_picks;
  END IF;

  IF v_game.correct_count = 9 THEN
    v_game.status := 'completed';
    UPDATE puzzle_stats SET completed = completed + 1 WHERE puzzle_id = p_puzzle_id;
  ELSIF v_game.guesses_used >= p_max_guesses THEN
    v_game.status := 'out_of_guesses';
  END IF;

  UPDATE game SET
    guesses_used = v_game.guesses_used,
    correct_count = v_game.correct_count,
    status = v_game.status,
    finished_at = CASE WHEN v_game.status <> 'in_progress' THEN now() END
  WHERE id = v_game.id;

  SELECT players INTO v_players FROM puzzle_stats WHERE puzzle_id = p_puzzle_id;

  RETURN QUERY SELECT
    'ok',
    v_correct,
    CASE WHEN v_correct THEN (v_picks::real / greatest(v_players, 1) * 100)::real END,
    greatest(p_max_guesses - v_game.guesses_used, 0)::smallint,
    v_game.status,
    v_game.correct_count;
END;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION give_up(p_user_id text, p_puzzle_id integer) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE
  v_status text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM puzzle
    WHERE id = p_puzzle_id AND status = 'published' AND play_date = brasilia_today()
  ) THEN
    RETURN 'puzzle_unavailable';
  END IF;

  INSERT INTO game (user_id, puzzle_id, status, finished_at)
  VALUES (p_user_id, p_puzzle_id, 'gave_up', now())
  ON CONFLICT (user_id, puzzle_id) DO NOTHING;

  UPDATE game SET status = 'gave_up', finished_at = now()
  WHERE user_id = p_user_id AND puzzle_id = p_puzzle_id AND status = 'in_progress';

  SELECT status INTO v_status FROM game WHERE user_id = p_user_id AND puzzle_id = p_puzzle_id;
  RETURN v_status;
END;
$$;
--> statement-breakpoint

-- Raridade de uma partida com os contadores atuais: soma dos % dos acertos + 100 por célula vazia.
CREATE OR REPLACE FUNCTION game_rarity(p_game_id text) RETURNS real
LANGUAGE sql STABLE AS $$
  SELECT (
    coalesce(sum(cpc.picks::real / greatest(ps.players, 1) * 100), 0)
    + (9 - count(gu.id)) * 100
  )::real
  FROM game g
  LEFT JOIN guess gu ON gu.game_id = g.id AND gu.is_correct
  LEFT JOIN cell_pick_count cpc ON cpc.puzzle_id = g.puzzle_id AND cpc.cell = gu.cell AND cpc.uf = gu.uf
  LEFT JOIN puzzle_stats ps ON ps.puzzle_id = g.puzzle_id
  WHERE g.id = p_game_id
  GROUP BY g.id
$$;
--> statement-breakpoint

-- Fechamento diário: encerra partidas abertas e grava a raridade final.
CREATE OR REPLACE FUNCTION close_day(p_play_date date) RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE game g SET status = 'gave_up', finished_at = now()
  FROM puzzle p
  WHERE g.puzzle_id = p.id AND p.play_date = p_play_date AND g.status = 'in_progress';

  UPDATE game g SET final_rarity = game_rarity(g.id)
  FROM puzzle p
  WHERE g.puzzle_id = p.id AND p.play_date = p_play_date;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
