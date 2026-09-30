import { AthleteUser, Clan } from '../types/admin';

export type TitleRarity = 'COMMON' | 'RARE' | 'EPIC' | 'MYTHIC' | 'LEGENDARY';

export interface PantheonTitle {
  id: string;
  name: string;
  rarity: TitleRarity;
  description: string;
  unlockCondition: string;
  category: 'FORCE' | 'WISDOM' | 'ENDURANCE' | 'COLOSSEUM' | 'CLAN';
  unlockedCount: number;
  iconName: string;
}

export interface PantheonHalo {
  id: string;
  name: string;
  rarity: TitleRarity;
  description: string;
  cssGradient: string;
  glowColor: string;
  obtainedVia: string;
  activeBearersCount: number;
}

export interface PantheonRecord {
  id: string;
  athleteId: string;
  athleteUsername: string;
  athleteFullName: string;
  exerciseName: string;
  category: 'PUSHUPS' | 'PULLUPS' | 'DIPS' | 'MUSCLEUPS' | 'PLANK_SECONDS';
  recordValue: number;
  unit: string;
  submittedAt: string;
  aiPrecisionScore: number; // en % (ex: 98.7%)
  aiTrunkDeviationDeg: number;
  status: 'HOMOLOGATED' | 'PENDING_REVIEW' | 'REJECTED';
  rejectionReason?: string;
  videoProofUrl?: string;
  certifiedBy: string;
}

export interface PantheonSeasonArchive {
  id: string;
  seasonNumber: number;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  championAthlete: {
    username: string;
    fullName: string;
    totalXp: number;
    title: string;
    avatarInitials: string;
  };
  championClan: {
    name: string;
    leader: string;
    totalXp: number;
    territories: number;
  };
  totalParticipants: number;
  totalRepsLogged: number;
  prizePoolAether: number;
}

// --- TITRES OFFICIELS DU PANTHÉON ---
export const INITIAL_PANTHEON_TITLES: PantheonTitle[] = [
  {
    id: 'title_titan_acier',
    name: 'Titan d\'Acier',
    rarity: 'LEGENDARY',
    description: 'Décerné aux athlètes ayant validé 50 pompes strictes d\'affilée et 20 tractions sans élan au Dojo IA.',
    unlockCondition: 'Force brute > 25 000 XP + 50 pompes validées par Google ML Kit',
    category: 'FORCE',
    unlockedCount: 8,
    iconName: 'Shield',
  },
  {
    id: 'title_monarque_barres',
    name: 'Monarque des Barres',
    rarity: 'MYTHIC',
    description: 'Le rang suprême du Street Workout. Maîtrise absolue du Muscle-Up strict et du Front Lever.',
    unlockCondition: 'Niveau 25+ et 15 Muscle-ups stricts homologués au Colisée',
    category: 'COLOSSEUM',
    unlockedCount: 2,
    iconName: 'Crown',
  },
  {
    id: 'title_legende_alpha',
    name: 'Légende Alpha',
    rarity: 'MYTHIC',
    description: 'Symbole de dévotion inaltérable. Maintenu sur une série de plus de 60 jours sans rupture.',
    unlockCondition: 'Streak > 60 jours + équilibre Force/Sagesse parfait (40-60%)',
    category: 'WISDOM',
    unlockedCount: 5,
    iconName: 'Sparkles',
  },
  {
    id: 'title_reine_bastion',
    name: 'Reine du Bastion',
    rarity: 'EPIC',
    description: 'Distinction accordée aux cheffes d\'arènes dominant le classement territorial de leur ville.',
    unlockCondition: 'Top 1 d\'une arène Street Workout pendant 30 jours consécutifs',
    category: 'CLAN',
    unlockedCount: 4,
    iconName: 'Award',
  },
  {
    id: 'title_maitre_colisee',
    name: 'Maître du Colisée',
    rarity: 'EPIC',
    description: 'Vainqueur d\'au moins 10 duels asynchrones au Dojo avec une précision supérieure à 95%.',
    unlockCondition: '10 duels remportés + Précision biomécanique moyenne > 95%',
    category: 'COLOSSEUM',
    unlockedCount: 12,
    iconName: 'Trophy',
  },
  {
    id: 'title_initie_alpha',
    name: 'Initié Alpha',
    rarity: 'RARE',
    description: 'Le premier palier du guerrier Osirion ayant validé son initiation complète.',
    unlockCondition: 'Terminer le programme Fondations 30J et prêter son Serment Ultime',
    category: 'FORCE',
    unlockedCount: 84,
    iconName: 'Compass',
  },
];

