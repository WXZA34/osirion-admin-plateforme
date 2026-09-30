export type ReportReason =
  | 'HARASSMENT'
  | 'CHEATING_AI'
  | 'OFFENSIVE_CONTENT'
  | 'SPAM'
  | 'IMPERSONATION'
  | 'UNSPORTING';

export type ReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ReportStatus =
  | 'PENDING'
  | 'INVESTIGATING'
  | 'RESOLVED_WARNING'
  | 'RESOLVED_BAN'
  | 'DISMISSED';

export type SanctionType =
  | 'WARNING'
  | 'TEMPORARY_BAN_7D'
  | 'TEMPORARY_BAN_30D'
  | 'PERMANENT_BAN'
  | 'MUTE_CHAT'
  | 'REVOKE_CLAN_LEADERSHIP';

export interface ConnectMessageItem {
  id: string;
  channelType: 'SYSTEM' | 'CLAN' | 'PRIVATE';
  channelId: string;
  channelName: string;
  senderId: string;
  senderUsername: string;
  senderFullName: string;
  senderAvatar?: string;
  recipientUsername?: string;
  text?: string;
  mediaType: 'text' | 'audio' | 'video' | 'image';
  mediaUrl?: string;
  mediaDurationSec?: number;
  timestamp: string;
  isFlagged?: boolean;
  isSystemAnnouncement?: boolean;
}

export interface ModerationEvidence {
  id: string;
  title: string;
  type: 'SCREENSHOT' | 'CHAT_LOG' | 'AI_POSE_ANOMALY' | 'VIDEO_CLIP' | 'AUDIO_RECORDING';
  url: string;
  description: string;
  capturedAt: string;
  fileSizeBytes?: number;
  hashChecksum?: string;
}

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUsername: string;
  reportedFullName: string;
  reporterUserId: string;
  reporterUsername: string;
  reason: ReportReason;
  reasonLabel: string;
  severity: ReportSeverity;
  status: ReportStatus;
  contextChannel: string; // Ex: "Clan Ronin Paris", "Duel Colisée", "Alpha Connect"
  description: string;
  flaggedMessageId?: string;
  flaggedMessageContent?: string;
  evidenceList: ModerationEvidence[];
  adminNotes?: string;
  resolutionAction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSanction {
  id: string;
  athleteId: string;
  athleteUsername: string;
  athleteFullName: string;
  sanctionType: SanctionType;
  warningsCount: number; // 1/3, 2/3, 3/3
  reason: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt?: string;
  isActive: boolean;
  evidenceIds: string[];
  publicNotice?: string;
}

export interface AdminTransmission {
  id: string;
  title: string;
  body: string;
  targetAudience: 'ALL_ATHLETES' | 'SPECIFIC_ATHLETE' | 'CLAN_LEADERS' | 'WARNED_ATHLETES';
  targetAthleteUsername?: string;
  priority: 'OFFICIAL' | 'URGENT' | 'DISCIPLINARY';
  sentBy: string;
  sentAt: string;
  readCount: number;
  recipientsCount: number;
  deepLinkScreen?: string;
}
