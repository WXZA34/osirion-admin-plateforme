// --- Modèle de données Réel & Authentique pour la console d'administration Osirion ---

export type SubscriptionTier = 'FREE' | 'PRO_MONTHLY' | 'ATHLETE_ANNUAL';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE';
export type AthleteLevel = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Élite';

export interface AthleteUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  status: 'ACTIVE' | 'SUSPENDED';
  fitnessLevel: AthleteLevel;
  registeredAt: string;
  lastWorkoutAt: string;
  streakDays: number;
  totalWorkouts: number;
  totalReps: number;
  weightKg: number;
  heightCm: number;
  city: string;
  deviceModel: string;
  appVersion: string;
  personalRecords: {
    pushups: number;
    pullups: number;
    dips: number;
    muscleups: number;
    maxPlankSeconds: number;
  };

  // --- NOUVEAUX CHAMPS AUTHENTIQUES (lib/core/domain/entities/user_entity.dart) ---
  level: number;
  xp: number;
  forceXp: number;
  wisdomXp: number;
  maxPushups: number;
  maxPullups: number;
  age?: number;
  bodyFat?: number; // % masse grasse (ex: 12.5)
  muscleMass?: number; // % masse musculaire (ex: 44.2)
  movementPrecision: number; // Précision biomécanique IA Dojo (ex: 94.8%)
  bestPace1km: number; // Allure record 1km en secondes ou min/km
  bestAlphaLoop6km: number; // Temps boucle 6km en minutes
  totalDistance: number; // Distance totale courue en km
  aetherBalance: number; // Solde Aether (Monnaie sacrée de l'app)
  gold: number; // Pièces d'or de l'app
  activeHalo?: string; // ex: 'Halo Boréal', 'Halo Alpha Gold', 'Halo Sanctuaire'
  activeTitle?: string; // ex: 'Roi du Bastion', 'Légende Alpha', 'Titan d\'Acier'
  unlockedTitles: string[];
  inventory: string[];
  activeArcId?: string; // 'ROYAL ARC', 'WINTER ARC', 'SUMMER BODY'
  guardianPath?: string; // 'Voie du Colosse', 'Voie de l\'Ombre', 'Voie de la Foudre'
  ultimateOath?: string; // '« Forger mon corps jusqu\'à briser mes limites »'
  clanIds: string[];
  friendIds: string[];
  onlineStatus: 'online' | 'offline' | 'training';
}

export type MuscleGroup =
  | 'Pectoraux'
  | 'Dorsaux'
  | 'Épaules'
  | 'Bras (Triceps & Biceps)'
  | 'Abdominaux & Core'
  | 'Jambes & Fessiers'
  | 'Corps Complet (Full Body)';

export type EquipmentRequired =
  | 'Poids du corps'
  | 'Barre de traction'
  | 'Barres parallèles'
  | 'Anneaux de gymnastique'
  | 'Banc ou surface surélevée';

// --- CONFIGURATION OFFICIELLE DE L'ÉCRAN « LE DOJO : CONFIGURATION » ---

// 1. Choix de la Cible
export type DojoTargetArea =
  | 'CORPS_ENTIER' // Corps Entier
  | 'HAUT_DU_CORPS' // Haut du Corps
  | 'BAS_DU_CORPS' // Bas du Corps
  | 'SANGLE_ABDOS' // Sangle Abdos
  | 'CIBLAGE_ISOLE'; // Ciblage Isolé (Rééduc.)

// 2. Type d'Entraînement
export type DojoTrainingType =
  | 'FORCE' // FORCE (Lent & Contrôlé)
  | 'ENDURANCE'; // ENDURANCE (Cardio long)

// 3. Mode d'Exécution
export type DojoExecutionMode =
  | 'MODE_VISION' // MODE VISION (IA Active • Tracking des Articulations • Feedback Auto)
  | 'MODE_GUIDE'; // MODE GUIDE (Simulation 3D • Mode Chrono • Validation Manuelle)

export type DojoMode =
  | 'DYNAMIC_REPS' // Répétitions dynamiques (Pompes, Tractions, Dips, Squats)
  | 'STATIC_HOLD' // Isométrie & Maintien chrono (L-Sit, Planche, Handstand)
  | 'AMRAP_TIMED' // Vitesse / Maximum de répétitions en temps limité
  | 'PROGRESSION_DRILL'; // Exercice technique / progression éducative

export type MovementSplit =
  | 'PUSH' // Poussée (Pectoraux, Triceps, Épaules)
  | 'PULL' // Tirage (Dorsaux, Biceps, Avant-bras)
  | 'LEGS' // Jambes & Fessiers
  | 'CORE' // Abdominaux, Gainage & Posture
  | 'FULL_BODY'; // Mouvements complets & Combos

export type DojoConfigProfile =
  | 'STRICT_COMPETITION' // Arbitrage strict Colisée 1v1 (zéro balancier, amplitude 100%)
  | 'STANDARD_DAILY' // Entraînement quotidien classique
  | 'NOVICE_ASSISTED' // Tolérance permissive pour apprentissage
  | 'ISOMETRIC_CHRONO'; // Chronomètre asservi au maintien de posture

