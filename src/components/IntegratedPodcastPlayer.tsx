import React, { useState, useEffect, useRef } from 'react';
import { LibraryAudio } from '../types/library';
import { AUDIO_PODCASTS_TRANSCRIPTS, AudioTranscriptEpisode } from '../data/bookContentData';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  Maximize2,
  Minimize2,
  Headphones,
  Sparkles,
  Zap,
  Flame,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
} from 'lucide-react';

interface IntegratedPodcastPlayerProps {
  audio: LibraryAudio;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const IntegratedPodcastPlayer: React.FC<IntegratedPodcastPlayerProps> = ({
  audio,
  onClose,
  onNext,
  onPrevious,
}) => {
  const episode: AudioTranscriptEpisode = AUDIO_PODCASTS_TRANSCRIPTS[audio.id] || {
    audioId: audio.id,
    title: audio.title,
    speaker: audio.speakerName || 'Mentor Osirion',
    duration: audio.durationFormatted || '10m 00s',
    category: audio.category?.toUpperCase() || 'FORGE',
    ambientSound: 'Méditation Stoïcienne & Fréquence Alpha 432Hz',
    sections: [
      {
        timestamp: '00:00',
        heading: 'Préparation Mentale',
        speech: audio.subtitle || 'Capsule de sagesse stoïcienne et de rigueur quotidienne.',
      },
      {
        timestamp: '03:30',
        heading: 'La Discipline Quotidienne',
        speech:
          'L’effort que vous fournissez aujourd’hui est le ciment de votre liberté de demain. Ne laissez aucune distraction dévier votre trajectoire.',
      },
      {
        timestamp: '07:00',
        heading: 'Clôture & Engagement',
        speech:
          'Respirez profondément, verrouillez votre focus et commencez votre prochaine série. Que la force guide votre geste.',
      },
    ],
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audio.durationSeconds || 600);
  const [volume, setVolume] = useState(0.85);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'transcript'>('player');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6'
          : 'bottom-4 right-4 left-4 sm:left-auto sm:w-[480px]'
      }`}
    >
      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col ${
          isExpanded ? 'w-full max-w-2xl max-h-[90vh]' : 'w-full'
        }`}
      >
        <audio
          ref={audioRef}
          src={audio.audioUrl?.startsWith('http') ? audio.audioUrl : `/${audio.audioUrl?.replace(/^\/?/, '')}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />
        {/* PLAYER HEADER */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Lecteur Audio & Podcast Intégré
              </span>
              <h4 className="font-black text-xs sm:text-sm text-slate-100 truncate">{audio.title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
              title={isExpanded ? 'Réduire le lecteur' : 'Agrandir en mode studio'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                onClose();
              }}
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
              title="Fermer le lecteur"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* EXPANDED VIEW WITH TRANSCRIPT & WAVEFORM */}
        {isExpanded && (
          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('player')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'player'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Vue Studio</span>
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'transcript'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Transcription Intégrale</span>
              </button>
            </div>

            {activeTab === 'player' ? (
              <div className="space-y-6 text-center">
                {/* Visualizer Artwork */}
                <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/20 to-purple-600/30 border border-amber-500/30 flex items-center justify-center shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent animate-pulse" />
                  <Headphones className="w-14 h-14 text-amber-400 relative z-10" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{audio.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{audio.subtitle}</p>
                  <p className="text-[11px] text-amber-400 font-semibold mt-2">
                    Intervenant : {episode.speaker} • {episode.ambientSound}
                  </p>
                </div>

                {/* Animated Audio Waveform */}
                <div className="flex items-center justify-center gap-1 h-10 px-4">
                  {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30, 85, 60, 40, 75, 90, 35, 65].map(
                    (height, i) => (
                      <span
                        key={i}
                        className={`w-1.5 rounded-full bg-amber-400 transition-all duration-300 ${
                          isPlaying ? 'opacity-100' : 'opacity-30'
                        }`}
                        style={{
                          height: isPlaying ? `${Math.max(15, (height * (i % 2 === 0 ? 0.9 : 1.1)))}%` : '20%',
                          animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            ) : (
              /* Synchronized Transcript View */
              <div className="space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  Transcription Intégrale de la Capsule Audio :
                </span>
                <div className="space-y-3">
                  {episode.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300">{sec.heading}</span>
                        <span className="font-mono text-[10px] text-slate-400">{sec.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{sec.speech}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONTROLS AREA */}
        <div className="p-4 bg-slate-950/40 space-y-3 shrink-0">
          {/* Progress Bar & Seek Slider */}
          <div className="space-y-1">
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{formatSeconds(currentTime)}</span>
              <span>{audio.durationFormatted || formatSeconds(duration)}</span>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Speed Rate */}
            <div className="flex items-center gap-1">
              {[1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition ${
                    playbackRate === rate
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Main playback buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkip(-15)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
                title="Reculer de 15 secondes"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!audio.audioUrl}
                className="w-10 h-10 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 transition transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={() => handleSkip(15)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
                title="Avancer de 15 secondes"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-white p-1"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-14 sm:w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
