/**
 * Utility functions for in-site embedded video playback and processing
 */

export interface VideoPlayerConfig {
  type: 'youtube' | 'direct' | 'vimeo' | 'tiktok' | 'unsupported' | 'empty';
  embedUrl: string;
  directUrl?: string;
  thumbnailUrl?: string;
  videoId?: string;
  rawUrl?: string;
}

export function parseVideoUrl(url?: string, autoPlay: boolean = false): VideoPlayerConfig {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { type: 'empty', embedUrl: '', rawUrl: '' };
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
      rawUrl: cleanUrl,
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
      rawUrl: cleanUrl,
    };
  }

  // 3. Vimeo
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?${autoPlayParam}`,
      rawUrl: cleanUrl,
    };
  }

  // 4. TikTok
  const tiktokMatch = cleanUrl.match(/tiktok\.com\/.*video\/(\d+)/);
  if (tiktokMatch && tiktokMatch[1]) {
    return {
      type: 'tiktok',
      videoId: tiktokMatch[1],
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
      rawUrl: cleanUrl,
    };
  }

  // 5. Support direct des chemins Firebase Storage (ex: "exercises/core/abdos_velo.mp4" ou "gs://...")
  let direct = cleanUrl;
  if (direct.startsWith('gs://')) {
    const clean = direct.replace(/^gs:\/\/[^/]+\//, '');
    direct = `https://firebasestorage.googleapis.com/v0/b/valerion-55414.firebasestorage.app/o/${encodeURIComponent(clean)}?alt=media`;
    return {
      type: 'direct',
      embedUrl: direct,
      directUrl: direct,
      rawUrl: cleanUrl,
    };
  } else if (
    !direct.startsWith('http://') &&
    !direct.startsWith('https://') &&
    !direct.startsWith('blob:') &&
    !direct.startsWith('data:')
  ) {
    const clean = direct.replace(/^\//, '');
    direct = `https://firebasestorage.googleapis.com/v0/b/valerion-55414.firebasestorage.app/o/${encodeURIComponent(clean)}?alt=media`;
    return {
      type: 'direct',
      embedUrl: direct,
      directUrl: direct,
      rawUrl: cleanUrl,
    };
  }

  // 6. Direct video files (MP4, WebM, OGG, MOV, blob:, data:)
  return {
    type: 'direct',
    embedUrl: direct,
    directUrl: direct,
    rawUrl: cleanUrl,
  };
}
