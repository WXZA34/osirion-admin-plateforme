export type ArenaSport = 'RUNNING' | 'WALKING' | 'CYCLING';
export type ForgeNavigationMode = 'BOUCLE_IA' | 'POINT_A_B';
export type TerrainType = 'PLAT' | 'VALLONNE';

export type BastionTacticalStatus = 'VIERGE' | 'CONFLIT' | 'FORTERESSE' | 'STABLE';
export type TerritoryTacticalStatus = 'CONQUIS' | 'DISPUTE' | 'NEUTRE';
export type DuelExerciseType = 'pushups' | 'squats' | 'situps' | 'pullups';
export type DuelStatus = 'LIVE' | 'WAITING_OPPONENT' | 'COMPLETED' | 'DISPUTED_CHEAT';

export interface LatLngPoint {
  latitude: number;
  longitude: number;
}

export interface NoGoZone {
  id: string;
  name: string;
  reason: 'ZONE_DANGEREUSE' | 'TRAVAUX' | 'VOIE_RAPIDE_INTERDITE' | 'SITE_PRIVE';
  center: LatLngPoint;
  radiusMeters: number;
  active: boolean;
  createdAt: string;
}

export interface ForgeRouteTemplate {
  id: string;
  name: string;
  sport: ArenaSport;
  navigationMode: ForgeNavigationMode;
  targetDistanceKm: number;
  terrainType: TerrainType;
  startPosition: LatLngPoint;
  elevationGainMeters: number;
  estimatedDurationMin: number;
  ghostPaceMinKm: string;
  waypointsCount: number;
  isOfficialArcLoop: boolean;
  snapToleranceMeters: number; // Ghost Path Snapping tolerance (ex: 15m)
}

export interface TerritoryHexModel {
  id: string;
  h3Index: string;
  zoneName: string;
  city: string;
  center: LatLngPoint;
  status: TerritoryTacticalStatus;
  ownerClanId?: string;
  ownerClanName?: string;
  ownerLeaderPseudo?: string;
  ownerLeaderAvatar?: string;
  currentLeaderKms: number;
  contendersCount: number;
  lastCapturedAt: string;
  influencePoints: number;
  defenseDecayHoursLeft: number;
}

export interface BastionLeaderboardEntryModel {
  userId: string;
  pseudo: string;
  avatarUrl?: string;
  clanName?: string;
  reps: number;
  dips?: number;
  pullups?: number;
  pushups?: number;
  abs?: number;
  exerciseType: string;
  achievedAt: string;
  // Déclin de 5% par tranche de 7 jours (0.71%/jour)
  effectiveReps: number;
}

export interface BastionTacticalSpot {
  id: string;
  name: string;
  position: LatLngPoint;
  neighborhood: string;
  city: string;
  type: 'PARC_COMPLET' | 'BARRES_TRACTION' | 'STATION_FREESTYLE' | 'MODULES_STREET';
  equipment: string[];
  tacticalStatus: BastionTacticalStatus;
  failedAttemptsCount: number;
  lastBeatenAt?: string;
  bossAchievedAt?: string;
  currentBoss?: BastionLeaderboardEntryModel;
  leaderboard: BastionLeaderboardEntryModel[];
  images: string[];
  osmNote?: string;
  sourcePriority: 'FIRESTORE_ECLAIREUR' | 'OSM_MERGED';
  isFlaggedForAudit?: boolean;
}

export interface ColosseumRunRecord {
  id: string;
  title: string;
  activityType: ArenaSport;
  creatorId: string;
  creatorPseudo: string;
  creatorAvatar?: string;
  distanceKm: number;
  durationFormatted: string;
  durationMs: number;
  averageSpeedKmh: number;
  elevationGainM: number;
  challengersCount: number;
  speedProfile: number[]; // Vitesse à chaque segment pour le Ghost
  createdAt: string;
  isVerifiedByGps: boolean;
}

export interface ColosseumLiveDuel {
  id: string;
  duelTitle: string;
  exerciseType: DuelExerciseType;
  status: DuelStatus;
  athlete1: {
    id: string;
    pseudo: string;
    clanName: string;
    currentReps: number;
    targetReps: number;
    posePrecisionScore: number; // ML Kit pose accuracy
  };
  athlete2: {
    id: string;
    pseudo: string;
    clanName: string;
    currentReps: number;
    targetReps: number;
    posePrecisionScore: number;
  };
  aetherWagerPerAthlete: number;
  timeRemainingSec: number;
  startedAt: string;
  winnerPseudo?: string;
  isAiRefereed: boolean;
  cheatAlertFlag?: boolean;
}

export interface ColosseumTournament {
  id: string;
  title: string;
  description: string;
  totalAetherPool: number;
  participantsCount: number;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'ARCHIVED';
  featuredExercise: string;
  rules: string;
}
