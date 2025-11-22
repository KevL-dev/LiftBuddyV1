const db = require("../database");

module.exports = {
  createUser(email, username, passwordHash) {
  return new Promise((resolve, reject) => {
    const created = new Date().toISOString();

    db.run(
      `INSERT INTO users (email, username, passwordHash, created) VALUES (?, ?, ?, ?)`,
      [email, username, passwordHash, created],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username, email, created });
      }
    );
  });
},

  findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
};
