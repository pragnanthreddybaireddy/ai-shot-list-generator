const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  scene_description: { type: String },
  production_requirements: { type: String },
  camera_angles: { type: String },
  lens_suggestions: { type: String },
  coverage_notes: { type: String },
  is_public: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema);
