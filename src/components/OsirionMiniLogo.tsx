import React from 'react';
import { Lottie } from 'lottie-react';
import osirionAnimationData from '../data/osirionLogoAnimation.json';

interface OsirionMiniLogoProps {
  className?: string;
  size?: number;
}

export const OsirionMiniLogo: React.FC<OsirionMiniLogoProps> = ({
  className = 'w-10 h-10',
  size = 40,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl bg-black overflow-hidden flex items-center justify-center p-0.5 shadow-sm border border-slate-800 ${className}`}
    >
      <Lottie
        src={osirionAnimationData as any}
        loop
        autoplay
        className="w-full h-full object-contain scale-125"
      />
    </div>
  );
};
