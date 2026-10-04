import sys

file_path = "c:/Users/rolan/Videos/application mobile/valerion/osirion-admin-plateforme/src/components/IntegratedPodcastPlayer.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace the hooks
hooks_start = """  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesized speech narration engine"""

hooks_end = """    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, playbackRate]);"""

new_hooks = """  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  };"""

content = content.replace(content[content.find(hooks_start):content.find(hooks_end) + len(hooks_end)], new_hooks)

# 2. Replace handleSeek
seek_old = """  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };"""

seek_new = """  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };"""
content = content.replace(seek_old, seek_new)

# 3. Replace handleSkip
skip_old = """  const handleSkip = (seconds: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + seconds)));
  };"""

skip_new = """  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };"""
content = content.replace(skip_old, skip_new)

# 4. Insert <audio> tag
return_start = """      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col ${
          isExpanded ? 'w-full max-w-2xl max-h-[90vh]' : 'w-full'
        }`}
      >"""

return_with_audio = """      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col ${
          isExpanded ? 'w-full max-w-2xl max-h-[90vh]' : 'w-full'
        }`}
      >
        <audio
          ref={audioRef}
          src={audio.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />"""
content = content.replace(return_start, return_with_audio)

# 5. Fix close button
close_old = """              onClick={() => {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}"""

close_new = """              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                }
                onClose();
              }}"""
content = content.replace(close_old, close_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modifications done")
