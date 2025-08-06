const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

const authRoutes = require('./routes/auth');
const experienceRoutes = require('./routes/experiences');
const teamRoutes = require('./routes/teams');
const verifyToken = require('./middleware/verifyToken');
const roleRoutes = require('./routes/roles');

app.use(cors());
app.use(express.json());

app.use(express.static('public'));
app.use('/api/auth', authRoutes);
app.use('/api/experiences', verifyToken, experienceRoutes);
app.use('/api/teams', verifyToken, teamRoutes); // for adding new teams
app.use('/api/roles', roleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
