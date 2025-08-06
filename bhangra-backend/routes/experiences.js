const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');

router.post('/add', experienceController.addExperience);
router.get('/', experienceController.getUserExperiences);

module.exports = router;