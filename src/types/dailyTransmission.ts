export type TransmissionInteractionType = 'POLL' | 'COMMENTS' | 'BOTH' | 'NONE';

export type VideoSourceType = 'YOUTUBE' | 'FIREBASE_MP4' | 'EXTERNAL';

export type TransmissionArc = 'Winter Arc' | 'Summer Body' | 'Royal Arc' | 'Général';

export interface PollOption {
  id: string;
  text: string;
  votesCount: number;
  voters?: Array<{
    userId: string;
    pseudo: string;
    avatarUrl?: string;
    votedAt: string;
  }>;
}

export interface TransmissionPoll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  allowMultipleChoices: boolean;
  closesAt?: string;
  isClosed: boolean;
  userVotedOptionId?: string; // pour simulation mobile
}

export interface TransmissionAdminReply {
  id: string;
  authorName: string;
  authorRole: string; // 'Fondateur Osirion' | 'Coach Principal'
  content: string;
  repliedAt: string;
}

export interface TransmissionComment {
  id: string;
  athleteId: string;
  athletePseudo: string;
  athleteAvatar?: string;
  athleteClan?: string;
  athleteLevel?: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isPinned?: boolean;
  status: 'VISIBLE' | 'HIDDEN' | 'FLAGGED';
  adminReply?: TransmissionAdminReply;
}

export interface TransmissionCommentSession {
  id: string;
  prompt: string;
  isOpen: boolean;
  totalComments: number;
  comments: TransmissionComment[];
}

export interface DailyTransmissionVideo {
  id: string;
  dateKey: string; // '2026-09-30'
  displayDate: string; // 'Aujourd’hui • 30 Septembre 2026'
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  videoSourceType: VideoSourceType;
  arc: TransmissionArc;
  durationFormatted: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'SCHEDULED';
  viewsCount: number;
  likesCount: number;
  interactionType: TransmissionInteractionType;
  poll?: TransmissionPoll;
  commentSession?: TransmissionCommentSession;
  publishedAt: string;
  publishedBy: string;
  // Sync avec GlobalConfig Firestore ('global_config/daily_content')
  isSyncedToFirestore: boolean;
}
