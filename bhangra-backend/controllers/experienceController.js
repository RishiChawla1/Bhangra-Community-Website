const db = require('../db');

exports.addExperience = (req, res) => {
  const { team_id, role_id, start_date, end_date, description } = req.body;
  const user_id = req.user.id;

  const sql = `
    INSERT INTO experiences (user_id, team_id, role_id, start_date, end_date, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [user_id, team_id, role_id, start_date, end_date, description], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: 'Experience added successfully' });
  });
};

exports.getUserExperiences = (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT e.id, t.name AS team, r.name AS role, e.start_date, e.end_date, e.description
    FROM experiences e
    JOIN teams t ON e.team_id = t.id
    JOIN roles r ON e.role_id = r.id
    WHERE e.user_id = ?
    ORDER BY e.start_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) {
      return res.status(404).json({ message: 'No experiences found' });
    }
    res.json(results);
  });
};
