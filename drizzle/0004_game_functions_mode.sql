DROP FUNCTION IF EXISTS submit_guess(text, integer, smallint, text, smallint);
--> statement-breakpoint
DROP FUNCTION IF EXISTS give_up(text, integer);
--> statement-breakpoint
-- Torna as funções do jogo cientes do modo (normal ou practice = infinito).
-- practice: sem limite de palpites, não altera cell_pick_count/puzzle_stats
-- (não conta na raridade nem no nº de jogadores) e é uma partida separada
-- da normal (por isso o CREATE OR REPLACE recebe p_mode).

CREATE OR REPLACE FUNCTION submit_guess(
  p_user_id text,
  p_puzzle_id integer,
  p_cell smallint,
  p_uf text,
  p_max_guesses smallint,
  p_mode text DEFAULT 'normal'
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
  v_practice boolean := p_mode = 'practice';
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

  INSERT INTO game (user_id, puzzle_id, mode) VALUES (p_user_id, p_puzzle_id, p_mode)
  ON CONFLICT (user_id, puzzle_id, mode) DO NOTHING
  RETURNING true INTO v_inserted;

  IF v_inserted AND NOT v_practice THEN
    INSERT INTO puzzle_stats (puzzle_id, players) VALUES (p_puzzle_id, 1)
    ON CONFLICT (puzzle_id) DO UPDATE SET players = puzzle_stats.players + 1;
  END IF;

  SELECT * INTO v_game FROM game
  WHERE user_id = p_user_id AND puzzle_id = p_puzzle_id AND mode = p_mode
  FOR UPDATE;

  IF v_game.status <> 'in_progress' THEN
    RETURN QUERY SELECT 'game_over', false, NULL::real, 0::smallint, v_game.status, v_game.correct_count;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM guess g WHERE g.game_id = v_game.id AND g.cell = p_cell AND g.is_correct) THEN
    RETURN QUERY SELECT 'cell_filled', false, NULL::real,
      (CASE WHEN v_practice THEN NULL ELSE p_max_guesses - v_game.guesses_used END)::smallint, v_game.status, v_game.correct_count;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM guess g WHERE g.game_id = v_game.id AND g.uf = p_uf AND g.is_correct) THEN
    RETURN QUERY SELECT 'uf_used', false, NULL::real,
      (CASE WHEN v_practice THEN NULL ELSE p_max_guesses - v_game.guesses_used END)::smallint, v_game.status, v_game.correct_count;
    RETURN;
  END IF;

  SELECT valid_ufs INTO v_valid FROM puzzle_cell WHERE puzzle_id = p_puzzle_id AND cell = p_cell;
  v_correct := p_uf = ANY (v_valid);

  INSERT INTO guess (game_id, cell, uf, is_correct) VALUES (v_game.id, p_cell, p_uf, v_correct);

  v_game.guesses_used := v_game.guesses_used + 1;
  SELECT players INTO v_players FROM puzzle_stats WHERE puzzle_id = p_puzzle_id;

  IF v_correct THEN
    v_game.correct_count := v_game.correct_count + 1;
    IF v_practice THEN
      -- Só lê o % real dos outros jogadores; não soma o próprio palpite.
      SELECT picks INTO v_picks FROM cell_pick_count WHERE puzzle_id = p_puzzle_id AND cell = p_cell AND uf = p_uf;
      v_picks := coalesce(v_picks, 0);
    ELSE
      INSERT INTO cell_pick_count (puzzle_id, cell, uf, picks) VALUES (p_puzzle_id, p_cell, p_uf, 1)
      ON CONFLICT (puzzle_id, cell, uf) DO UPDATE SET picks = cell_pick_count.picks + 1
      RETURNING picks INTO v_picks;
    END IF;
  END IF;

  IF v_game.correct_count = 9 THEN
    v_game.status := 'completed';
    IF NOT v_practice THEN
      UPDATE puzzle_stats SET completed = completed + 1 WHERE puzzle_id = p_puzzle_id;
    END IF;
  ELSIF NOT v_practice AND v_game.guesses_used >= p_max_guesses THEN
    v_game.status := 'out_of_guesses';
  END IF;

  UPDATE game SET
    guesses_used = v_game.guesses_used,
    correct_count = v_game.correct_count,
    status = v_game.status,
    finished_at = CASE WHEN v_game.status <> 'in_progress' THEN now() END
  WHERE id = v_game.id;

  RETURN QUERY SELECT
    'ok',
    v_correct,
    CASE WHEN v_correct THEN (v_picks::real / greatest(v_players, 1) * 100)::real END,
    (CASE WHEN v_practice THEN NULL ELSE greatest(p_max_guesses - v_game.guesses_used, 0) END)::smallint,
    v_game.status,
    v_game.correct_count;
END;
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION give_up(p_user_id text, p_puzzle_id integer, p_mode text DEFAULT 'normal') RETURNS text
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

  INSERT INTO game (user_id, puzzle_id, mode, status, finished_at)
  VALUES (p_user_id, p_puzzle_id, p_mode, 'gave_up', now())
  ON CONFLICT (user_id, puzzle_id, mode) DO NOTHING;

  UPDATE game SET status = 'gave_up', finished_at = now()
  WHERE user_id = p_user_id AND puzzle_id = p_puzzle_id AND mode = p_mode AND status = 'in_progress';

  SELECT status INTO v_status FROM game WHERE user_id = p_user_id AND puzzle_id = p_puzzle_id AND mode = p_mode;
  RETURN v_status;
END;
$$;
--> statement-breakpoint

-- Junta as partidas (dos dois modos) de um visitante na conta em que ele entrou.
CREATE OR REPLACE FUNCTION merge_user_games(p_from text, p_to text) RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
  v_dup record;
  v_moved integer;
BEGIN
  IF p_from = p_to THEN
    RETURN 0;
  END IF;

  FOR v_dup IN
    SELECT a.id, a.puzzle_id, a.mode, a.status
    FROM game a
    JOIN game b ON b.puzzle_id = a.puzzle_id AND b.mode = a.mode AND b.user_id = p_to
    WHERE a.user_id = p_from
    FOR UPDATE OF a
  LOOP
    IF v_dup.mode = 'normal' THEN
      UPDATE cell_pick_count c SET picks = c.picks - 1
      FROM guess g
      WHERE g.game_id = v_dup.id AND g.is_correct
        AND c.puzzle_id = v_dup.puzzle_id AND c.cell = g.cell AND c.uf = g.uf;

      UPDATE puzzle_stats SET
        players = players - CASE WHEN EXISTS (SELECT 1 FROM guess WHERE game_id = v_dup.id) THEN 1 ELSE 0 END,
        completed = completed - CASE WHEN v_dup.status = 'completed' THEN 1 ELSE 0 END
      WHERE puzzle_id = v_dup.puzzle_id;
    END IF;

    DELETE FROM game WHERE id = v_dup.id;
  END LOOP;

  UPDATE game SET user_id = p_to WHERE user_id = p_from;
  GET DIAGNOSTICS v_moved = ROW_COUNT;
  RETURN v_moved;
END;
$$;
