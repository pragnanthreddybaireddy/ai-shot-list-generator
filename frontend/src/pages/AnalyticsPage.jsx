import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, TrendingUp, Star, Film, AlertCircle } from 'lucide-react';
import { getAnalytics } from '../utils/api';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border p-6 bg-studio-card border-studio-border backdrop-blur-md">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-studio-neon/10">
        <Icon size={20} className="text-studio-neon" />
      </div>
      <div className="text-3xl font-display tracking-wider text-studio-text">{value}</div>
      <div className="text-sm font-medium mt-1 text-studio-text">{label}</div>
      {sub && <div className="text-xs mt-0.5 text-studio-muted">{sub}</div>}
    </div>
  );
}

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const chartStyle = {
    cartesianGrid: '#2a2a3d',
    axis: '#94a3b8',
    tooltip: {
      contentStyle: {
        background: '#1a1a28',
        border: '1px solid #2a2a3d',
        borderRadius: '12px',
        color: '#e2e8f0'
      }
    }
  };

  const card = 'bg-studio-card border-studio-border backdrop-blur-md';
  const text = 'text-studio-text';
  const muted = 'text-studio-muted';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-2xl border ${card} p-6`}>
              <div className="skeleton h-8 w-16 mb-2" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        <div className={`rounded-2xl border ${card} p-8 text-center`}>
          <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const ratingData = data?.ratingDistribution?.map(r => ({
    name: `${r.rating}★`,
    count: r.count
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24 animate-fade-in">
      <div className="mb-8">
        <h1 className={`font-display text-4xl tracking-wider ${text}`}>ANALYTICS</h1>
        <p className={`text-sm mt-1 ${muted}`}>Track usage and quality metrics</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Film} label="Total Generations" value={data?.totalGenerations || 0} />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={data?.avgRating ? `${data.avgRating}/5` : 'N/A'}
          sub={`From ${data?.totalFeedback || 0} ratings`}
        />
        <StatCard
          icon={TrendingUp}
          label="Last 30 Days"
          value={data?.dailyGenerations?.reduce((s, d) => s + d.count, 0) || 0}
          sub="generations"
        />
        <StatCard
          icon={BarChart3}
          label="Feedback Rate"
          value={data?.totalGenerations ? `${Math.round((data.totalFeedback / data.totalGenerations) * 100)}%` : '0%'}
          sub="of generations rated"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Daily generations */}
        <div className={`rounded-2xl border ${card} p-6`}>
          <h3 className={`font-display text-lg tracking-wider mb-6 ${text}`}>DAILY GENERATIONS</h3>
          {data?.dailyGenerations?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.dailyGenerations}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.cartesianGrid} />
                <XAxis dataKey="date" tick={{ fill: chartStyle.axis, fontSize: 11 }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fill: chartStyle.axis, fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...chartStyle.tooltip} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Generations" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className={`text-center py-12 ${muted}`}>No data yet</p>}
        </div>

        {/* Quality trend */}
        <div className={`rounded-2xl border ${card} p-6`}>
          <h3 className={`font-display text-lg tracking-wider mb-6 ${text}`}>QUALITY TREND</h3>
          {data?.qualityTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.cartesianGrid} />
                <XAxis dataKey="date" tick={{ fill: chartStyle.axis, fontSize: 11 }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis domain={[0, 5]} tick={{ fill: chartStyle.axis, fontSize: 11 }} />
                <Tooltip {...chartStyle.tooltip} />
                <Line type="monotone" dataKey="avg_rating" stroke="#f59e0b" strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', r: 4 }} name="Avg Rating" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className={`text-center py-12 ${muted}`}>Rate some generations to see trends</p>}
        </div>
      </div>

      {/* Rating distribution + Recent feedback */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className={`rounded-2xl border ${card} p-6`}>
          <h3 className={`font-display text-lg tracking-wider mb-6 ${text}`}>RATING DISTRIBUTION</h3>
          {ratingData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={ratingData} dataKey="count" cx="50%" cy="50%" outerRadius={60} strokeWidth={0}>
                    {ratingData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...chartStyle.tooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {ratingData.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className={muted}>{r.name}</span>
                    <span className={`font-medium ${text}`}>{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className={`text-center py-12 ${muted}`}>No ratings yet</p>}
        </div>

        <div className={`rounded-2xl border ${card} p-6`}>
          <h3 className={`font-display text-lg tracking-wider mb-4 ${text}`}>RECENT FEEDBACK</h3>
          {data?.recentFeedback?.length > 0 ? (
            <div className="space-y-3">
              {data.recentFeedback.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-studio-dark">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} size={12} className={s < f.rating ? 'text-studio-neon fill-studio-neon' : 'text-gray-600'} />
                      ))}
                    </div>
                    <span className={`text-xs ${muted}`}>{new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                  {f.comment && <p className={`text-xs ${muted} line-clamp-2`}>{f.comment}</p>}
                  <p className="text-xs mt-1 text-studio-muted line-clamp-1">
                    Scene: {f.scene_description}
                  </p>
                </div>
              ))}
            </div>
          ) : <p className={`text-center py-8 ${muted}`}>No feedback submitted yet</p>}
        </div>
      </div>
    </div>
  );
}