// --- HALOS COSMÉTIQUES DU PANTHÉON ---
export const INITIAL_PANTHEON_HALOS: PantheonHalo[] = [
  {
    id: 'halo_immortel_pourpre',
    name: 'Halo Immortel Pourpre',
    rarity: 'MYTHIC',
    description: 'Aura divine pourpre scintillante réservée aux champions du Top 3 continental.',
    cssGradient: 'from-purple-600 via-fuchsia-500 to-indigo-600',
    glowColor: '#a855f7',
    obtainedVia: 'Podium Saison 1 & Titre Monarque des Barres',
    activeBearersCount: 2,
  },
  {
    id: 'halo_alpha_gold',
    name: 'Halo Alpha Gold',
    rarity: 'LEGENDARY',
    description: 'Aura dorée solaire étincelante remise aux titans de la communauté.',
    cssGradient: 'from-amber-400 via-yellow-300 to-amber-600',
    glowColor: '#f59e0b',
    obtainedVia: 'Atteindre le rang Titan d\'Acier et 40 000 XP',
    activeBearersCount: 6,
  },
  {
    id: 'halo_sanctuaire_boreal',
    name: 'Halo Sanctuaire Boréal',
    rarity: 'EPIC',
    description: 'Aura bleu glacier céleste incarnant la sérénité et la rigueur du Codex.',
    cssGradient: 'from-sky-400 via-cyan-300 to-blue-600',
    glowColor: '#0ea5e9',
    obtainedVia: 'Sagesse > 15 000 XP et Pass Annuel Athlète',
    activeBearersCount: 14,
  },
];

// --- RECORDS OFFICIELS HOMOLOGUÉS DU PANTHÉON ---
export const INITIAL_PANTHEON_RECORDS: PantheonRecord[] = [
  {
    id: 'rec_01',
    athleteId: 'usr_849204',
    athleteUsername: 'max_frontlever',
    athleteFullName: 'Maxime Rousseau',
    exerciseName: 'Muscle-Up Strict sur Barre',
    category: 'MUSCLEUPS',
    recordValue: 18,
    unit: 'reps',
    submittedAt: '2026-09-24 à 16:30',
    aiPrecisionScore: 98.7,
    aiTrunkDeviationDeg: 3.2,
    status: 'HOMOLOGATED',
    videoProofUrl: 'https://storage.osirion.app/proofs/rec_01_max.mp4',
    certifiedBy: 'IA PoseMathService v1.0.30 + SuperAdmin',
  },
  {
    id: 'rec_02',
    athleteId: 'usr_849201',
    athleteUsername: 'thomas_calisthenics',
    athleteFullName: 'Thomas Dupont',
    exerciseName: 'Pompes Standard Strictes (1 Série)',
    category: 'PUSHUPS',
    recordValue: 65,
    unit: 'reps',
    submittedAt: '2026-09-25 à 09:12',
    aiPrecisionScore: 96.4,
    aiTrunkDeviationDeg: 4.8,
    status: 'HOMOLOGATED',
    videoProofUrl: 'https://storage.osirion.app/proofs/rec_02_thomas.mp4',
    certifiedBy: 'IA PoseMathService v1.0.30 + SuperAdmin',
  },
  {
    id: 'rec_03',
    athleteId: 'usr_849204',
    athleteUsername: 'max_frontlever',
    athleteFullName: 'Maxime Rousseau',
    exerciseName: 'Tractions Pronation Strictes',
    category: 'PULLUPS',
    recordValue: 32,
    unit: 'reps',
    submittedAt: '2026-09-22 à 18:00',
    aiPrecisionScore: 97.9,
    aiTrunkDeviationDeg: 2.1,
    status: 'HOMOLOGATED',
    videoProofUrl: 'https://storage.osirion.app/proofs/rec_03_max.mp4',
    certifiedBy: 'IA PoseMathService v1.0.30 + SuperAdmin',
  },
  {
    id: 'rec_04',
    athleteId: 'usr_849202',
    athleteUsername: 'sarah_fit_pullups',
    athleteFullName: 'Sarah Benali',
    exerciseName: 'Tractions Pronation Féminines',
    category: 'PULLUPS',
    recordValue: 14,
    unit: 'reps',
    submittedAt: '2026-09-23 à 14:15',
    aiPrecisionScore: 95.8,
    aiTrunkDeviationDeg: 3.5,
    status: 'HOMOLOGATED',
    videoProofUrl: 'https://storage.osirion.app/proofs/rec_04_sarah.mp4',
    certifiedBy: 'IA PoseMathService v1.0.30 + SuperAdmin',
  },
  {
    id: 'rec_05',
    athleteId: 'usr_849206',
    athleteUsername: 'alex_bot_reps',
    athleteFullName: 'Alexandre Moreau (Compte Suspendu)',
    exerciseName: 'Pompes Ultra Rapides (Script Bot)',
    category: 'PUSHUPS',
    recordValue: 500,
    unit: 'reps',
    submittedAt: '2026-09-24 à 03:00',
    aiPrecisionScore: 12.4,
    aiTrunkDeviationDeg: 42.0,
    status: 'REJECTED',
    rejectionReason: 'Fraude détectée : répétitions sans flexion coudes (>120°) et cadence artificielle impossible (5 reps/sec)',
    certifiedBy: 'AntiCheatGuardian Filter',
  },
  {
    id: 'rec_06',
    athleteId: 'usr_849205',
    athleteUsername: 'camille_athletic',
    athleteFullName: 'Camille Leroy',
    exerciseName: 'Gainage Planche Isométrique',
    category: 'PLANK_SECONDS',
    recordValue: 120,
    unit: 'secondes',
    submittedAt: '2026-09-25 à 11:45',
    aiPrecisionScore: 93.1,
    aiTrunkDeviationDeg: 6.8,
    status: 'PENDING_REVIEW',
    videoProofUrl: 'https://storage.osirion.app/proofs/rec_06_camille.mp4',
    certifiedBy: 'En attente d\'arbitrage SuperAdmin',
  },
];

