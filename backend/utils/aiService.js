const logger = require('../utils/logger');

const PROMPT_TEMPLATE = (inputs) => `You are an experienced film director and cinematographer with 20+ years of professional experience.

Based on the provided Scene Description, you must creatively determine the appropriate camera angles, lenses, coverage, and production requirements based on the scene's mood, action, and emotional tone.

Scene Description: ${inputs.scene_description}
${inputs.director_style ? `Requested Director Style: ${inputs.director_style}` : ''}
${inputs.cinematic_tone ? `Requested Cinematic Tone: ${inputs.cinematic_tone}` : ''}

Generate a detailed shot list containing exactly 1 single best shot that perfectly captures the essence of the scene. Make sure to adapt the framing, lighting, and pacing to match the requested Director Style and Cinematic Tone if provided. Return ONLY valid JSON in this exact format, no markdown, no explanation:

{
  "scene_summary": "Brief 2-3 sentence summary of the scene's visual approach and emotional tone",
  "shots": [
    {
      "shot_number": 1,
      "shot_type": "Wide/Medium/Close-Up/ECU/Two-Shot/etc",
      "camera_angle": "Eye-level/Low-angle/High-angle/Dutch/Bird's eye/etc",
      "camera_movement": "Static/Pan/Tilt/Dolly/Handheld/Steadicam/Crane/etc",
      "lens": "Focal length and reason (e.g. 24mm - for environmental context)",
      "framing": "Specific framing description",
      "description": "Detailed description of what happens in this shot",
      "director_style": "${inputs.director_style || 'N/A'}",
      "cinematic_tone": "${inputs.cinematic_tone || 'N/A'}",
      "coverage_notes": "Technical and creative notes for the AC and gaffer",
      "estimated_duration": "Estimated screen time in seconds"
    }
  ],
  "director_notes": "Overall vision, tone, pacing, and key creative decisions for the director",
  "production_notes": "Practical notes on scheduling, equipment, crew, and logistics",
  "lighting_concept": "Overall lighting approach and key setups",
  "equipment_list": ["List", "of", "key", "equipment", "needed"]
}`;

async function generateWithAnthropic(inputs) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: PROMPT_TEMPLATE(inputs) }]
  });

  const text = response.content[0].text;
  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
  return { text, tokensUsed, model: 'claude-sonnet-4-20250514' };
}

async function generateWithOpenAI(inputs) {
  const { OpenAI } = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert film director and cinematographer. Always respond with valid JSON only.' },
      { role: 'user', content: PROMPT_TEMPLATE(inputs) }
    ],
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  const text = response.choices[0].message.content;
  const tokensUsed = response.usage.total_tokens;
  return { text, tokensUsed, model: 'gpt-4o' };
}

async function generateWithGemini(inputs) {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: PROMPT_TEMPLATE(inputs),
    config: {
      responseMimeType: 'application/json',
    }
  });

  const text = response.text;
  return { text, tokensUsed: 0, model: 'gemini-2.5-flash' };
}

async function generateShotList(inputs) {
  const provider = process.env.AI_PROVIDER || 'gemini';
  logger.info(`Generating shot list with provider: ${provider}`);

  let result;
  try {
    if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      result = await generateWithGemini(inputs);
    } else if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      result = await generateWithOpenAI(inputs);
    } else if (process.env.ANTHROPIC_API_KEY) {
      result = await generateWithAnthropic(inputs);
    } else {
      throw new Error('No AI API key configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY in your .env file.');
    }
  } catch (err) {
    logger.error('AI API failed, falling back to mock data', { error: err.message });
    // Fallback Mock Data so the UI doesn't break during API outages
    result = {
      text: JSON.stringify({
        scene_summary: `A breathtaking cinematic moment. (DEBUG ERROR: ${err.message})`,
        shots: [
          {
            shot_number: 1,
            shot_type: "Wide Establishing Shot",
            camera_angle: "High-angle",
            camera_movement: "Slow Crane Push-In",
            lens: "24mm - for sweeping environmental context",
            framing: "Subject centered in the lower third, dwarfed by the stunning background.",
            description: inputs.scene_description || "The subject moves through the vast landscape, creating a sense of scale and wonder.",
            coverage_notes: "Ensure the sky is not blown out; use ND filters as needed.",
            estimated_duration: "8 seconds"
          },
          {
            shot_number: 2,
            shot_type: "Medium Close-Up",
            camera_angle: "Eye-level",
            camera_movement: "Static with subtle handheld breathe",
            lens: "50mm - natural field of view",
            framing: "Head and shoulders, capturing the subject's emotional reaction.",
            description: "Subject stops and looks around, reflecting on the environment.",
            coverage_notes: "Keep the background softly out of focus with a nice bokeh.",
            estimated_duration: "4 seconds"
          }
        ],
        director_notes: "Maintain a sense of awe and scale. The pacing should be deliberate and majestic.",
        production_notes: "Will need a crane or drone for the opening shot. Schedule for golden hour.",
        lighting_concept: "Natural available light, utilizing the golden hour sun for a warm, cinematic flare.",
        equipment_list: ["Drone or Crane", "Alexa Mini", "24mm & 50mm Prime Lenses", "ND Filters"]
      }),
      tokensUsed: 0,
      model: 'mock-fallback-model'
    };
  }

  // Parse JSON from response
  let parsed;
  try {
    // Clean potential markdown fences
    const clean = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(clean);
  } catch (e) {
    logger.error('Failed to parse AI JSON response', { text: result.text, error: e.message });
    throw new Error('AI returned invalid JSON. Please try again.');
  }

  return { data: parsed, tokensUsed: result.tokensUsed, model: result.model };
}

module.exports = { generateShotList };
