const express = require("express");
const bcrypt = require("bcryptjs");
const Users = require("../models/users");
const router = express.Router();
const crypto = require("crypto");
const db = require("../database.js")

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// -------------------------------------
//           REGISTER
// -------------------------------------
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

// -------------------------------------
//             LOGIN
// -------------------------------------
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    async (err, user) => {
      if (err || !user) return res.status(400).json({ error: "Invalid credentials" });

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
              email: user.email
            }
          });
        }
      );
    }
  );
});

// --------------------------
// TOKEN LOGIN (Auto-Login)
// --------------------------
router.post("/token-login", (req, res) => {
  const { token } = req.body;

  if (!token) return res.json({ loggedIn: false });

  db.get(
    `SELECT id, username, email FROM users WHERE authToken = ?`,
    [token],
    (err, user) => {
      if (err || !user) 
        return res.json({ loggedIn: false });

      res.json({
        loggedIn: true,
        user
      });
    }
  );
});

// -------------------------------------
//            LOGOUT
// -------------------------------------
router.post("/logout", (req, res) => {
  const { token } = req.body;

  db.run(
    `UPDATE users SET authToken = NULL WHERE authToken = ?`,
    [token],
    () => res.json({ success: true })
  );
});

// -------------------------------------
//          CHECK SESSION
// -------------------------------------

// router.get("/me", (req, res) => {
//   console.log(req.session);
//   if (!req.session.userId) {
//     return res.json({ loggedIn: false });
//   }

//   res.json({
//     loggedIn: true,
//     user: {
//       id: req.session.userId,
//       email: req.session.email,
//       username: req.session.username,
//     },
//   });
// });

module.exports = router;

