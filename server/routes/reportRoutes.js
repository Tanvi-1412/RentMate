const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkCollege = require('../middleware/checkCollege');
const { createReport, getMyReports } = require('../controllers/reportController');

router.use(authenticate, checkCollege);

router.post('/', createReport);
router.get('/my-reports', getMyReports);

module.exports = router;
