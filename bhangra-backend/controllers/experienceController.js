const db = require('../db');

// Add multiple roles under a team
exports.addExperience = (req, res) => {
  const user_id = req.user.id;
  const { team_ID, roles, description } = req.body;

  if (!team_ID || !Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ message: "Missing team or role data" });
  }

  const sql = `
    INSERT INTO experiences (user_id, team_id, role_id, start_date, end_date, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: "Connection error", error: err });

    connection.beginTransaction(err => {
      if (err) return res.status(500).json({ message: "Transaction error", error: err });

      let completed = 0;
      for (const role of roles) {
        const { role_ID, startDate, endDate } = role;
        if (!role_ID || !startDate || !endDate) {
          return connection.rollback(() =>
            res.status(400).json({ message: "Missing role data" })
          );
        }

        const values = [user_id, team_ID, role_ID, startDate, endDate, description];

        connection.query(sql, values, (err) => {
          if (err) {
            return connection.rollback(() =>
              res.status(500).json({ message: "Insert failed", error: err })
            );
          }

          completed++;
          if (completed === roles.length) {
            connection.commit(err => {
              if (err) {
                return connection.rollback(() =>
                  res.status(500).json({ message: "Commit failed", error: err })
                );
              }
              connection.release();
              res.status(201).json({ message: "All experiences added successfully" });
            });
          }
        });
      }
    });
  });
};

// Get experiences for a user
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
    res.json(results);
  });
};
