const express = require("express");
const bcrypt = require("bcryptjs");
const Users = require("../models/users");

const router = express.Router();

// -------------------------------------
//           REGISTER
// -------------------------------------
router.post("/register", async (req, res) => {
  const { email, username,  password } = req.body;

  if (!email || !password || !username)
    return res.status(400).json({ error: "Email, Username and Password required" });

  const existing = await Users.findByEmail(email);
  if (existing)
    return res.status(400).json({ error: "Email already in use" });

  const hash = bcrypt.hashSync(password, 10);
  const newUser = await Users.createUser(email, username, hash);

  req.session.userId = newUser.id;

  res.json({ message: "Registered successfully", user: newUser });
});

router.get("/me", (req, res) => {
  if (req.session.userId) {
    return res.json({ loggedIn: true, userId: req.session.userId });
  }
  res.json({ loggedIn: false });
});


// -------------------------------------
//             LOGIN
// -------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await Users.findByEmail(email);
  if (!user)
    return res.status(400).json({ error: "Invalid credentials" });

  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match)
    return res.status(400).json({ error: "Invalid credentials" });

  req.session.userId = user.id;

  res.json({ message: "Logged in", user: { id: user.id, email: user.email } });
});

// -------------------------------------
//          CHECK SESSION
// -------------------------------------
router.get("/me", (req, res) => {
  if (!req.session.userId)
    return res.json({ loggedIn: false });

  res.json({ loggedIn: true, userId: req.session.userId });
});

// -------------------------------------
//            LOGOUT
// -------------------------------------
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