export interface ExerciseItem {
  id: string;
  name: string;
  category: MuscleGroup;
  difficulty: AthleteLevel;
  equipment: EquipmentRequired;
  targetMuscles: string[];

  // --- Rubriques officielles de l'application mobile (LE DOJO : CONFIGURATION) ---
  targetArea: DojoTargetArea; // 1. Choix de la cible (Corps Entier, Haut du Corps, Bas, Abdos, Isolé)
  trainingType: DojoTrainingType; // 2. Type d'entraînement (FORCE vs ENDURANCE)
  executionMode: DojoExecutionMode; // 3. Mode d'exécution (MODE VISION vs MODE GUIDE)

  // --- Répartition & Modes du Dojo IA ---
  dojoMode: DojoMode;
  movementSplit: MovementSplit;
  configProfile: DojoConfigProfile;
  holdTargetSeconds?: number; // Pour les exercices isométriques

  // --- Paramètres d'arbitrage IA du Dojo (Google ML Kit Pose Detection) ---
  aiPoseDetection: boolean;
  minAngle: number; // Angle flexion articulation (ex: 85° pour coudes pushups)
  maxAngle: number; // Extension complète (ex: 170°)
  sensitivity: number; // Tolérance angulaire (0.1 à 1.0)
  strictMode: boolean; // Anti-triche strict (interdiction du kipping/balancier)
  maxTrunkDeviationDeg: number; // Déviation du tronc max tolérée en degrés
  minTUTSeconds: number; // Temps sous tension minimal par répétition (ex: 0.8s)
  monitoredLandmarks: string[]; // ex: ['Épaule', 'Coude', 'Poignet']
  stateMachineLabels: {
    start: string;
    inflection: string;
    completion: string;
  };

  instructions: string;
  videoDemoUrl: string;
  popularityRank: number;
  activeInWorkouts: boolean;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: AthleteLevel;
  durationWeeks: number;
  sessionsPerWeek: number;
  targetObjective: string;
  enrolledAthletes: number;
  completionRate: number; // pourcentage
  isPremiumOnly: boolean;
  published: boolean;
  author: string;
  exercisesList: string[]; // Noms des exercices inclus
}

export interface StreetWorkoutSpot {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  equipmentList: string[];
  groundType: 'Tartan amortissant' | 'Sable fin' | 'Béton / Bitume' | 'Pelouse naturelle' | 'Gravier';
  status: 'VERIFIED' | 'PENDING_REVIEW' | 'MAINTENANCE';
  rating: number; // ex: 4.8
  reviewsCount: number;
  photosCount: number;
  contributedBy: string;
  isCovered: boolean;
  hasWaterPoint: boolean;
  hasNightLighting: boolean;
  images?: string[];
}

export interface PushNotificationCampaign {
  id: string;
  title: string;
  bodyText: string;
  targetAudience: 'ALL_ATHLETES' | 'INACTIVE_3_DAYS' | 'PRO_SUBSCRIBERS' | 'BEGINNERS_ONLY';
  scheduledFor: string;
  status: 'SENT' | 'SCHEDULED' | 'DRAFT';
  recipientsCount: number;
  openRatePercent?: number;
  deepLinkScreen: 'WORKOUT_TODAY' | 'STORE_PRO' | 'CHALLENGE_WEEK' | 'NEW_SPOT';
}

export interface RevenueMetric {
  mrr: number; // Monthly Recurring Revenue en €
  arr: number; // Annual Run Rate en €
  totalActiveSubscribers: number;
  proMonthlyCount: number;
  athleteAnnualCount: number;
  freeUsersCount: number;
  churnRatePercent: number;
  conversionRatePercent: number;
}

export interface GlobalAppSettings {
  appName: string;
  appPackageId: string;
  minSupportedVersion: string;
  latestVersion: string;
  forceUpdateEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  playStoreUrl: string;
  supportEmail: string;
  aiDetectionSensitivity: number; // 0.1 à 1.0
  antiCheatTolerancePercent: number; // ex: 10%
}

// --- Types de rétro-compatibilité ---
export interface Clan {
  id: string;
  name: string;
  description: string;
  leaderPseudo: string;
  membersCount: number;
  totalXp: number;
  ranking: number;
  territoriesHeld: number;
  createdAt: string;
  logoUrl?: string;
  isRecruiting?: boolean;
  factionMotto?: string;
}

export interface Bastion {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  city: string;
  activeAthletesCount: number;
  conqueringClan: string;
  difficulty: string;
}

export interface H3Territory {
  h3Index: string;
  zoneName: string;
  ownerClan: string;
  leaderPseudo: string;
  totalKmsContested: number;
  status: string;
  lastCaptureDate: string;
}

export interface KinematicRule {
  exerciseId: string;
  name: string;
  minAngle: number;
  maxAngle: number;
  sensitivity: number;
  active: boolean;
  strictMode: boolean;
}

export interface DailyVideoConfig {
  dailyVideoUrl: string;
  dailyVideoTitle: string;
  dailyVideoDescription: string;
  quoteAuthor: string;
}

export interface AudioLesson {
  id: string;
  title: string;
  speaker: string;
  durationMinutes: number;
  category: string;
  url: string;
}
