/**
 * Utility functions for in-site embedded video playback and processing
 */

export interface VideoPlayerConfig {
  type: 'youtube' | 'direct' | 'vimeo' | 'tiktok' | 'unsupported';
  embedUrl: string;
  thumbnailUrl?: string;
  videoId?: string;
}

export function parseVideoUrl(url: string, autoPlay: boolean = false): VideoPlayerConfig {
  if (!url || typeof url !== 'string') {
    return { type: 'unsupported', embedUrl: '' };
  }

  const cleanUrl = url.trim();
  const autoPlayParam = autoPlay ? 'autoplay=1' : 'autoplay=0';

  // 1. YouTube Short URL (youtu.be/ID)
  const youtuBeMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    const videoId = youtuBeMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?${autoPlayParam}&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // 2. YouTube Standard / Shorts / Embed URL
  const youtubeMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?${autoPlayParam}&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // 3. Vimeo
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?${autoPlayParam}`,
    };
  }

  // 4. TikTok
  const tiktokMatch = cleanUrl.match(/tiktok\.com\/.*video\/(\d+)/);
  if (tiktokMatch && tiktokMatch[1]) {
    return {
      type: 'tiktok',
      videoId: tiktokMatch[1],
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
    };
  }

  // 4. Direct video files (MP4, WebM, OGG, MOV, blob:, data:)
  if (
    cleanUrl.startsWith('blob:') ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)
  ) {
    return {
      type: 'direct',
      embedUrl: cleanUrl,
    };
  }

  // Fallback as direct
  return {
    type: 'direct',
    embedUrl: cleanUrl,
  };
}
