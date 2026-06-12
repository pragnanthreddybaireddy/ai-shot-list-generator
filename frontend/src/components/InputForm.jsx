import React, { useState, useEffect } from 'react';
import { ChevronDown, Sparkles, FileText, Settings2 } from 'lucide-react';
import { getTemplates } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const fields = [
  {
    name: 'scene_description',
    label: 'Scene Description',
    placeholder: 'Describe what happens in this scene — action, emotion, environment, characters...',
    rows: 8,
    required: true,
    hint: 'Be specific about the emotional beat and visual goal of the scene. The AI will determine the best camera angles, lenses, and production requirements.'
  }
];

export default function InputForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    scene_description: '',
    director_style: '',
    cinematic_tone: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    getTemplates().then(r => setTemplates(r.data || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.scene_description.trim()) errs.scene_description = 'Scene description is required';
    else if (form.scene_description.trim().length < 10) errs.scene_description = 'Please provide more detail (min 10 characters)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const applyTemplate = (tpl) => {
    setForm(f => ({
      ...f,
      scene_description: tpl.scene_description || ''
    }));
    setShowTemplates(false);
    setErrors({});
  };

  const inputBase = `w-full px-5 py-4 rounded-xl text-sm transition-all font-body bg-black/40 border border-white/10 text-white placeholder-studio-muted focus:border-studio-neon focus:ring-1 focus:ring-studio-neon outline-none backdrop-blur-sm`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 lg:p-10 relative overflow-hidden group"
    >
      {/* Background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-studio-purple to-studio-neon rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative">
        {/* Header with templates */}
        <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              SCENE INPUT
            </h2>
            <p className="text-sm mt-2 text-studio-muted">
              Describe your scene and let AI craft the perfect shot list
            </p>
          </div>

          {/* Templates dropdown */}
          {templates.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplates(o => !o)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-studio-muted hover:border-studio-neon hover:text-white bg-black/40 backdrop-blur-sm transition-all"
              >
                <FileText size={15} />
                Templates
                <motion.div animate={{ rotate: showTemplates ? 180 : 0 }}>
                  <ChevronDown size={14} />
                </motion.div>
              </button>

              <AnimatePresence>
                {showTemplates && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-3 w-72 rounded-xl border border-white/10 shadow-2xl z-20 bg-studio-dark/95 backdrop-blur-xl overflow-hidden"
                  >
                    {templates.map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className="w-full text-left px-5 py-4 transition-colors hover:bg-white/5 border-b border-white/5 last:border-0"
                      >
                        <div className="font-medium text-sm text-white">{tpl.name}</div>
                        <div className="text-xs mt-1 text-studio-muted line-clamp-2">{tpl.description}</div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {fields.map(({ name, label, placeholder, rows, required, hint }) => (
            <div key={name}>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">
                  {label}
                  {required && <span className="text-studio-magenta ml-1">*</span>}
                </label>
                {form[name] && (
                  <span className="text-xs text-studio-muted">
                    {form[name].length} chars
                  </span>
                )}
              </div>

              <textarea
                name={name}
                value={form[name]}
                onChange={e => {
                  setForm(f => ({ ...f, [name]: e.target.value }));
                  if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
                }}
                placeholder={placeholder}
                rows={rows}
                className={`${inputBase} ${errors[name] ? '!border-studio-magenta' : ''}`}
              />

              {errors[name] && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-studio-magenta text-xs mt-2 flex items-center gap-1">
                  <span>⚠</span> {errors[name]}
                </motion.p>
              )}

              {hint && !errors[name] && (
                <p className="text-xs mt-2 text-studio-muted/70">
                  💡 {hint}
                </p>
              )}
            </div>
          ))}

          {/* Advanced Settings Toggle */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-studio-muted hover:text-white transition-colors font-medium"
            >
              <Settings2 size={16} />
              Advanced Settings
              <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                <ChevronDown size={14} />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-xl border border-white/5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Director Style</label>
                      <select
                        name="director_style"
                        value={form.director_style}
                        onChange={e => setForm(f => ({ ...f, director_style: e.target.value }))}
                        className={inputBase + ' appearance-none cursor-pointer'}
                      >
                        <option value="">Standard Professional</option>
                        <option value="Christopher Nolan (Epic / IMAX / High Contrast)">Christopher Nolan (Epic / IMAX)</option>
                        <option value="Wes Anderson (Symmetrical / Pastel / Quirky)">Wes Anderson (Symmetrical / Pastel)</option>
                        <option value="Denis Villeneuve (Brutalist / Atmospheric / Scale)">Denis Villeneuve (Atmospheric / Scale)</option>
                        <option value="Quentin Tarantino (Dynamic / Stylized / Crash Zooms)">Quentin Tarantino (Stylized / Dynamic)</option>
                        <option value="David Fincher (Precise / Moody / Locked Off)">David Fincher (Precise / Moody)</option>
                        <option value="Greta Gerwig (Vibrant / Theatrical / Intimate)">Greta Gerwig (Vibrant / Intimate)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Cinematic Tone</label>
                      <select
                        name="cinematic_tone"
                        value={form.cinematic_tone}
                        onChange={e => setForm(f => ({ ...f, cinematic_tone: e.target.value }))}
                        className={inputBase + ' appearance-none cursor-pointer'}
                      >
                        <option value="">Neutral / Natural</option>
                        <option value="Dark & Gritty (High Contrast / Low Key)">Dark & Gritty</option>
                        <option value="Bright & Uplifting (High Key / Colorful)">Bright & Uplifting</option>
                        <option value="Surreal & Dreamy (Soft Focus / Halation)">Surreal & Dreamy</option>
                        <option value="Documentary / Verite (Handheld / Raw)">Documentary / Verite</option>
                        <option value="Neon Noir (Cyberpunk / High Saturation)">Neon Noir</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4">
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-display text-xl tracking-widest transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                ${loading
                  ? 'bg-studio-dark border border-white/10 cursor-not-allowed text-studio-muted'
                  : 'bg-hero-gradient text-white shadow-[0_0_40px_rgba(0,240,255,0.3)] hover:shadow-[0_0_60px_rgba(0,240,255,0.5)] border border-white/20'
                }`}
            >
              {!loading && (
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              )}
              
              <div className="relative z-10 flex items-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-studio-muted border-t-transparent rounded-full animate-spin" />
                    GENERATING...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    GENERATE SHOT LIST
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
