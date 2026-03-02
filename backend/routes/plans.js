const express = require("express");
const router = express.Router();
const db = require("../database");
const requireAuth = require("../middleware/requireAuth");

router.get("/", requireAuth, (req, res) => {
  db.all(
    `SELECT * FROM plans WHERE user_id = ? ORDER BY id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
    },
  );
});

router.post("/", requireAuth, (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ error: "name required" });

  const created = new Date().toISOString();
  db.run(
    `INSERT INTO plans (user_id, name, created) VALUES (?, ?, ?)`,
    [req.user.id, name, created],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ success: true, planId: this.lastID });
    },
  );
});

router.get("/:planId", requireAuth, (req, res) => {
  const planId = req.params.planId;

  db.get(
    `SELECT * FROM plans WHERE id = ? AND user_id = ?`,
    [planId, req.user.id],
    (err, plan) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      db.all(
        `
        SELECT 
          pe.id as plan_ex_id,
          pe.target_sets,
          pe.target_reps,
          e.id as exercise_id,
          e.name,
          e.muscle_group
        FROM plan_exercises pe
        JOIN exercises e ON e.id = pe.exercise_id
        WHERE pe.plan_id = ?
        ORDER BY pe.id ASC
        `,
        [planId],
        (err, exs) => {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json({ plan, exercises: exs });
        },
      );
    },
  );
});

router.post("/:planId/exercises", requireAuth, (req, res) => {
  const planId = req.params.planId;
  const { exercise_id, target_sets, target_reps } = req.body;

  if (!exercise_id)
    return res.status(400).json({ error: "exercise_id required" });

  db.get(
    `SELECT id FROM plans WHERE id = ? AND user_id = ?`,
    [planId, req.user.id],
    (err, plan) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      db.run(
        `
        INSERT INTO plan_exercises (plan_id, exercise_id, target_sets, target_reps)
        VALUES (?, ?, ?, ?)
        `,
        [planId, exercise_id, target_sets ?? null, target_reps ?? null],
        function (err) {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json({ success: true, id: this.lastID });
        },
      );
    },
  );
});

router.delete("/:planId/exercises/:planExId", requireAuth, (req, res) => {
  const planId = req.params.planId;
  const planExId = req.params.planExId;

  db.get(
    `SELECT id FROM plans WHERE id = ? AND user_id = ?`,
    [planId, req.user.id],
    (err, plan) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      db.run(
        `DELETE FROM plan_exercises WHERE id = ? AND plan_id = ?`,
        [planExId, planId],
        function (err) {
          if (err) return res.status(500).json({ error: "Database error" });
          if (this.changes === 0)
            return res.status(404).json({ error: "Not found" });
          res.json({ success: true });
        },
      );
    },
  );
});

router.post("/:planId/start", requireAuth, (req, res) => {
  const planId = req.params.planId;
  const started = new Date().toISOString();

  db.get(
    `SELECT * FROM plans WHERE id = ? AND user_id = ?`,
    [planId, req.user.id],
    (err, plan) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      db.run(
        `INSERT INTO sessions (plan_id, user_id, started, finished) VALUES (?, ?, ?, NULL)`,
        [planId, req.user.id, started],
        function (err) {
          if (err) return res.status(500).json({ error: "Database error" });

          const sessionId = this.lastID;

          db.all(
            `SELECT exercise_id, target_sets, target_reps FROM plan_exercises WHERE plan_id = ?`,
            [planId],
            (err, rows) => {
              if (err) return res.status(500).json({ error: "Database error" });

              if (rows.length === 0) {
                return res.json({ success: true, sessionId });
              }

              const stmt = db.prepare(
                `INSERT INTO session_exercises (session_id, exercise_id, sets, reps, weight)
                 VALUES (?, ?, ?, ?, NULL)`,
              );

              rows.forEach((r) => {
                stmt.run(
                  sessionId,
                  r.exercise_id,
                  r.target_sets ?? null,
                  r.target_reps ?? null,
                );
              });

              stmt.finalize(() => {
                res.json({ success: true, sessionId });
              });
            },
          );
        },
      );
    },
  );
});

module.exports = router;
