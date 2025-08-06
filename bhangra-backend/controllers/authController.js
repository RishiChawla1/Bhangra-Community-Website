const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  console.log("Incoming register request:", name, email);

  const salt = bcrypt.genSaltSync(10);
  const hashed = bcrypt.hashSync(password, salt);

  const sql = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, hashed], (err, result) => {
    if (err) {
      console.error("Register DB error:", err); // ✅ Log the error
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already in use' });
      }
      return res.status(500).json({ message: 'Database error', error: err });
    }
    console.log("User inserted:", result);
    res.status(201).json({ message: 'User registered successfully' });
  });
};


exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM Users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) return res.status(401).json({ message: 'Incorrect password' });


    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server misconfigured: missing JWT_SECRET' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
};
