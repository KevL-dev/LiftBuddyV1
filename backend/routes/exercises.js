const express = require("express");
const router = express.Router();
const db = require("../database");
const requireAuth = require("../middleware/requireAuth");

router.get("/", (req, res) => {
  db.all("SELECT * FROM exercises ORDER BY name", [], (err, rows) => {
    if (err) {
      console.error("GET /api/exercises DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

router.post("/", requireAuth, (req, res) => {
  const { name, muscle_group } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  db.run(
    "INSERT INTO exercises (name, muscle_group) VALUES (?, ?)",
    [name, muscle_group || null],
    function (err) {
      if (err) {
        console.error("POST /api/exercises DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

module.exports = router;
