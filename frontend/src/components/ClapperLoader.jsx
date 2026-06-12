import React from 'react';

export default function ClapperLoader({ message = 'Generating your shot list...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Clapperboard SVG animation */}
      <div className="relative w-24 h-20">
        <svg viewBox="0 0 100 85" className="w-full h-full">
          {/* Body */}
          <rect x="5" y="25" width="90" height="55" rx="4" fill="#1a1a28" stroke="#2a2a3d" strokeWidth="2"/>
          {/* Lines on body */}
          <line x1="5" y1="40" x2="95" y2="40" stroke="#2a2a3d" strokeWidth="1.5"/>
          <text x="12" y="54" fill="#f59e0b" fontSize="7" fontFamily="monospace">SCENE</text>
          <text x="55" y="54" fill="#f59e0b" fontSize="7" fontFamily="monospace">TAKE</text>
          <text x="12" y="68" fill="#94a3b8" fontSize="9" fontFamily="monospace">001</text>
          <text x="55" y="68" fill="#94a3b8" fontSize="9" fontFamily="monospace">001</text>
          
          {/* Clapper top - animated */}
          <g style={{ transformOrigin: '5px 25px', animation: 'clap 1.2s ease-in-out infinite' }}>
            <rect x="5" y="8" width="90" height="18" rx="3" fill="#0a0a0f" stroke="#2a2a3d" strokeWidth="2"/>
            {/* Stripes */}
            <rect x="8" y="8" width="12" height="18" fill="#f59e0b" opacity="0.9"/>
            <rect x="28" y="8" width="12" height="18" fill="#f59e0b" opacity="0.9"/>
            <rect x="48" y="8" width="12" height="18" fill="#f59e0b" opacity="0.9"/>
            <rect x="68" y="8" width="12" height="18" fill="#f59e0b" opacity="0.9"/>
            <rect x="5" y="8" width="90" height="18" fill="none" stroke="#2a2a3d" strokeWidth="2" rx="3"/>
          </g>
        </svg>
        <style>{`
          @keyframes clap {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-35deg); }
            40% { transform: rotate(0deg); }
            60% { transform: rotate(-15deg); }
            80% { transform: rotate(0deg); }
          }
        `}</style>
      </div>

      <div className="text-center space-y-2">
        <p className="text-amber-500 font-display text-xl tracking-widest">{message}</p>
        <div className="flex items-center gap-1.5 justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-500"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <p className="text-film-muted text-sm">Consulting the director's vision...</p>
      </div>
    </div>
  );
}
