import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

interface VerifiedCertificateSealProps {
  size?: 'sm' | 'md' | 'lg';
  certificateId?: string;
  issueDate?: string;
  className?: string;
}

export const VerifiedCertificateSeal: React.FC<VerifiedCertificateSealProps> = ({
  size = 'md',
  certificateId,
  issueDate,
  className = '',
}) => {
  const sizeMap = {
    sm: { container: 'w-24 h-24', ring: 'w-20 h-20', text: 'text-[7px]', icon: 14, title: 'text-[9px]' },
    md: { container: 'w-36 h-36', ring: 'w-32 h-32', text: 'text-[9px]', icon: 20, title: 'text-xs' },
    lg: { container: 'w-48 h-48', ring: 'w-44 h-44', text: 'text-xs', icon: 28, title: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${currentSize.container} ${className}`} title={certificateId ? `Verified Certificate: ${certificateId}` : 'SkillDNA AI Verified Certificate'}>
      {/* Outer Rosette Glow & Starburst Background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-blue-500/20 blur-md animate-pulse pointer-events-none" />

      {/* SVG Rosette Stamp Badge */}
      <svg className="absolute inset-0 w-full h-full text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="sealGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="sealRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <filter id="sealShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#22d3ee" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 24-point Rosette / Notched Badge Outer Border */}
        <circle cx="80" cy="80" r="76" fill="none" stroke="url(#sealGold)" strokeWidth="2.5" strokeDasharray="3 2" />
        <circle cx="80" cy="80" r="71" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
        <circle cx="80" cy="80" r="66" fill="url(#sealRing)" stroke="url(#sealGold)" strokeWidth="2" filter="url(#sealShadow)" />

        {/* Inner concentric dotted ring */}
        <circle cx="80" cy="80" r="54" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />

        {/* Micro-stars on the perimeter */}
        <polygon points="80,18 82,23 87,23 83,26 85,31 80,28 75,31 77,26 73,23 78,23" fill="#38bdf8" />
        <polygon points="80,142 82,137 87,137 83,134 85,129 80,132 75,129 77,134 73,137 78,137" fill="#38bdf8" />
        <polygon points="18,80 23,82 23,87 26,83 31,85 28,80 31,75 26,77 23,73 23,78" fill="#38bdf8" />
        <polygon points="142,80 137,82 137,87 134,83 129,85 132,80 129,75 134,77 137,73 137,78" fill="#38bdf8" />
      </svg>

      {/* Center Verified Badge & Typography */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-1">
        <span className={`font-black tracking-widest text-cyan-300 uppercase leading-none ${currentSize.title}`}>
          SKILLDNA AI
        </span>

        {/* Center Checkmark Pill */}
        <div className="my-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]">
          <Check className="text-cyan-300" strokeWidth={3} size={currentSize.icon} />
          <span className={`font-black tracking-wider text-white uppercase ${currentSize.title}`}>
            VERIFIED
          </span>
        </div>

        <span className={`font-bold tracking-widest text-slate-300 uppercase leading-tight ${currentSize.text}`}>
          AUTHENTIC
        </span>
        <span className={`font-semibold tracking-wider text-cyan-400/90 uppercase text-[6px] sm:text-[7px]`}>
          CERTIFICATE
        </span>
      </div>
    </div>
  );
};
