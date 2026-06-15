const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generation_id: { type: String, ref: 'Generation' },
  rating: { type: Number },
  comment: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
