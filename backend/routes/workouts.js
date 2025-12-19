const express = require("express");
const router = express.Router();
const db = require("../database");

router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all(
    "SELECT * FROM workouts WHERE user_id = ? ORDER BY id DESC",
    [userId],
    (err, rows) => {
      if (err) {
        console.error("GET /api/workouts/:userId DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    }
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
      }
    );
  });
});

router.post("/", (req, res) => {
  const { user_id, name } = req.body;
  if (!user_id || !name)
    return res.status(400).json({ error: "user_id and name required" });

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
    }
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
    }
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
          "DELETE FROM workouts WHERE id = ?",
          [workoutId],
          function (err) {
            if (err) {
              console.error("Delete workout error:", err);
              return res
                .status(500)
                .json({ error: "Error deleting workout" });
            }

            if (this.changes === 0) {
              return res.status(404).json({ error: "Workout not found" });
            }

            res.json({ success: true });
          }
        );
      }
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
    }
  );
});

module.exports = router;
