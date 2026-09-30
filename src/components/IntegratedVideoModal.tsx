import React, { useState } from 'react';
import { parseVideoUrl } from '../utils/videoUtils';
import {
  X,
  Maximize2,
  Minimize2,
  Tv,
  Sparkles,
  Share2,
  Check,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface IntegratedVideoModalProps {
  title: string;
  description?: string;
  videoUrl: string;
  displayDate?: string;
  arc?: string;
  onClose: () => void;
}

export const IntegratedVideoModal: React.FC<IntegratedVideoModalProps> = ({
  title,
  description,
  videoUrl,
  displayDate,
  arc,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoConfig = parseVideoUrl(videoUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-6'
      } bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200`}
    >
      <div
        className={`w-full ${
          isFullscreen ? 'h-full rounded-none' : 'max-w-4xl max-h-[92vh] rounded-3xl'
        } bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-white`}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Lecteur Vidéo Intégré Osirion
                </span>
                {arc && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                    {arc}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-white truncate">{title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
              title="Copier le lien source"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copié !' : 'Partager'}</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
              title="Fermer le lecteur"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* EMBEDDED VIDEO VIEWPORT */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative min-h-[300px] sm:min-h-[420px]">
          {videoConfig.type === 'youtube' || videoConfig.type === 'vimeo' ? (
            <iframe
              src={videoConfig.embedUrl}
              title={title}
              className="w-full h-full aspect-video border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={videoConfig.embedUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full max-h-[75vh] object-contain"
            >
              Votre navigateur ne supporte pas la lecture directe de cette vidéo.
            </video>
          )}
        </div>

        {/* MODAL FOOTER INFO */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-amber-400">
              Source : {videoConfig.type.toUpperCase()} • Lecture Directe dans le Site
            </span>
            {displayDate && <span className="font-mono text-[11px]">{displayDate}</span>}
          </div>
          {description && (
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