// --- CLANS OFFICIELS DU PANTHÉON ---
export const INITIAL_PANTHEON_CLANS: Clan[] = [
  {
    id: 'clan_ronin_paris',
    name: 'Ronin Calisthenics Paris',
    description: 'Guilde des athlètes d\'élite de l\'Île-de-France. Domination totale des spots de Seine et Villette.',
    leaderPseudo: 'max_frontlever',
    membersCount: 42,
    totalXp: 184500,
    ranking: 1,
    territoriesHeld: 6,
    createdAt: '2026-01-10',
  },
  {
    id: 'clan_vanguard_lyon',
    name: 'Vanguard Lyon Street',
    description: 'Fraternité rhodanienne de callisthénie stricte. Bastion principal : Parc de Gerland.',
    leaderPseudo: 'sarah_fit_pullups',
    membersCount: 28,
    totalXp: 112400,
    ranking: 2,
    territoriesHeld: 4,
    createdAt: '2026-02-05',
  },
  {
    id: 'clan_spartan_marseille',
    name: 'Spartiates du Prado Marseille',
    description: 'Guerriers méditerranéens spécialisés dans les circuits endurance et le renforcement sous le soleil.',
    leaderPseudo: 'lucas_street_workout',
    membersCount: 19,
    totalXp: 68200,
    ranking: 3,
    territoriesHeld: 2,
    createdAt: '2026-03-01',
  },
  {
    id: 'clan_aquitaine_bars',
    name: 'Légion Aquitaine Bordeaux',
    description: 'Collectif des barres des Quinconces. Entraînement technique et figures statiques.',
    leaderPseudo: 'julien_bars',
    membersCount: 15,
    totalXp: 48900,
    ranking: 4,
    territoriesHeld: 2,
    createdAt: '2026-04-12',
  },
];

// --- SAISONS & ARCS DU PANTHÉON ---
export const INITIAL_PANTHEON_SEASONS: PantheonSeasonArchive[] = [
  {
    id: 'season_royal_arc',
    seasonNumber: 1,
    name: 'ROYAL ARC : L\'Éveil des Titans',
    theme: 'Fondation des Piliers & Conquête des Bastions Urbains',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    status: 'ACTIVE',
    championAthlete: {
      username: 'max_frontlever',
      fullName: 'Maxime Rousseau',
      totalXp: 89400,
      title: 'Monarque des Barres',
      avatarInitials: 'MR',
    },
    championClan: {
      name: 'Ronin Calisthenics Paris',
      leader: 'max_frontlever',
      totalXp: 184500,
      territories: 6,
    },
    totalParticipants: 142,
    totalRepsLogged: 104850,
    prizePoolAether: 15000,
  },
  {
    id: 'season_alpha_preseason',
    seasonNumber: 0,
    name: 'PRÉ-SAISON ALPHA : Le Baptême du Fer',
    theme: 'Rodage de l\'IA de détection posturale et tests des parcs parisiens',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    status: 'ARCHIVED',
    championAthlete: {
      username: 'thomas_calisthenics',
      fullName: 'Thomas Dupont',
      totalXp: 64200,
      title: 'Titan d\'Acier',
      avatarInitials: 'TD',
    },
    championClan: {
      name: 'Ronin Calisthenics Paris',
      leader: 'thomas_calisthenics',
      totalXp: 98200,
      territories: 3,
    },
    totalParticipants: 45,
    totalRepsLogged: 34200,
    prizePoolAether: 5000,
  },
];
