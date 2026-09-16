-- Junta as partidas de um visitante anônimo na conta em que ele entrou.
-- Em conflito (os dois jogaram a mesma grade), fica a partida da conta e a do
-- visitante é descartada, desfazendo sua contribuição nos contadores.
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
    SELECT a.id, a.puzzle_id, a.status
    FROM game a
    JOIN game b ON b.puzzle_id = a.puzzle_id AND b.user_id = p_to
    WHERE a.user_id = p_from
    FOR UPDATE OF a
  LOOP
    UPDATE cell_pick_count c SET picks = c.picks - 1
    FROM guess g
    WHERE g.game_id = v_dup.id AND g.is_correct
      AND c.puzzle_id = v_dup.puzzle_id AND c.cell = g.cell AND c.uf = g.uf;

    -- Só conta como jogador quem fez algum palpite (ver submit_guess).
    UPDATE puzzle_stats SET
      players = players - CASE WHEN EXISTS (SELECT 1 FROM guess WHERE game_id = v_dup.id) THEN 1 ELSE 0 END,
      completed = completed - CASE WHEN v_dup.status = 'completed' THEN 1 ELSE 0 END
    WHERE puzzle_id = v_dup.puzzle_id;

    DELETE FROM game WHERE id = v_dup.id;
  END LOOP;

  UPDATE game SET user_id = p_to WHERE user_id = p_from;
  GET DIAGNOSTICS v_moved = ROW_COUNT;
  RETURN v_moved;
END;
$$;
