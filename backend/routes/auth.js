const express = require("express");
const bcrypt = require("bcryptjs");
const Users = require("../models/users");
const router = express.Router();
const crypto = require("crypto");
const db = require("../database.js");

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: "Hash error" });

    const created = new Date().toISOString();

    db.run(
      `INSERT INTO users (username, email, passwordHash, created)
       VALUES (?, ?, ?, ?)`,
      [username, email, hash, created],
      function (err) {
        if (err) return res.status(400).json({ error: "Email exists already" });

        return res.json({ success: true });
      }
    );
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user)
      return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken();

    db.run(
      `UPDATE users SET authToken = ? WHERE id = ?`,
      [token, user.id],
      () => {
        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        });
      }
    );
  });
});

router.post("/token-login", (req, res) => {
  const { token } = req.body;

  if (!token) return res.json({ loggedIn: false });

  db.get(
    `SELECT id, username, email FROM users WHERE authToken = ?`,
    [token],
    (err, user) => {
      if (err || !user) return res.json({ loggedIn: false });

      res.json({
        loggedIn: true,
        user,
      });
    }
  );
});

router.post("/logout", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  db.run(
    `UPDATE users SET authToken = NULL WHERE authToken = ?`,
    [token],
    function (err) {
      if (err) {
        console.error("DB error on logout:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (this.changes === 0) {
        return res.status(400).json({ error: "Invalid token" });
      }

      res.json({ success: true });
    }
  );
});

router.put("/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No auth header" });
  }

  const token = authHeader.split(" ")[1];
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.get(
    `SELECT id FROM users WHERE authToken = ?`,
    [token],
    (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: "Invalid token" });
      }

      db.run(
        `UPDATE users SET username = ?, email = ? WHERE id = ?`,
        [username, email, user.id],
        function (err) {
          if (err) {
            if (err.message.includes("UNIQUE")) {
              return res.status(400).json({ error: "Email already exists" });
            }
            return res.status(500).json({ error: "Database error" });
          }

          res.json({
            success: true,
            user: { id: user.id, username, email },
          });
        }
      );
    }
  );
});


module.exports = router;
