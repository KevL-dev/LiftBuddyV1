const express = require("express");
const bcrypt = require("bcryptjs");
const Users = require("../models/users");
const router = express.Router();
const crypto = require("crypto");
const db = require("../database.js");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait 15 minutes.." },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts. Please wait 1 hour." },
});

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function validatePassword(password) {
  if (!password || password.length < 8)
    return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter (A–Z).";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter (a–z).";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number (0–9).";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Password must contain at least one special character (!@#$%...).";
  return null;
}

router.post("/register", registerLimiter, (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields are required." });

  const pwError = validatePassword(password);
  if (pwError) return res.status(400).json({ error: pwError });

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
      },
    );
  });
});

router.post("/login", loginLimiter, (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user.active === 0) {
      return res.status(403).json({
        error: "Account is deactivated",
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

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
      },
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
    },
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
    },
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

  db.get(`SELECT id FROM users WHERE authToken = ?`, [token], (err, user) => {
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
      },
    );
  });
});

router.put("/deactivate", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No auth header" });
  }

  const token = authHeader.split(" ")[1];

  db.run(
    `
    UPDATE users 
    SET active = 0, authToken = NULL 
    WHERE authToken = ?
    `,
    [token],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }

      if (this.changes === 0) {
        return res.status(401).json({ error: "Invalid token" });
      }

      res.json({ success: true });
    },
  );
});

router.put("/change-password", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No auth header" });
  }
  const token = authHeader.split(" ")[1];
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "No password provided" });
  }

  const pwError = validatePassword(password);
  if (pwError) return res.status(400).json({ error: pwError });

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Hashing error" });
    }

    db.run(
      `UPDATE users SET passwordHash = ? WHERE authToken = ?`,
      [hashedPassword, token],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({ success: true });
      },
    );
  });
});

module.exports = router;
