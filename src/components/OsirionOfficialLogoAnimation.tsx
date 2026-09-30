import React, { useState, useEffect } from 'react';
import { Lottie } from 'lottie-react';
import osirionAnimationData from '../data/osirionLogoAnimation.json';

interface OsirionOfficialLogoAnimationProps {
  onComplete?: () => void;
  autoDismissMs?: number;
}

export const OsirionOfficialLogoAnimation: React.FC<OsirionOfficialLogoAnimationProps> = ({
  onComplete,
  autoDismissMs = 3800,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!onComplete) return;

    const timerDismiss = setTimeout(() => {
      setIsFadingOut(true);
    }, autoDismissMs - 500);

    const timerComplete = setTimeout(() => {
      onComplete();
    }, autoDismissMs);

    return () => {
      clearTimeout(timerDismiss);
      clearTimeout(timerComplete);
    };
  }, [onComplete, autoDismissMs]);

  const handleSkip = () => {
    if (!onComplete) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black cursor-pointer select-none transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="w-full max-w-[650px] p-4 flex flex-col items-center justify-center">
        <Lottie
          src={osirionAnimationData as any}
          loop
          autoplay
          className="w-full h-auto drop-shadow-2xl"
        />

        <div className="text-center mt-2">
          <span className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase opacity-60 hover:opacity-100 transition-opacity">
            Cliquer pour entrer
          </span>
        </div>
      </div>
    </div>
  );
};
