import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getHistoryById } from '../utils/api';
import OutputDisplay from '../components/OutputDisplay';
import ClapperLoader from '../components/ClapperLoader';
import toast from 'react-hot-toast';

export default function HistoryDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistoryById(id)
      .then(res => setData(res.data))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/history" className="flex items-center gap-2 text-sm text-studio-muted hover:text-studio-neon transition-colors">
          <ArrowLeft size={16} /> Back to History
        </Link>
      </div>

      {loading && <ClapperLoader message="Loading generation..." />}
      {data && (
        <>
          <div className="mb-8">
            <h1 className="font-display text-3xl tracking-wider text-studio-text">GENERATION DETAIL</h1>
            <p className="text-sm mt-1 text-studio-muted">
              {new Date(data.created_at).toLocaleString()} · {data.model}
            </p>
          </div>
          <OutputDisplay
            result={{ success: true, data: data.result, model: data.model }}
            inputs={data.inputs}
            onRegenerate={() => {}}
            generationId={id}
          />
        </>
      )}
    </div>
  );
}
