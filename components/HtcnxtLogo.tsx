import React, { useState } from 'react';
import { 
  HTCNXT_LOGO_ACTUAL_BASE64, 
  HTCNXT_LOGO_LIGHT_BASE64,
  HTC_GLOBAL_SERVICES_LOGO_BASE64 
} from '../data/logoAssets';

interface HtcnxtLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'badge';
  theme?: 'dark' | 'light';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const HtcnxtLogo: React.FC<HtcnxtLogoProps> = ({
  variant = 'full',
  theme = 'light',
  className = '',
  size = 'md'
}) => {
  const isDark = theme === 'dark';
  const [loadError, setLoadError] = useState(false);

  if (variant === 'icon' || variant === 'compact') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <div className="px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center gap-0.5 shadow-sm">
          <span className="text-[#EA251B] font-black text-xs tracking-tighter uppercase font-sans">
            HTC
          </span>
        </div>
      </div>
    );
  }

  const heightClass = {
    sm: 'h-6 md:h-7',
    md: 'h-8 md:h-9',
    lg: 'h-10 md:h-11',
    xl: 'h-12 md:h-14'
  }[size];

  // Base64 embedded strings guarantee zero 404s and immediate rendering
  const primarySrc = isDark ? HTCNXT_LOGO_LIGHT_BASE64 : HTCNXT_LOGO_ACTUAL_BASE64;
  const secondarySrc = isDark ? HTCNXT_LOGO_LIGHT_BASE64 : HTC_GLOBAL_SERVICES_LOGO_BASE64;

  if (loadError) {
    // Ultra-reliable High-Definition Inline SVG Fallback
    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        <div className="flex items-center px-3 py-1.5 rounded-xl border bg-white border-slate-200 shadow-xs">
          <span className="text-[#EA251B] font-black text-lg md:text-xl tracking-tighter uppercase font-sans">
            HTC
          </span>
          <span className="text-slate-900 font-black text-lg md:text-xl tracking-tight uppercase ml-1 font-sans">
            NXT
          </span>
          <div className="h-4 w-px bg-slate-300 mx-2"></div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Global Services
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {isDark ? (
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 shadow-inner group hover:border-slate-600 transition-all">
          <img 
            src={primarySrc} 
            alt="HTC Global Services • HTCNXT Brand Logo" 
            className={`${heightClass} w-auto object-contain max-w-[240px] transition-transform group-hover:scale-[1.02]`}
            onError={() => setLoadError(true)}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all group">
          <img 
            src={primarySrc} 
            alt="HTC Global Services • HTCNXT Brand Logo" 
            className={`${heightClass} w-auto object-contain max-w-[260px] transition-transform group-hover:scale-[1.02]`}
            onError={(e) => {
              // Try the secondary official HTC logo before giving up
              const target = e.currentTarget;
              if (target.src !== secondarySrc) {
                target.src = secondarySrc;
              } else {
                setLoadError(true);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default HtcnxtLogo;
