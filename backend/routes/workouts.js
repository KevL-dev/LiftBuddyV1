const express = require("express");
const router = express.Router();
const db = require("../database");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);

  if (userId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  db.all(
    "SELECT * FROM workouts WHERE user_id = ? ORDER BY id DESC",
    [userId],
    (err, rows) => {
      if (err) {
        console.error("GET /api/workouts/:userId DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    },
  );
});

router.get("/detail/:workoutId", (req, res) => {
  const wid = req.params.workoutId;

  db.get("SELECT * FROM workouts WHERE id = ?", [wid], (err, workout) => {
    if (err) {
      console.error("GET /api/workouts/detail DB error (workout):", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!workout) return res.status(404).json({ error: "Workout not found" });

    if (workout.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    db.all(
      `SELECT we.id as we_id, we.sets, we.reps, we.weight,
              e.id as exercise_id, e.name, e.muscle_group
       FROM workout_exercises we
       JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = ?`,
      [wid],
      (err, rows) => {
        if (err) {
          console.error("GET /api/workouts/detail DB error (exercises):", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ workout, exercises: rows });
      },
    );
  });
});

router.post("/", (req, res) => {
  const { name } = req.body;
  const user_id = req.user.id;

  if (!name) return res.status(400).json({ error: "name required" });

  const created = new Date().toISOString();
  db.run(
    "INSERT INTO workouts (user_id, name, created) VALUES (?, ?, ?)",
    [user_id, name, created],
    function (err) {
      if (err) {
        console.error("POST /api/workouts DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true, workoutId: this.lastID });
    },
  );
});

router.post("/:workoutId/exercises", (req, res) => {
  const workoutId = req.params.workoutId;
  const { exercise_id, sets, reps, weight } = req.body;
  if (!exercise_id)
    return res.status(400).json({ error: "exercise_id required" });

  db.run(
    `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight)
     VALUES (?, ?, ?, ?, ?)`,
    [workoutId, exercise_id, sets || null, reps || null, weight || null],
    function (err) {
      if (err) {
        console.error("POST /api/workouts/:id/exercises DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true, id: this.lastID });
    },
  );
});

router.delete("/:id", (req, res) => {
  const workoutId = req.params.id;

  if (!workoutId) {
    return res.status(400).json({ error: "Workout-ID missing" });
  }

  db.serialize(() => {
    db.run(
      "DELETE FROM workout_exercises WHERE workout_id = ?",
      [workoutId],
      function (err) {
        if (err) {
          console.error("Delete workout_exercises error:", err);
          return res
            .status(500)
            .json({ error: "Fehler beim Löschen der Übungen" });
        }

        db.run(
          "DELETE FROM workouts WHERE id = ? AND user_id = ?",
          [workoutId, req.user.id],
          function (err) {
            if (err) {
              console.error("Delete workout error:", err);
              return res.status(500).json({ error: "Error deleting workout" });
            }

            if (this.changes === 0) {
              return res.status(404).json({ error: "Workout not found" });
            }

            res.json({ success: true });
          },
        );
      },
    );
  });
});

router.put("/:workoutId/exercises/:id", (req, res) => {
  const { workoutId, id } = req.params;
  const { sets, reps, weight } = req.body;

  db.run(
    `UPDATE workout_exercises
    SET sets = ?, reps = ?, weight = ?
    WHERE id = ? AND workout_id = ?`,
    [sets, reps, weight, id, workoutId],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Update failed" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Exercise not found" });
      }

      res.json({ success: true });
    },
  );
});

router.get("/:workoutId/stats", (req, res) => {
  const workoutId = req.params.workoutId;

  db.get("SELECT * FROM workouts WHERE id = ?", [workoutId], (err, workout) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!workout) return res.status(404).json({ error: "Workout not found" });

    if (workout.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    db.all(
      `
      SELECT
        we.exercise_id,
        e.name,
        e.muscle_group,
        we.sets,
        we.reps,
        we.weight,
        COALESCE(we.sets,0) * COALESCE(we.reps,0) * COALESCE(we.weight,0) AS volume
      FROM workout_exercises we
      JOIN exercises e ON e.id = we.exercise_id
      WHERE we.workout_id = ?
      `,
      [workoutId],
      (err, currentRows) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const currentTotal = currentRows.reduce(
          (sum, r) => sum + (Number(r.volume) || 0),
          0,
        );

        db.get(
          `
          SELECT id
          FROM workouts
          WHERE user_id = ? AND name = ? AND id < ?
          ORDER BY id DESC
          LIMIT 1
          `,
          [workout.user_id, workout.name, workout.id],
          (err, prev) => {
            if (err) return res.status(500).json({ error: "Database error" });

            if (!prev) {
              return res.json({
                workoutId: workout.id,
                totalMovedKg: round1(currentTotal),
                improvementPct: null,
                previousWorkoutId: null,
                perExercise: currentRows.map((r) => ({
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
                we.exercise_id,
                COALESCE(we.sets,0) * COALESCE(we.reps,0) * COALESCE(we.weight,0) AS volume
              FROM workout_exercises we
              WHERE we.workout_id = ?
              `,
              [prev.id],
              (err, prevRows) => {
                if (err)
                  return res.status(500).json({ error: "Database error" });

                const prevByExercise = new Map();
                prevRows.forEach((r) => {
                  const key = String(r.exercise_id);
                  prevByExercise.set(
                    key,
                    (prevByExercise.get(key) || 0) + (Number(r.volume) || 0),
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

                const perExercise = currentRows.map((r) => {
                  const prevVol =
                    prevByExercise.get(String(r.exercise_id)) || 0;
                  const curVol = Number(r.volume) || 0;
                  const pct =
                    prevVol > 0 ? ((curVol - prevVol) / prevVol) * 100 : null;

                  return {
                    exercise_id: r.exercise_id,
                    name: r.name,
                    muscle_group: r.muscle_group,
                    volume: round1(curVol),
                    improvementPct: pct === null ? null : round1(pct),
                  };
                });

                res.json({
                  workoutId: workout.id,
                  previousWorkoutId: prev.id,
                  totalMovedKg: round1(currentTotal),
                  improvementPct:
                    improvementPct === null ? null : round1(improvementPct),
                  perExercise,
                });
              },
            );
          },
        );
      },
    );
  });

  function round1(n) {
    const x = Number(n) || 0;
    return Math.round(x * 10) / 10;
  }
});

module.exports = router;
