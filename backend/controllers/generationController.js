const crypto = require('crypto');
const { Generation } = require('../models');
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
    
    const id = crypto.randomUUID();
    await Generation.create({
      id: id,
      user_id: req.user.id,
      inputs: req.body,
      result: data,
      model
    });
    
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

async function getHistory(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const totalCount = await Generation.count({ where: { user_id: req.user.id } });
    
    const records = await Generation.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    const mappedRecords = records.map(r => ({
      id: r.id,
      created_at: r.created_at,
      inputs: r.inputs
    }));

    res.json({
      success: true,
      data: mappedRecords,
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

async function getGenerationById(req, res) {
  try {
    const { id } = req.params;
    const record = await Generation.findOne({ where: { id, user_id: req.user.id } });
    
    if (!record) return res.status(404).json({ success: false, error: 'Not found' });
    
    res.json({
      success: true,
      data: {
        id: record.id,
        inputs: record.inputs,
        result: record.result,
        model: record.model,
        created_at: record.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createGeneration, getHistory, getGenerationById };
