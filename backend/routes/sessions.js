const express = require("express");
const router = express.Router();
const db = require("../database");
const requireAuth = require("../middleware/requireAuth");

function round1(n) {
  const x = Number(n) || 0;
  return Math.round(x * 10) / 10;
}

router.get("/:sessionId/detail", requireAuth, (req, res) => {
  const sessionId = req.params.sessionId;

  db.get(
    `
    SELECT s.*, p.name as plan_name
    FROM sessions s
    JOIN plans p ON p.id = s.plan_id
    WHERE s.id = ? AND s.user_id = ?
    `,
    [sessionId, req.user.id],
    (err, session) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!session) return res.status(404).json({ error: "Session not found" });

      db.all(
        `
        SELECT
          se.id as se_id,
          se.exercise_id,
          se.sets,
          se.reps,
          se.weight,
          e.name,
          e.muscle_group
        FROM session_exercises se
        JOIN exercises e ON e.id = se.exercise_id
        WHERE se.session_id = ?
        ORDER BY se.id ASC
        `,
        [sessionId],
        (err, rows) => {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json({ session, exercises: rows });
        },
      );
    },
  );
});

router.put("/:sessionId/exercises/:seId", requireAuth, (req, res) => {
  const { sessionId, seId } = req.params;
  const { sets, reps, weight } = req.body;

  db.get(
    `SELECT id FROM sessions WHERE id = ? AND user_id = ?`,
    [sessionId, req.user.id],
    (err, session) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!session) return res.status(404).json({ error: "Session not found" });

      db.run(
        `
        UPDATE session_exercises
        SET sets = ?, reps = ?, weight = ?
        WHERE id = ? AND session_id = ?
        `,
        [sets ?? null, reps ?? null, weight ?? null, seId, sessionId],
        function (err) {
          if (err) return res.status(500).json({ error: "Database error" });
          if (this.changes === 0)
            return res.status(404).json({ error: "Exercise not found" });
          res.json({ success: true });
        },
      );
    },
  );
});

router.post("/:sessionId/finish", requireAuth, (req, res) => {
  const sessionId = req.params.sessionId;
  const finished = new Date().toISOString();

  db.get(
    `SELECT * FROM sessions WHERE id = ? AND user_id = ?`,
    [sessionId, req.user.id],
    (err, s) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!s) return res.status(404).json({ error: "Session not found" });

      db.run(
        `UPDATE sessions SET finished = ? WHERE id = ? AND user_id = ?`,
        [finished, sessionId, req.user.id],
        (err) => {
          if (err) return res.status(500).json({ error: "Database error" });

          db.all(
            `
            SELECT
              se.exercise_id,
              e.name,
              e.muscle_group,
              COALESCE(se.sets,0) * COALESCE(se.reps,0) * COALESCE(se.weight,0) AS volume
            FROM session_exercises se
            JOIN exercises e ON e.id = se.exercise_id
            WHERE se.session_id = ?
            `,
            [sessionId],
            (err, curRows) => {
              if (err) return res.status(500).json({ error: "Database error" });

              const currentTotal = curRows.reduce(
                (sum, r) => sum + (Number(r.volume) || 0),
                0,
              );

              db.get(
                `
                SELECT id
                FROM sessions
                WHERE user_id = ?
                  AND plan_id = ?
                  AND finished IS NOT NULL
                  AND id < ?
                ORDER BY id DESC
                LIMIT 1
                `,
                [req.user.id, s.plan_id, sessionId],
                (err, prev) => {
                  if (err)
                    return res.status(500).json({ error: "Database error" });

                  if (!prev) {
                    return res.json({
                      success: true,
                      sessionId: Number(sessionId),
                      previousSessionId: null,
                      totalMovedKg: round1(currentTotal),
                      improvementPct: null,
                      perExercise: curRows.map((r) => ({
                        exercise_id: r.exercise_id,
                        name: r.name,
                        muscle_group: r.muscle_group,
                        volume: round1(r.volume),
                        improvementPct: null,
                      })),
                    });
                  }

                  db.all(
                    `
                    SELECT
                      se.exercise_id,
                      COALESCE(se.sets,0) * COALESCE(se.reps,0) * COALESCE(se.weight,0) AS volume
                    FROM session_exercises se
                    WHERE se.session_id = ?
                    `,
                    [prev.id],
                    (err, prevRows) => {
                      if (err)
                        return res
                          .status(500)
                          .json({ error: "Database error" });

                      const prevByEx = new Map();
                      prevRows.forEach((r) => {
                        const k = String(r.exercise_id);
                        prevByEx.set(
                          k,
                          (prevByEx.get(k) || 0) + (Number(r.volume) || 0),
                        );
                      });

                      const prevTotal = prevRows.reduce(
                        (sum, r) => sum + (Number(r.volume) || 0),
                        0,
                      );

                      const improvementPct =
                        prevTotal > 0
                          ? ((currentTotal - prevTotal) / prevTotal) * 100
                          : null;

                      const perExercise = curRows.map((r) => {
                        const curVol = Number(r.volume) || 0;
                        const prevVol =
                          prevByEx.get(String(r.exercise_id)) || 0;
                        const pct =
                          prevVol > 0
                            ? ((curVol - prevVol) / prevVol) * 100
                            : null;

                        return {
                          exercise_id: r.exercise_id,
                          name: r.name,
                          muscle_group: r.muscle_group,
                          volume: round1(curVol),
                          improvementPct: pct === null ? null : round1(pct),
                        };
                      });

                      res.json({
                        success: true,
                        sessionId: Number(sessionId),
                        previousSessionId: prev.id,
                        totalMovedKg: round1(currentTotal),
                        improvementPct:
                          improvementPct === null
                            ? null
                            : round1(improvementPct),
                        perExercise,
                      });
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
});

module.exports = router;
