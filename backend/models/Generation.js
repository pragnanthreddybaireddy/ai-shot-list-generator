const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
  scene_description: { type: String, required: true },
  production_requirements: String,
  camera_angles: String,
  lens_suggestions: String,
  coverage_notes: String,
  ai_response: { type: String, required: true },
  model_used: String,
  tokens_used: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Generation', generationSchema);
