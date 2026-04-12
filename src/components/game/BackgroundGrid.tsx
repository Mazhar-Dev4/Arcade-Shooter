import React from 'react';

export const BackgroundGrid: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
    {/* Grid lines */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" className="text-primary" />
    </svg>
    {/* Ambient glow spots */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-[100px]" />
  </div>
);
