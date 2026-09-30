export type LibraryArc = 'Winter Arc' | 'Summer Body' | 'Royal Arc' | 'Toutes les Saisons';

export type BookStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export type AudioCategory = 'forge' | 'recovery' | 'motivation' | 'mindset' | 'warrior';

export type AudioStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  tag: string;
  theme: string;
  whyRead: string;
  keyPhrase: string;
  arc: LibraryArc;
  pdfPath?: string;
  thumbnailUrl?: string;
  pageCount?: number;
  estimatedReadTimeMin?: number;
  status: BookStatus;
  readCount: number;
  favoriteCount: number;
  addedAt: string;
  chaptersCount?: number;
  wisdomXpReward: number; // XP Sagesse pour le Panthéon
}

export interface LibraryAudio {
  id: string;
  title: string;
  subtitle: string;
  audioUrl: string;
  iconName: string;
  category: AudioCategory;
  order: number;
  isAsset: boolean;
  durationFormatted: string;
  durationSeconds: number;
  status: AudioStatus;
  listenCount: number;
  speakerName?: string;
  addedAt: string;
  fileSizeBytes?: number;
}

export interface ReadingFocusSession {
  id: string;
  athleteId: string;
  athletePseudo: string;
  athleteAvatar?: string;
  bookTitle: string;
  bookId: string;
  durationMinutes: number; // 15, 30, 60
  ambientSound: string; // 'Silence', 'Pluie Stoïcienne', 'Feu de Camp'
  completedAt: string;
  wisdomXpEarned: number;
}

export interface SealedHonorContract {
  id: string;
  athleteId: string;
  athletePseudo: string;
  bookTitle: string;
  content: string;
  date: string;
  isSealed: boolean;
  wisdomRewardClaimed: boolean;
}
