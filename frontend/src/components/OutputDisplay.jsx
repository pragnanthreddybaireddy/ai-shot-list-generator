import React, { useState } from 'react';
import {
  Copy, Download, RefreshCw, FileText, Star, CheckCircle2,
  Camera, Film, Lightbulb, ClipboardList, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { submitFeedback } from '../utils/api';
import { exportTxt, exportPdf, exportCsv } from '../utils/export';

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={`transition-colors ${s <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
          />
        </button>
      ))}
    </div>
  );
}

function ShotRow({ shot, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <React.Fragment>
      <tr
        className="shot-row border-b cursor-pointer transition-colors border-studio-border hover:bg-studio-neon/5"
        onClick={() => setExpanded(e => !e)}
      >
        <td className="px-4 py-3 text-studio-neon font-display text-lg font-bold w-[60px]">{String(shot.shot_number).padStart(2,'0')}</td>
        <td className="px-4 py-3 text-studio-text min-w-[200px]">
          <div className="font-semibold">{shot.shot_type || '—'}</div>
          <div className="text-xs mt-0.5 text-studio-muted">{shot.camera_movement}</div>
        </td>
        <td className="px-4 py-3 text-xs text-studio-muted min-w-[120px]">{shot.camera_angle}</td>
        <td className="px-4 py-3 text-xs text-studio-muted min-w-[150px]">{shot.lens}</td>
        <td className="px-4 py-3 text-xs text-studio-muted max-w-xs truncate">{shot.description}</td>
        <td className="px-4 py-3 w-[100px]">
          <div className="text-xs text-center px-2 py-1 rounded-full bg-studio-dark text-studio-muted whitespace-nowrap">
            {shot.estimated_duration}
          </div>
        </td>
        <td className="px-4 py-3 text-center w-[50px]">
          {expanded ? <ChevronUp size={14} className="text-studio-neon mx-auto" /> : <ChevronDown size={14} className="text-studio-muted mx-auto" />}
        </td>
      </tr>

      {/* Expanded details */}
      {expanded && (
        <tr className="bg-studio-black">
          <td colSpan="7" className="p-0 border-b border-studio-border">
            <div className="px-6 py-5 mx-4 mb-4 rounded-xl bg-studio-dark/80 border border-studio-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {shot.framing && (
                  <div>
                    <p className="text-studio-neon text-xs font-semibold mb-1.5 uppercase tracking-wider">Framing</p>
                    <p className="text-studio-text leading-relaxed">{shot.framing}</p>
                  </div>
                )}
                {shot.coverage_notes && (
                  <div>
                    <p className="text-studio-neon text-xs font-semibold mb-1.5 uppercase tracking-wider">Coverage Notes</p>
                    <p className="text-studio-text leading-relaxed">{shot.coverage_notes}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-studio-neon text-xs font-semibold mb-1.5 uppercase tracking-wider">Full Description</p>
                  <p className="text-studio-text leading-relaxed">{shot.description}</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

export default function OutputDisplay({ result, inputs, onRegenerate, generationId }) {
  const { data } = result;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleCopy = () => {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { icon: '📋' });
  };

  const handleFeedback = async () => {
    if (!rating) return toast.error('Please select a rating');
    setFeedbackLoading(true);
    try {
      await submitFeedback({ generation_id: generationId, rating, comment });
      setFeedbackSent(true);
      toast.success('Thank you for your feedback!', { icon: '⭐' });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const card = 'bg-studio-card border-studio-border backdrop-blur-md';
  const text = 'text-studio-text';
  const muted = 'text-studio-muted';

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Action Bar */}
      <div className={`rounded-2xl border ${card} p-4 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className={`text-sm font-medium ${text}`}>
            Shot list generated — {data.shots?.length || 0} shots
          </span>
          {result.model && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-studio-dark text-studio-muted">
              {result.model}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all border-studio-border text-studio-muted hover:text-studio-neon hover:border-studio-neon">
            <Copy size={13} /> Copy JSON
          </button>
          <button onClick={() => exportTxt(data, inputs)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all border-studio-border text-studio-muted hover:text-studio-neon hover:border-studio-neon">
            <FileText size={13} /> TXT
          </button>
          <button onClick={() => exportPdf(data, inputs)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all border-studio-border text-studio-muted hover:text-studio-neon hover:border-studio-neon">
            <Download size={13} /> PDF
          </button>
          <button onClick={() => exportCsv(data)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all border-studio-border text-studio-muted hover:text-studio-neon hover:border-studio-neon">
            <FileText size={13} /> CSV
          </button>
          <button onClick={onRegenerate}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-amber-500 text-black hover:bg-amber-400 transition-all">
            <RefreshCw size={13} /> Regenerate
          </button>
        </div>
      </div>

      {/* Scene Summary */}
      {data.scene_summary && (
        <div className={`rounded-2xl border ${card} p-6`}>
          <div className="flex items-center gap-2 mb-3">
            <Film size={16} className="text-studio-neon" />
            <h3 className={`font-display text-lg tracking-wider ${text}`}>SCENE SUMMARY</h3>
          </div>
          <p className={`text-sm leading-relaxed ${muted}`}>{data.scene_summary}</p>
        </div>
      )}

      {/* Shot List Table */}
      {data.shots?.length > 0 && (
        <div className={`rounded-2xl border ${card} overflow-hidden`}>
          <div className="px-6 py-4 border-b border-studio-border flex items-center gap-2">
            <Camera size={16} className="text-studio-neon" />
            <h3 className={`font-display text-lg tracking-wider ${text}`}>SHOT LIST</h3>
            <span className={`ml-auto text-xs ${muted}`}>{data.shots.length} shots · Click any row to expand</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full shot-table">
              <thead>
                <tr className="border-b border-studio-border">
                  {['#', 'TYPE / MOVEMENT', 'ANGLE', 'LENS', 'DESCRIPTION', 'DURATION', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold tracking-wider text-studio-muted bg-studio-dark/50">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.shots.map((shot, i) => (
                  <ShotRow key={i} shot={shot} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.director_notes && (
          <div className={`rounded-2xl border ${card} p-6`}>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-amber-500" />
              <h3 className={`font-display text-base tracking-wider ${text}`}>DIRECTOR NOTES</h3>
            </div>
            <p className={`text-sm leading-relaxed ${muted}`}>{data.director_notes}</p>
          </div>
        )}
        {data.production_notes && (
          <div className={`rounded-2xl border ${card} p-6`}>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={16} className="text-amber-500" />
              <h3 className={`font-display text-base tracking-wider ${text}`}>PRODUCTION NOTES</h3>
            </div>
            <p className={`text-sm leading-relaxed ${muted}`}>{data.production_notes}</p>
          </div>
        )}
      </div>

      {/* Lighting + Equipment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.lighting_concept && (
          <div className={`rounded-2xl border ${card} p-6`}>
            <h3 className={`font-display text-base tracking-wider mb-3 ${text}`}>LIGHTING CONCEPT</h3>
            <p className={`text-sm leading-relaxed ${muted}`}>{data.lighting_concept}</p>
          </div>
        )}
        {data.equipment_list?.length > 0 && (
          <div className={`rounded-2xl border ${card} p-6`}>
            <h3 className={`font-display text-base tracking-wider mb-3 ${text}`}>EQUIPMENT LIST</h3>
            <ul className="space-y-1.5">
              {data.equipment_list.map((item, i) => (
                <li key={i} className={`flex items-center gap-2 text-sm ${muted}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className={`rounded-2xl border ${card} p-6`}>
        <h3 className={`font-display text-lg tracking-wider mb-4 ${text}`}>RATE THIS GENERATION</h3>
        {feedbackSent ? (
          <div className="flex items-center gap-3 text-green-400">
            <CheckCircle2 size={20} />
            <span className="font-medium">Thanks for your feedback!</span>
          </div>
        ) : (
          <div className="space-y-4">
            <StarRating value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Optional: What could be improved? What worked well?"
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm border transition-all bg-studio-dark border-studio-border text-studio-text placeholder-studio-muted focus:border-studio-neon"
            />
            <button
              onClick={handleFeedback}
              disabled={!rating || feedbackLoading}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${rating ? 'bg-studio-neon text-black hover:bg-studio-purple' : 'bg-studio-border text-studio-muted cursor-not-allowed'}`}
            >
              {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
