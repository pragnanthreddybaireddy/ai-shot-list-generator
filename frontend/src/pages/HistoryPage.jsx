import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Trash2, Eye, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import { getHistory, deleteHistory } from '../utils/api';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHistory(page, limit);
      setHistory(res.data || []);
      setTotal(res.pagination?.total || res.data?.length || 0);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Delete this generation?')) return;
    try {
      await deleteHistory(id);
      toast.success('Deleted');
      fetchHistory();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const card = 'bg-studio-card border-studio-border backdrop-blur-md';
  const text = 'text-studio-text';
  const muted = 'text-studio-muted';

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className={`font-display text-4xl tracking-wider ${text}`}>HISTORY</h1>
        <p className={`text-sm mt-1 ${muted}`}>{total} generation{total !== 1 ? 's' : ''} saved</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`rounded-xl border ${card} p-5`}>
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-studio-border">
          <Film size={48} className={`mx-auto mb-4 opacity-20 ${muted}`} />
          <p className={muted}>No generations yet. <Link to="/" className="text-studio-neon hover:underline">Create your first shot list →</Link></p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <Link
              key={item.id}
              to={`/history/${item.id}`}
              className={`block rounded-xl border ${card} p-5 card-hover transition-all group`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-relaxed line-clamp-2 group-hover:text-studio-neon transition-colors text-studio-text">
                    {item.inputs?.scene_description || 'Untitled Generation'}
                  </p>
                  <div className={`flex items-center gap-4 mt-2 text-xs ${muted}`}>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {item.model_used && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-studio-dark">
                        {item.model_used}
                      </span>
                    )}
                    {item.avg_rating && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star size={11} className="fill-amber-500" />
                        {parseFloat(item.avg_rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="p-2 rounded-lg transition-colors hover:bg-studio-dark text-studio-muted hover:text-studio-neon">
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={e => handleDelete(item.id, e)}
                    className="p-2 rounded-lg transition-colors hover:bg-studio-dark text-studio-muted hover:text-studio-magenta"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-studio-border text-studio-muted hover:text-studio-neon hover:border-studio-neon"
          >
            <ChevronLeft size={16} />
          </button>
          <span className={`text-sm ${muted}`}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-studio-border text-studio-muted hover:text-studio-neon hover:border-studio-neon"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
