const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const checkCollege = require('../middleware/checkCollege');
const { createReview, getProductReviews } = require('../controllers/reviewController');

router.post('/', authenticate, checkCollege, createReview);
router.get('/products/:id', getProductReviews);

module.exports = router;
