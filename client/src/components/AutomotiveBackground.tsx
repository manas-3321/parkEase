import React from 'react';

export const AutomotiveBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Subtle Ambient Glow Orbs */}
      <div className="absolute top-[5%] left-[10%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[140px]" />
      <div className="absolute top-[40%] right-[5%] w-[650px] h-[650px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[160px]" />
      <div className="absolute bottom-[5%] left-[20%] w-[600px] h-[600px] bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-[150px]" />

      {/* 2. Technical CAD Grid Pattern Overlay */}
      <svg
        className="w-full h-full absolute inset-0 text-indigo-900/15 dark:text-indigo-200/20"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <pattern id="porscheBlueprintGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#porscheBlueprintGrid)" />
      </svg>

      {/* 3. YOUR AI ENLARGED PORSCHE GT3 RS TECHNICAL BLUEPRINT IMAGE (SUBTLE WATERMARK) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 dark:opacity-8 mix-blend-multiply dark:invert dark:mix-blend-screen transition-all filter brightness-75">
        <img
          src="/assets/porsche_blueprint_hd.jpg"
          alt="Enlarged Porsche GT3 RS Technical Blueprint Background"
          className="w-full h-full object-cover filter brightness-75"
        />
      </div>
    </div>
  );
};
