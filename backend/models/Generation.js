const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // We keep the UUID from crypto as _id for backwards compatibility
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inputs: { type: Object, required: true },
  result: { type: Object, required: true },
  model: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Generation', generationSchema);
