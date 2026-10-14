const express = require('express');
const { getAllReviews, createReview } = require('../controllers/reviewController');
const { getGoogleReviews } = require('../controllers/googleReviewsController');

const router = express.Router();

router.get('/google', getGoogleReviews);

router
  .route('/')
  .get(getAllReviews)
  .post(createReview);

module.exports = router;
