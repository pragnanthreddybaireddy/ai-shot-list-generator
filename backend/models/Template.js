const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  scene_description: String,
  production_requirements: String,
  camera_angles: String,
  lens_suggestions: String,
  coverage_notes: String,
  is_public: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
