const crypto = require('crypto');
const { getDb } = require('../config/database');
const { generateShotList } = require('../utils/aiService');
const logger = require('../utils/logger');

async function createGeneration(req, res) {
  try {
    const { scene_description, production_requirements, camera_angles, lens_suggestions, coverage_notes, director_style, cinematic_tone } = req.body;
    
    // Call AI
    const { data, tokensUsed, model } = await generateShotList({
      scene_description,
      production_requirements,
      camera_angles,
      lens_suggestions,
      coverage_notes,
      director_style,
      cinematic_tone
    });
    
    // Save to DB
    const db = getDb();
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO generations (id, user_id, inputs, result, model)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user.id, JSON.stringify(req.body), JSON.stringify(data), model);
    
    res.json({
      success: true,
      id,
      data,
      model,
      tokensUsed
    });
  } catch (error) {
    logger.error('Generation Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

function getHistory(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const db = getDb();
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM generations WHERE user_id = ?').get(req.user.id).count;
    
    const records = db.prepare(`
      SELECT id, created_at, inputs
      FROM generations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset)
      .map(r => ({ ...r, inputs: JSON.parse(r.inputs) }));

    res.json({
      success: true,
      data: records,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

function getGenerationById(req, res) {
  try {
    const db = getDb();
    const { id } = req.params;
    const record = db.prepare('SELECT * FROM generations WHERE id = ? AND user_id = ?').get(id, req.user.id);
    
    if (!record) return res.status(404).json({ success: false, error: 'Not found' });
    
    res.json({
      success: true,
      data: {
        id: record.id,
        inputs: JSON.parse(record.inputs),
        result: JSON.parse(record.result),
        model: record.model,
        created_at: record.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createGeneration, getHistory, getGenerationById };
