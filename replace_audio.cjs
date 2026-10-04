const fs = require('fs');

const filePath = 'src/components/IntegratedPodcastPlayer.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the hooks
const hooksStart = `  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesized speech narration engine`;

const hooksEnd = `    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, playbackRate]);`;

const newHooks = `  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  };`;

const startIndex = content.indexOf(hooksStart);
const endIndex = content.indexOf(hooksEnd) + hooksEnd.length;

if (startIndex !== -1 && content.indexOf(hooksEnd) !== -1) {
  content = content.substring(0, startIndex) + newHooks + content.substring(endIndex);
} else {
  console.log("Hooks chunk not found");
}

// 2. Replace handleSeek
const seekOld = `  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };`;

const seekNew = `  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };`;
content = content.replace(seekOld, seekNew);

// 3. Replace handleSkip
const skipOld = `  const handleSkip = (seconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + seconds)));
  };`;

const skipNew = `  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };`;
content = content.replace(skipOld, skipNew);

// 4. Insert <audio> tag
const returnStart = `      <div
        className={\`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col \${
          isExpanded ? 'w-full max-w-2xl max-h-[90vh]' : 'w-full'
        }\`}
      >`;

const returnWithAudio = `      <div
        className={\`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col \${
          isExpanded ? 'w-full max-w-2xl max-h-[90vh]' : 'w-full'
        }\`}
      >
        <audio
          ref={audioRef}
          src={audio.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />`;
content = content.replace(returnStart, returnWithAudio);

// 5. Fix close button
const closeOld = `              onClick={() => {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}`;

const closeNew = `              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                onClose();
              }}`;
content = content.replace(closeOld, closeNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Modifications done");
