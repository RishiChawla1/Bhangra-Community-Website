const express = require('express');
const router = express.Router();
const db = require('../db');

// Add a new team
router.post('/add', (req, res) => {
  const { team_name } = req.body;
  const sql = 'INSERT INTO teams (name) VALUES (?)';
  db.query(sql, [team_name], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Team already exists' });
      }
      return res.status(500).json(err);
    }
    res.status(201).json({ team_ID: result.insertId });
  });
});

module.exports = router;
