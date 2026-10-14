const mongoose = require('mongoose');

const googleReviewSchema = new mongoose.Schema({
  googleReviewId: {
    type: String,
    unique: true,
    sparse: true,
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
  },
  authorPhoto: {
    type: String,
    default: '',
  },
  authorUri: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5,
  },
  relativeTime: {
    type: String,
    default: 'recently',
  },
  publishTime: {
    type: Date,
    default: Date.now,
  },
  text: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
  },
  service: {
    type: String,
    default: 'Verified Google Review',
  },
  googleMapsUri: {
    type: String,
    default: 'https://g.page/r/CUj5F0eRuHpFEAE',
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GoogleReview', googleReviewSchema);
