import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Upload,
  Link,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
  Target,
  Activity,
  ShieldAlert,
  Youtube,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Gauge,
  Sliders,
  Check,
} from 'lucide-react';
import { ExerciseItem, DojoTargetArea } from '../types/admin';
import { DOJO_TARGET_AREAS } from '../data/mockData';

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'empty';
  embedUrl?: string;
  directUrl?: string;
  rawUrl: string;
}

/**
 * Parses any video URL (YouTube, Vimeo, Cloud Storage MP4, WebM, Blob, Data URI)
 */
export function parseVideoUrl(url?: string): VideoInfo {
  if (!url || !url.trim()) {
    return { type: 'empty', rawUrl: '' };
  }
  const trimmed = url.trim();

  // YouTube match: standard watch, short URL, embed, or shorts
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      rawUrl: trimmed,
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&loop=1`,
      rawUrl: trimmed,
    };
  }

  // Otherwise direct video (MP4, WebM, Blob, Data URL, Cloud Storage CDN)
  return {
    type: 'direct',
    directUrl: trimmed,
    rawUrl: trimmed,
  };
}

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
  showKinematicOverlay?: boolean;
  exercise?: ExerciseItem;
}

export const ExerciseVideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoPlay = true,
  loop = true,
  className = '',
  showKinematicOverlay = false,
  exercise,
}) => {
  const videoInfo = parseVideoUrl(url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(loop);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (videoInfo.type === 'empty') {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-8 rounded-2xl border border-slate-800 text-center ${className}`}
      >
        <Film className="w-12 h-12 text-slate-600 mb-3" />
        <p className="text-sm font-semibold text-slate-300">Aucune vidéo associée</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Collez un lien YouTube, Cloud Storage MP4 ou importez un fichier vidéo pour visualiser l'exécution.
        </p>
      </div>
    );
  }

  if (videoInfo.type === 'youtube' || videoInfo.type === 'vimeo') {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-black shadow-md ${className}`}>
        <div className="relative w-full aspect-video">
          <iframe
            src={videoInfo.embedUrl}
            title="Démonstration Vidéo"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Overlay Kinematics */}
        {showKinematicOverlay && exercise && (
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
            <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Flexion : {exercise.minAngle}°</span>
            </span>
            <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Extension : {exercise.maxAngle}°</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Direct Video (HTML5)
  return (
    <div className={`relative group overflow-hidden rounded-2xl bg-slate-950 shadow-md ${className}`}>
      {loadError ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 aspect-video">
          <AlertCircle className="w-10 h-10 text-amber-500 mb-2" />
          <p className="text-xs font-semibold text-slate-200">Impossible de charger le flux vidéo direct</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
            Le fichier est soit restreint en accès CORS, soit le format n'est pas supporté. Vous pouvez utiliser un lien YouTube ou importer un fichier local.
          </p>
          <a
            href={videoInfo.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            <span>Ouvrir le flux directement</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      ) : (
        <div className="relative aspect-video flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={videoInfo.directUrl}
            autoPlay={autoPlay}
            loop={isLooping}
            muted={isMuted}
            playsInline
            onError={() => setLoadError(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
          />

          {/* Kinematic Overlay */}
          {showKinematicOverlay && exercise && (
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
              <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Flexion : {exercise.minAngle}°</span>
              </span>
              <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Extension : {exercise.maxAngle}°</span>
              </span>
            </div>
          )}

          {/* Controls Bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 flex items-center justify-between gap-3 opacity-90 hover:opacity-100 transition">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-xs transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-xs transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Speed Controller for form breakdown */}
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-xs">
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] text-white/70 font-medium">Vitesse :</span>
                {[0.5, 0.75, 1, 1.25].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                      playbackSpeed === speed
                        ? 'bg-blue-600 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                  isLooping ? 'bg-blue-600/80 text-white' : 'bg-white/10 text-white/60 hover:text-white'
                }`}
                title="Répéter en boucle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[10px]">Boucle</span>
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-xs transition"
                title="Plein écran"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ExerciseVideoModalProps {
  exercise: ExerciseItem | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: 'superadmin' | 'auditor';
  onUpdateExerciseVideo: (exerciseId: string, newVideoUrl: string) => void;
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  exercise,
  isOpen,
  onClose,
  userRole,
  onUpdateExerciseVideo,
}) => {
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [videoInputUrl, setVideoInputUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (exercise) {
      setVideoInputUrl(exercise.videoDemoUrl || '');
      setIsEditingVideo(false);
      setUploadFeedback(null);
    }
  }, [exercise]);

  if (!isOpen || !exercise) return null;

  const targetAreaInfo = DOJO_TARGET_AREAS.find((a) => a.id === exercise.targetArea);

  const handleSaveVideoUrl = (urlToSave?: string) => {
    const finalUrl = (urlToSave !== undefined ? urlToSave : videoInputUrl).trim();
    if (!finalUrl) return;
    onUpdateExerciseVideo(exercise.id, finalUrl);
    setUploadFeedback('Vidéo associée et synchronisée avec succès !');
    setIsEditingVideo(false);
    setTimeout(() => setUploadFeedback(null), 3500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Create direct local blob URL for immediate preview and testing
    const localVideoUrl = URL.createObjectURL(file);
    setVideoInputUrl(localVideoUrl);
    handleSaveVideoUrl(localVideoUrl);
    setIsUploading(false);
    setUploadFeedback(`Fichier « ${file.name} » chargé et attaché à l'exercice !`);
    setTimeout(() => setUploadFeedback(null), 4000);
  };

  // Curated verified calisthenics tutorials / demo links
  const samplePresets = [
    {
      label: 'Pompes Standard (YouTube HD)',
      url: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    },
    {
      label: 'Tractions Pronation (YouTube HD)',
      url: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    },
    {
      label: 'Dips aux Parallèles (YouTube HD)',
      url: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
    },
    {
      label: 'Muscle-Up Technique (YouTube HD)',
      url: 'https://www.youtube.com/watch?v=yW63V6XbKvg',
    },
    {
      label: 'Pistol Squat (YouTube HD)',
      url: 'https://www.youtube.com/watch?v=qDcniqddTeE',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{exercise.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${targetAreaInfo?.badgeColor}`}>
                  {targetAreaInfo?.label || exercise.targetArea}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {exercise.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Démonstration Technique & Arbitrage Dojo IA</span>
                <span>•</span>
                <span className="text-indigo-600 font-medium">{exercise.trainingType}</span>
                <span>•</span>
                <span className="text-cyan-700 font-medium">
                  {exercise.executionMode === 'MODE_VISION' ? 'Caméra ML Kit Active' : 'Mode Guide 3D'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'superadmin' && (
              <button
                type="button"
                onClick={() => setIsEditingVideo(!isEditingVideo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isEditingVideo
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isEditingVideo ? 'Fermer l\'éditeur' : 'Changer la vidéo'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {uploadFeedback && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2 font-medium shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadFeedback}</span>
          </div>
        )}

        {/* Video Editor Panel (Collapsible) */}
        {isEditingVideo && userRole === 'superadmin' && (
          <div className="p-4 bg-blue-50/70 border-b border-blue-200/70 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Associer ou remplacer la vidéo de démonstration</span>
              </span>
              <span className="text-[11px] text-blue-700">
                Formats acceptés : Liens YouTube, Vimeo, MP4 direct, Cloud Storage ou fichier local
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={videoInputUrl}
                  onChange={(e) => setVideoInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou https://.../video.mp4"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-blue-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSaveVideoUrl()}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  Enregistrer ce lien
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-blue-300 text-blue-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Importer un fichier (.mp4)</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Suggestions rapides :</span>
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setVideoInputUrl(preset.url);
                    handleSaveVideoUrl(preset.url);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-blue-700 text-[10px] font-medium transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Body: Player + Info Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Video Player */}
          <ExerciseVideoPlayer
            url={exercise.videoDemoUrl}
            exercise={exercise}
            showKinematicOverlay={true}
          />

          {/* Kinematic Analysis & Movement Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Repetition Phases & State Machine */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Points de Passage IA</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <span className="text-slate-500 font-medium">1. Départ :</span>
                  <span className="font-semibold text-slate-800">{exercise.stateMachineLabels?.start || 'POSITION_DÉPART'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <span className="text-slate-500 font-medium">2. Inflection :</span>
                  <span className="font-bold text-amber-600">{exercise.stateMachineLabels?.inflection || 'FLEXION_MAX'}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <span className="text-slate-500 font-medium">3. Validation :</span>
                  <span className="font-bold text-emerald-600">{exercise.stateMachineLabels?.completion || 'RÉPÉTITION_VALIDÉE'}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Kinematic Tolerances */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs">
                <Target className="w-4 h-4 text-cyan-600" />
                <span>Arbitrage Angulaire</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <span className="text-slate-500 font-medium">Flexion min (ROM) :</span>
                  <span className="font-bold text-blue-700">{exercise.minAngle}°</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <span className="text-slate-500 font-medium">Extension max :</span>
                  <span className="font-bold text-blue-700">{exercise.maxAngle}°</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <span className="text-slate-500 font-medium">Anti-balancier :</span>
                  <span className="font-bold text-rose-700">{exercise.strictMode ? 'Strict (Kipping Interdit)' : 'Toléré'}</span>
                </div>
              </div>
            </div>

            {/* Box 3: Target Muscles & Equipment */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-xs">
                <Layers className="w-4 h-4 text-violet-600" />
                <span>Chaîne Musculaire</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/60">
                {exercise.targetMuscles.join(', ')}
              </p>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                <span>Matériel :</span>
                <span className="font-semibold text-slate-800">{exercise.equipment}</span>
              </div>
            </div>
          </div>

          {/* Instructions Block */}
          {exercise.instructions && (
            <div className="bg-blue-50/50 rounded-2xl border border-blue-200/60 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-950 font-semibold text-xs">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Consignes de Sécurité & Posture</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {exercise.instructions}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-xs sm:max-w-md">Source : {exercise.videoDemoUrl}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
