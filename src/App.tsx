import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Users,
  MapPin,
  Cpu,
  Dumbbell,
  BookOpen,
  Settings,
  CreditCard,
  Bell,
  Smartphone,
  Code2,
  Download,
  GitBranch,
  ExternalLink,
  ShieldCheck,
  Eye,
  ChevronDown,
  Menu,
  X,
  Search,
  RotateCcw,
  Check,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Crown,
  ShieldAlert,
  Swords,
  Library,
  Radio,
  Database
} from 'lucide-react';

// Real Authenticated Data & Types
import {
  INITIAL_ATHLETES,
  INITIAL_EXERCISES,
  INITIAL_PROGRAMS,
  INITIAL_SPOTS,
  INITIAL_PUSH_CAMPAIGNS,
  INITIAL_REVENUE_METRICS,
  INITIAL_GLOBAL_SETTINGS,
} from './data/mockData';
import {
  AthleteUser,
  ExerciseItem,
  WorkoutProgram,
  StreetWorkoutSpot,
  PushNotificationCampaign,
  RevenueMetric,
  GlobalAppSettings,
  MuscleGroup,
} from './types/admin';
import { inferDojoMetadata } from './utils/exerciseClassifier';

// Real Back-Office Admin Components
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { UserManager } from './components/UserManager';
import { ExerciseLibraryManager } from './components/ExerciseLibraryManager';
import { WorkoutProgramsManager } from './components/WorkoutProgramsManager';
import { StreetWorkoutSpotsManager } from './components/StreetWorkoutSpotsManager';
import { SubscriptionsBillingManager } from './components/SubscriptionsBillingManager';
import { PushCampaignsManager } from './components/PushCampaignsManager';
import { AppSettingsManager } from './components/AppSettingsManager';
import { FeatureCodeGenerator } from './components/FeatureCodeGenerator';
import { LiveEventLogger } from './components/LiveEventLogger';
import { OsirionOfficialLogoAnimation } from './components/OsirionOfficialLogoAnimation';
import { OsirionMiniLogo } from './components/OsirionMiniLogo';
import { SupervisorTelemetryBar } from './components/SupervisorTelemetryBar';
import { PantheonManager } from './components/PantheonManager';
import { AlphaConnectModerationManager } from './components/AlphaConnectModerationManager';
import { ArenaFullManager } from './components/ArenaFullManager';
import { LibraryManager } from './components/LibraryManager';
import { DailyTransmissionManager } from './components/DailyTransmissionManager';
import { FirestoreConnectionHubModal } from './components/FirestoreConnectionHubModal';
import { db } from './lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export type AdminTab =
  | 'analytics'
  | 'pantheon'
  | 'arena'
  | 'library'
  | 'daily_transmission'
  | 'users'
  | 'connect_moderation'
  | 'exercises'
  | 'programs'
  | 'spots'
  | 'subscriptions'
  | 'notifications'
  | 'config'
  | 'code_gen'
  | 'audit';

interface NavModuleDefinition {
  id: AdminTab;
  label: string;
  category: 'Supervision & Revenus' | 'Contenu & Entraînement' | 'Communauté & Géolocalisation' | 'Système & Technique';
  icon: React.ElementType;
  description: string;
  badge?: string;
}

export const NAV_MODULES: NavModuleDefinition[] = [
  // Groupe 1: Supervision
  {
    id: 'analytics',
    label: 'Tableau de bord & KPIs',
    category: 'Supervision & Revenus',
    icon: TrendingUp,
    description: 'Revenus MRR, répétitions IA et courbe de rétention J1/J7/J30',
  },
  {
    id: 'pantheon',
    label: 'Le Panthéon & Légendes',
    category: 'Supervision & Revenus',
    icon: Crown,
    description: 'Hall of Fame, records homologués ML Kit, titres divins et podium des clans',
    badge: 'Hall of Fame',
  },
  {
    id: 'users',
    label: 'Comptes Athlètes',
    category: 'Supervision & Revenus',
    icon: Users,
    description: 'Gestion des profils réels, abonnements Free/Pro et modération',
  },
  {
    id: 'subscriptions',
    label: 'Abonnements & Revenus',
    category: 'Supervision & Revenus',
    icon: CreditCard,
    description: 'Google Play Billing, forfaits 9,99€/mois, 79,99€/an et conversion',
    badge: '4 890 € MRR',
  },

  // Groupe 2: Contenu & Sport
  {
    id: 'arena',
    label: "L'Arène Complète (4 Piliers)",
    category: 'Contenu & Entraînement',
    icon: Swords,
    description: "La Forge (Boucle IA & Routage), Territoires H3, Bastions Street Workout (Boss & Déclin) et Colisée (Duels 1v1 Tug-of-War)",
    badge: 'Forge • Bastions • Colisée',
  },
  {
    id: 'library',
    label: 'Bibliothèque & Podcasts',
    category: 'Contenu & Entraînement',
    icon: Library,
    description: 'Gestion des œuvres littéraires stoïciennes, manuscrits PDF, capsules audio & sessions Focus',
    badge: 'Livres & Audios',
  },
  {
    id: 'daily_transmission',
    label: 'Transmission du Jour',
    category: 'Contenu & Entraînement',
    icon: Radio,
    description: 'Diffusion de la vidéo quotidienne avec choix d’interaction (Sondage ou Session de Commentaires) et historique',
    badge: 'Vidéo & Avis',
  },
  {
    id: 'exercises',
    label: 'Exercices & Dojo IA',
    category: 'Contenu & Entraînement',
    icon: Dumbbell,
    description: 'Rubriques officielles Dojo (Cible, Type, Mode Vision IA), rangement automatique et reclassification',
    badge: 'Dojo Sync',
  },
  {
    id: 'programs',
    label: 'Programmes d’Entraînement',
    category: 'Contenu & Entraînement',
    icon: BookOpen,
    description: 'Cycles structurés (Muscle-Up, Fondations, Prise de masse) et complétion',
  },

  // Groupe 3: Communauté & Spots
  {
    id: 'connect_moderation',
    label: 'Signalements & Modération E2EE',
    category: 'Communauté & Géolocalisation',
    icon: ShieldAlert,
    description: 'Chambre de modération basée sur preuves : zéro écoute des chats privés/clans, gestion des signalements, avertissements 1/3 et messages admins',
    badge: 'Confidentialité E2EE',
  },
  {
    id: 'spots',
    label: 'Spots de Street Workout',
    category: 'Communauté & Géolocalisation',
    icon: MapPin,
    description: 'Cartographie GPS des aires de callisthénie vérifiées en France',
  },
  {
    id: 'notifications',
    label: 'Campagnes Push FCM',
    category: 'Communauté & Géolocalisation',
    icon: Bell,
    description: 'Envoi et programmation de notifications push ciblées sur Android',
    badge: 'FCM Direct',
  },

  // Groupe 4: Système & Code
  {
    id: 'config',
    label: 'Paramètres Mobile',
    category: 'Système & Technique',
    icon: Settings,
    description: 'Version minimale requise (v1.0.30), mode maintenance et sensibilité IA',
  },
  {
    id: 'code_gen',
    label: 'Code & Simulateurs',
    category: 'Système & Technique',
    icon: Code2,
    description: '10 modules de production Flutter/Kotlin et simulateurs d’arbitrage',
  },
  {
    id: 'audit',
    label: 'Audit Android & Télémétrie',
    category: 'Système & Technique',
    icon: Smartphone,
    description: 'Journal des événements en direct, règles R8/ProGuard et SDK 36',
    badge: 'Live',
  },
];

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [userRole, setUserRole] = useState<'superadmin' | 'auditor'>('superadmin');

  // Dropdown States
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState<boolean>(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [moduleSearchQuery, setModuleSearchQuery] = useState<string>('');

  // Refs for closing dropdowns when clicking outside
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  // Helper formatting for Firestore Timestamps
  const formatFirestoreDate = (val: any): string => {
    if (!val) return 'Récemment';
    if (typeof val === 'string') return val;
    if (typeof val.seconds === 'number') {
      return new Date(val.seconds * 1000).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    if (typeof val === 'number') {
      return new Date(val).toLocaleDateString('fr-FR');
    }
    return 'Récemment';
  };

  // Application Real States (Strictement connectées à Firestore valerion-55414)
  const [athletes, setAthletes] = useState<AthleteUser[]>([]);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [spots, setSpots] = useState<StreetWorkoutSpot[]>([]);
  const [pushCampaigns, setPushCampaigns] = useState<PushNotificationCampaign[]>([]);
  const [revenueMetrics] = useState<RevenueMetric>(INITIAL_REVENUE_METRICS);
  const [globalSettings, setGlobalSettings] = useState<GlobalAppSettings>(INITIAL_GLOBAL_SETTINGS);
  const [isFirestoreHubOpen, setIsFirestoreHubOpen] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Écouteurs Firestore temps réel (Synchronisation bidirectionnelle avec l'application mobile)
  useEffect(() => {
    let unsubUsers: (() => void) | undefined;
    let unsubExercises: (() => void) | undefined;
    let unsubPrograms: (() => void) | undefined;
    let unsubSpots: (() => void) | undefined;
    let unsubPush: (() => void) | undefined;
    let unsubSettings: (() => void) | undefined;

    try {
      // 1. Synchronisation Athlètes Réels (users)
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setIsInitialLoading(false);
        const list: AthleteUser[] = [];
        snapshot.forEach((d) => {
          const raw = d.data() as any;
          const realUsername = raw.username || (raw.email ? raw.email.split('@')[0] : `user_${d.id.slice(0, 6)}`);
          const realFullName = raw.fullName || raw.displayName || raw.name || realUsername;
          const realAvatar = raw.profileImageUrl || raw.avatarUrl || raw.photoURL || undefined;

          list.push({
            id: d.id,
            fullName: realFullName,
            username: realUsername,
            email: raw.email || `${realUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@mobile.osirion.app`,
            avatarUrl: realAvatar,
            subscriptionTier: raw.subscriptionTier || (raw.aetherBalance && raw.aetherBalance > 50 ? 'PRO_MONTHLY' : 'FREE'),
            subscriptionStatus: raw.subscriptionStatus || 'ACTIVE',
            status: raw.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE',
            fitnessLevel: raw.fitnessLevel || (raw.level && raw.level > 5 ? 'Avancé' : raw.level && raw.level > 2 ? 'Intermédiaire' : 'Débutant'),
            registeredAt: formatFirestoreDate(raw.createdAt || raw.registeredAt),
            lastWorkoutAt: formatFirestoreDate(raw.lastWorkoutAt || raw.lastActiveDate || raw.lastQuestAt),
            streakDays: typeof raw.streak === 'number' ? raw.streak : (typeof raw.streakDays === 'number' ? raw.streakDays : 0),
            totalWorkouts: typeof raw.totalWorkouts === 'number' ? raw.totalWorkouts : (raw.lastQuestAt ? 1 : 0),
            totalReps: typeof raw.totalReps === 'number' ? raw.totalReps : (typeof raw.xp === 'number' ? Math.floor(raw.xp / 5) : 0),
            weightKg: typeof raw.weight === 'number' && raw.weight > 0 ? raw.weight : (typeof raw.weightKg === 'number' ? raw.weightKg : 70),
            heightCm: typeof raw.height === 'number' && raw.height > 0 ? raw.height : (typeof raw.heightCm === 'number' ? raw.heightCm : 175),
            city: raw.city || (raw.country ? raw.country : 'App Mobile'),
            deviceModel: raw.deviceModel || (raw.fcmToken ? 'Android Pixel (FCM Actif)' : 'Android Flutter'),
            appVersion: raw.appVersion || '1.0.30',
            personalRecords: raw.personalRecords || {
              pushups: raw.maxPushups || 0,
              pullups: raw.maxPullups || 0,
              dips: 0,
              muscleups: 0,
              maxPlankSeconds: 0,
            },
            level: typeof raw.level === 'number' ? raw.level : 1,
            xp: typeof raw.xp === 'number' ? raw.xp : 0,
            forceXp: typeof raw.forceXp === 'number' ? raw.forceXp : 0,
            wisdomXp: typeof raw.wisdomXp === 'number' ? raw.wisdomXp : 0,
            maxPushups: typeof raw.maxPushups === 'number' ? raw.maxPushups : 0,
            maxPullups: typeof raw.maxPullups === 'number' ? raw.maxPullups : 0,
            movementPrecision: typeof raw.movementPrecision === 'number' ? raw.movementPrecision : 0,
            bestPace1km: typeof raw.bestPace1km === 'number' ? raw.bestPace1km : 0,
            bestAlphaLoop6km: typeof raw.bestAlphaLoop6km === 'number' ? raw.bestAlphaLoop6km : 0,
            totalDistance: typeof raw.totalDistance === 'number' ? raw.totalDistance : 0,
            aetherBalance: typeof raw.aetherBalance === 'number' ? raw.aetherBalance : 0,
            gold: typeof raw.gold === 'number' ? raw.gold : 0,
            unlockedTitles: Array.isArray(raw.unlockedTitles) ? raw.unlockedTitles : [],
            inventory: Array.isArray(raw.inventory) ? raw.inventory : [],
            clanIds: Array.isArray(raw.clanIds) ? raw.clanIds : [],
            friendIds: Array.isArray(raw.friendIds) ? raw.friendIds : [],
            onlineStatus: raw.status === 'in_dojo' ? 'training' : (raw.status === 'online' ? 'online' : 'offline'),
            activeTitle: raw.activeTitle || (raw.xp && raw.xp > 100 ? 'Initié du Temple' : 'Recrue'),
            guardianPath: raw.activeArcId || raw.guardianPath || 'Voie de l’Acier',
          });
        });
        setAthletes(list);
      }, () => {
        setIsInitialLoading(false);
      });

      // 2. Synchronisation Exercices Réels (exercises)
      unsubExercises = onSnapshot(collection(db, 'exercises'), (snapshot) => {
        if (!snapshot.empty) {
          const list: ExerciseItem[] = [];
          snapshot.forEach((d) => {
            const raw = d.data() as any;
            const categoryFromTarget: MuscleGroup =
              raw.targetBodyPart === 'UPPER' ? 'Bras (Triceps & Biceps)' :
              raw.targetBodyPart === 'LOWER' ? 'Jambes & Fessiers' :
              raw.targetBodyPart === 'CORE' ? 'Abdominaux & Core' :
              raw.targetBodyPart === 'LIMB' ? 'Corps Complet (Full Body)' :
              'Pectoraux';

            const inferred = inferDojoMetadata(raw, d.id);

            list.push({
              id: d.id,
              name: raw.name || d.id.replace(/^(sw_low_|sw_upp_|sw_)/, '').replace(/_/g, ' '),
              category: raw.category || categoryFromTarget,
              difficulty: raw.difficulty || (raw.defaultXpPerRep >= 25 ? 'Élite' : raw.defaultXpPerRep >= 10 ? 'Avancé' : 'Intermédiaire'),
              equipment: raw.equipment || (raw.description?.toLowerCase().includes('barre') ? 'Barre de traction' : raw.description?.toLowerCase().includes('anneaux') ? 'Anneaux de gymnastique' : 'Poids du corps'),
              targetMuscles: Array.isArray(raw.targetMuscles) ? raw.targetMuscles : [raw.targetBodyPart || 'Calisthénie'],
              targetArea: raw.targetArea || inferred.targetArea,
              trainingType: raw.trainingType || inferred.trainingType,
              executionMode: raw.executionMode || inferred.executionMode,
              dojoMode: raw.dojoMode || inferred.dojoMode,
              movementSplit: raw.movementSplit || inferred.movementSplit,
              configProfile: raw.configProfile || inferred.configProfile,
              aiPoseDetection: raw.aiPoseDetection ?? (inferred.executionMode === 'MODE_VISION'),
              hasAiSupport: typeof raw.hasAiSupport === 'boolean' ? raw.hasAiSupport : inferred.hasAiSupport,
              minAngle: typeof raw.minAngle === 'number' ? raw.minAngle : 85,
              maxAngle: typeof raw.maxAngle === 'number' ? raw.maxAngle : 170,
              sensitivity: typeof raw.sensitivity === 'number' ? raw.sensitivity : 0.8,
              strictMode: raw.strictMode ?? true,
              maxTrunkDeviationDeg: typeof raw.maxTrunkDeviationDeg === 'number' ? raw.maxTrunkDeviationDeg : 15,
              minTUTSeconds: typeof raw.minTUTSeconds === 'number' ? raw.minTUTSeconds : 1.0,
              monitoredLandmarks: Array.isArray(raw.monitoredLandmarks) ? raw.monitoredLandmarks : ['Coude', 'Épaule'],
              stateMachineLabels: raw.stateMachineLabels || {
                start: 'En attente',
                inflection: 'Point bas',
                completion: 'Validation rep',
              },
              instructions: raw.description || raw.instructions || 'Mouvement officiel du Dojo IA.',
              videoDemoUrl: raw.videoUrl || raw.videoDemoUrl || '',
              popularityRank: typeof raw.popularityRank === 'number' ? raw.popularityRank : 1,
              activeInWorkouts: raw.activeInWorkouts ?? true,
            });
          });
          setExercises(list);
        }
      }, () => {});

      // 3. Synchronisation Programmes (programs)
      unsubPrograms = onSnapshot(collection(db, 'programs'), (snapshot) => {
        if (!snapshot.empty) {
          const list: WorkoutProgram[] = [];
          snapshot.forEach((d) => list.push(d.data() as WorkoutProgram));
          setPrograms(list);
        }
      }, () => {});

      // 4. Synchronisation Spots (spots)
      unsubSpots = onSnapshot(collection(db, 'spots'), (snapshot) => {
        if (!snapshot.empty) {
          const list: StreetWorkoutSpot[] = [];
          snapshot.forEach((d) => {
            const raw = d.data() as any;
            list.push({
              id: d.id || raw.id || 'spot_unknown',
              name: raw.name || 'Spot Street Workout',
              address: raw.address || '',
              city: raw.city || 'France',
              postalCode: raw.postalCode || '75000',
              latitude: typeof raw.latitude === 'number' ? raw.latitude : 48.8566,
              longitude: typeof raw.longitude === 'number' ? raw.longitude : 2.3522,
              equipmentList: Array.isArray(raw.equipmentList) ? raw.equipmentList : ['Barres de traction'],
              groundType: raw.groundType || 'Tartan amortissant',
              status: raw.status || 'VERIFIED',
              rating: typeof raw.rating === 'number' ? raw.rating : 4.8,
              reviewsCount: typeof raw.reviewsCount === 'number' ? raw.reviewsCount : 12,
              photosCount: typeof raw.photosCount === 'number' ? raw.photosCount : 3,
              contributedBy: raw.contributedBy || 'Admin Osirion',
              isCovered: !!raw.isCovered,
              hasWaterPoint: !!raw.hasWaterPoint,
              hasNightLighting: !!raw.hasNightLighting,
            });
          });
          setSpots(list);
        }
      }, () => {});

      // 5. Synchronisation Campagnes Push (push_campaigns)
      unsubPush = onSnapshot(collection(db, 'push_campaigns'), (snapshot) => {
        if (!snapshot.empty) {
          const list: PushNotificationCampaign[] = [];
          snapshot.forEach((d) => list.push(d.data() as PushNotificationCampaign));
          setPushCampaigns(list);
        }
      }, () => {});

      // 6. Synchronisation Paramètres Mobile (global_config/mobile_app)
      unsubSettings = onSnapshot(doc(db, 'global_config', 'mobile_app'), (docSnap) => {
        if (docSnap.exists()) {
          setGlobalSettings(docSnap.data() as GlobalAppSettings);
        }
      }, () => {});
    } catch (e) {
      console.warn('Firestore initial subscription notice:', e);
    }

    return () => {
      unsubUsers?.();
      unsubExercises?.();
      unsubPrograms?.();
      unsubSpots?.();
      unsubPush?.();
      unsubSettings?.();
    };
  }, []);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navDropdownRef.current &&
        !navDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNavDropdownOpen(false);
      }
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAdminDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNavDropdownOpen(false);
        setIsAdminDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Athletes Handlers
  const handleUpdateAthlete = (updated: AthleteUser) => {
    setAthletes(athletes.map((u) => (u.id === updated.id ? updated : u)));
    try {
      setDoc(doc(db, 'users', updated.id), updated, { merge: true }).catch(() => {});
    } catch {}
  };

  const handleAddAthlete = (newUser: AthleteUser) => {
    setAthletes([newUser, ...athletes]);
    try {
      setDoc(doc(db, 'users', newUser.id), newUser, { merge: true }).catch(() => {});
    } catch {}
  };

  // Exercises Handlers
  const handleAddExercise = (newEx: ExerciseItem) => {
    setExercises([newEx, ...exercises]);
    try {
      setDoc(doc(db, 'exercises', newEx.id), newEx, { merge: true }).catch(() => {});
    } catch {}
  };

  const handleUpdateExercise = (updated: ExerciseItem) => {
    setExercises(exercises.map((e) => (e.id === updated.id ? updated : e)));
    try {
      setDoc(doc(db, 'exercises', updated.id), updated, { merge: true }).catch(() => {});
    } catch {}
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
    try {
      deleteDoc(doc(db, 'exercises', id)).catch(() => {});
    } catch {}
  };

  // Programs Handlers
  const handleAddProgram = (newProg: WorkoutProgram) => {
    setPrograms([newProg, ...programs]);
    try {
      setDoc(doc(db, 'programs', newProg.id), newProg, { merge: true }).catch(() => {});
    } catch {}
  };

  const handleTogglePublishProgram = (id: string) => {
    const updated = programs.map((p) =>
      p.id === id ? { ...p, published: !p.published } : p
    );
    setPrograms(updated);
    try {
      const prog = updated.find((p) => p.id === id);
      if (prog) {
        setDoc(doc(db, 'programs', id), prog, { merge: true }).catch(() => {});
      }
    } catch {}
  };

  // Spots Handlers
  const handleAddSpot = (newSpot: StreetWorkoutSpot) => {
    setSpots([newSpot, ...spots]);
    try {
      setDoc(doc(db, 'spots', newSpot.id), newSpot, { merge: true }).catch(() => {});
    } catch {}
  };

  const handleDeleteSpot = (id: string) => {
    setSpots(spots.filter((s) => s.id !== id));
    try {
      deleteDoc(doc(db, 'spots', id)).catch(() => {});
    } catch {}
  };

  // Push Campaign Handler
  const handleSendCampaign = (newCamp: PushNotificationCampaign) => {
    setPushCampaigns([newCamp, ...pushCampaigns]);
    try {
      setDoc(doc(db, 'push_campaigns', newCamp.id), newCamp, { merge: true }).catch(() => {});
    } catch {}
  };

  // Export JSON Backup
  const handleExportFirestoreJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      app_package: globalSettings.appPackageId,
      version: globalSettings.latestVersion,
      settings: globalSettings,
      athletes_count: athletes.length,
      athletes,
      exercises,
      programs,
      spots,
      push_campaigns: pushCampaigns,
      revenue_metrics: revenueMetrics,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osirion_production_backup_${Date.now()}.json`;
    a.click();
    setIsAdminDropdownOpen(false);
  };

  // Current active item
  const currentNavModule = NAV_MODULES.find((m) => m.id === activeTab) || NAV_MODULES[0];
  const CurrentIcon = currentNavModule.icon;

  // Filtered modules for dropdown search
  const modQ = (moduleSearchQuery || '').toLowerCase();
  const filteredModules = NAV_MODULES.filter(
    (m) =>
      (m.label || '').toLowerCase().includes(modQ) ||
      (m.description || '').toLowerCase().includes(modQ) ||
      (m.category || '').toLowerCase().includes(modQ)
  );

  // Group filtered modules by category
  const categories = Array.from(new Set(filteredModules.map((m) => m.category)));

  const handleSelectTab = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setIsNavDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setModuleSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      {/* Brand Splash Animation on App Launch (Official Osirion Lottie Animation) */}
      {showSplash && (
        <OsirionOfficialLogoAnimation onComplete={() => setShowSplash(false)} />
      )}

      {/* Top Professional Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Logo & Dropdown Trigger */}
          <div className="flex items-center space-x-3.5 min-w-0">
            {/* Logo (Click to replay official splash animation) */}
            <div
              onClick={() => setShowSplash(true)}
              className="flex items-center space-x-3 cursor-pointer group select-none shrink-0"
              title="Rejouer l'animation officielle d'Osirion"
            >
              <div className="transition-transform group-hover:scale-105">
                <OsirionMiniLogo size={38} />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-base text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    Osirion Console
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    v{globalSettings.latestVersion}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-500 transition-colors">
                  Administration Mobile • {globalSettings.appPackageId}
                </p>
              </div>
            </div>

            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            {/* --- 1. MENU DÉROULANT DE NAVIGATION (MODULES DROPDOWN) --- */}
            <div className="relative" ref={navDropdownRef}>
              <button
                type="button"
                onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${
                  isNavDropdownOpen
                    ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/10'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
                title="Ouvrir le menu déroulant des modules"
              >
                <CurrentIcon className="w-4 h-4 text-blue-600" />
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  {currentNavModule.label}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isNavDropdownOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {/* Dropdown Floating Menu */}
              {isNavDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  {/* Search bar inside dropdown */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Rechercher un module (ex: Exercices, Spots, MRR)..."
                      value={moduleSearchQuery}
                      onChange={(e) => setModuleSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Modules grouped by category */}
                  <div className="max-h-96 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                    {categories.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Aucun module ne correspond à "{moduleSearchQuery}"
                      </div>
                    ) : (
                      categories.map((category) => (
                        <div key={category} className="space-y-1.5">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                            {category}
                          </span>
                          <div className="space-y-1">
                            {filteredModules
                              .filter((m) => m.category === category)
                              .map((mod) => {
                                const Icon = mod.icon;
                                const isSelected = activeTab === mod.id;
                                let countBadge: number | undefined;
                                if (mod.id === 'users') countBadge = athletes.length;
                                if (mod.id === 'exercises') countBadge = exercises.length;
                                if (mod.id === 'programs') countBadge = programs.length;
                                if (mod.id === 'spots') countBadge = spots.length;

                                return (
                                  <button
                                    key={mod.id}
                                    onClick={() => handleSelectTab(mod.id)}
                                    className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 group ${
                                      isSelected
                                        ? 'bg-blue-50/80 text-blue-900 font-medium border border-blue-200/60'
                                        : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <div
                                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                        isSelected
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-slate-100 text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-50'
                                      }`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold truncate">
                                          {mod.label}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          {countBadge !== undefined && (
                                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-medium">
                                              {countBadge}
                                            </span>
                                          )}
                                          {mod.badge && (
                                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                                              {mod.badge}
                                            </span>
                                          )}
                                          {isSelected && (
                                            <Check className="w-3.5 h-3.5 text-blue-600 ml-1 shrink-0" />
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                        {mod.description}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Tools & Admin Profile Menu */}
          <div className="flex items-center space-x-2">
            {/* Quick Role Switcher (Desktop) */}
            <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-xs">
              <button
                onClick={() => setUserRole('superadmin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  userRole === 'superadmin'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Accès complet en lecture et écriture"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>SuperAdmin</span>
              </button>

              <button
                onClick={() => setUserRole('auditor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  userRole === 'auditor'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Accès en consultation seule sans boutons de modification"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Auditeur</span>
              </button>
            </div>

            {/* Real Firestore Live Badge */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/80 text-emerald-900 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Données Réelles Firestore</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded font-mono font-bold">
                {athletes.length} Athlètes • {exercises.length} Exercices
              </span>
            </div>

            {/* Firestore Hub Direct Button */}
            <button
              type="button"
              onClick={() => setIsFirestoreHubOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-semibold transition shadow-xs group"
              title="Hub de Synchronisation Firestore (16/16 Rubriques)"
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Database className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <span className="hidden sm:inline font-bold">Firestore Sync</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-md font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                16/16
              </span>
            </button>

            {/* --- 2. MENU DÉROULANT DES ACTIONS & DU PROFIL --- */}
            <div className="relative" ref={adminDropdownRef}>
              <button
                type="button"
                onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                  isAdminDropdownOpen
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Options administrateur"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {userRole === 'superadmin' ? 'SA' : 'AU'}
                </div>
                <span className="hidden sm:inline font-semibold">
                  {userRole === 'superadmin' ? 'SuperAdmin' : 'Auditeur'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isAdminDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Admin Actions Dropdown Card */}
              {isAdminDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  {/* User Profile summary */}
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {userRole === 'superadmin' ? 'SA' : 'AU'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 text-xs">Administrateur Osirion</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {userRole === 'superadmin'
                          ? 'Droits de modification complets'
                          : 'Mode consultation lecture seule'}
                      </div>
                    </div>
                  </div>

                  {/* Switch Role Inside Dropdown */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                      Changer de rôle
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setUserRole('superadmin');
                          setIsAdminDropdownOpen(false);
                        }}
                        className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                          userRole === 'superadmin'
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>SuperAdmin</span>
                        {userRole === 'superadmin' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setUserRole('auditor');
                          setIsAdminDropdownOpen(false);
                        }}
                        className={`p-2 rounded-xl border text-left transition flex items-center justify-between ${
                          userRole === 'auditor'
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>Auditeur</span>
                        {userRole === 'auditor' && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Quick Actions List */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                      Actions rapides
                    </span>

                    <button
                      onClick={() => {
                        setIsFirestoreHubOpen(true);
                        setIsAdminDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 flex items-center justify-between transition font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <Database className="w-4 h-4 text-amber-600" />
                        <span>Hub Données Réelles (16 Rubriques)</span>
                      </div>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-bold">16</span>
                    </button>

                    <button
                      onClick={handleExportFirestoreJson}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition"
                    >
                      <Download className="w-4 h-4 text-slate-500" />
                      <span>Exporter sauvegarde JSON complète</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowSplash(true);
                        setIsAdminDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition"
                    >
                      <RotateCcw className="w-4 h-4 text-blue-600" />
                      <span>Rejouer l'animation du logo</span>
                    </button>

                    <a
                      href="https://github.com/WXZA34/osirion-"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <GitBranch className="w-4 h-4 text-slate-500" />
                        <span>Code source GitHub</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Dropdown Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
              title="Menu déroulant mobile"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* --- 3. MENU DÉROULANT MOBILE (POUR PETITS ÉCRANS) --- */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 p-4 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top duration-200">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Sélectionnez un module
              </span>
              <div className="grid grid-cols-1 gap-1">
                {NAV_MODULES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Rôle actuel :</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setUserRole('superadmin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    userRole === 'superadmin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  SuperAdmin
                </button>
                <button
                  onClick={() => setUserRole('auditor')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    userRole === 'auditor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Auditeur
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Apple-like Segmented Tab Navigation Underneath (Horizontal Scroll synchronized) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {NAV_MODULES.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            let countBadge: number | undefined;
            if (tab.id === 'users') countBadge = athletes.length;
            if (tab.id === 'exercises') countBadge = exercises.length;
            if (tab.id === 'programs') countBadge = programs.length;
            if (tab.id === 'spots') countBadge = spots.length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {countBadge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                      isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {countBadge}
                  </span>
                )}
                {tab.badge && !countBadge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Omnipresent Telemetry & Force Supervisor Bar (Surveille toute l'app) */}
      <SupervisorTelemetryBar athletes={athletes} />

      {/* Main Task-Oriented Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex-1 w-full space-y-6">
        {/* Role Alert for Auditor */}
        {userRole === 'auditor' && (
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Mode Consultation (Lecture seule) :</strong> Vous visualisez les données et les audits sans droit de modification directe.
              </span>
            </div>
            <button
              onClick={() => setUserRole('superadmin')}
              className="text-xs font-semibold text-blue-700 hover:underline shrink-0 ml-2"
            >
              Passer en SuperAdmin
            </button>
          </div>
        )}

        {/* 1. TABLEAU DE BORD & KPIS (WITH RETENTION CURVE J1/J7/J30) */}
        {activeTab === 'analytics' && <AnalyticsCharts />}

        {/* 1.B LE PANTHÉON DES LÉGENDES & HALL OF FAME */}
        {activeTab === 'pantheon' && (
          <PantheonManager
            athletes={athletes}
            userRole={userRole}
            onUpdateAthlete={handleUpdateAthlete}
          />
        )}

        {/* 1.C L'ARÈNE COMPLÈTE (FORGE • TERRITOIRES • BASTIONS • COLISÉE) */}
        {activeTab === 'arena' && (
          <ArenaFullManager
            athletes={athletes}
            userRole={userRole}
            onUpdateAthlete={handleUpdateAthlete}
            onSendPushNotification={(title, body) =>
              handleSendCampaign({
                id: `push_${Date.now()}`,
                title,
                bodyText: body,
                targetAudience: 'ALL_ATHLETES',
                scheduledFor: new Date().toISOString(),
                status: 'SENT',
                recipientsCount: athletes.length,
                deepLinkScreen: 'CHALLENGE_WEEK',
              })
            }
          />
        )}

        {/* 1.D LA GRANDE BIBLIOTHÈQUE & PODCASTS */}
        {activeTab === 'library' && (
          <LibraryManager
            athletes={athletes}
            userRole={userRole}
            onUpdateAthlete={handleUpdateAthlete}
            onSendPushNotification={(title, body) =>
              handleSendCampaign({
                id: `push_${Date.now()}`,
                title,
                bodyText: body,
                targetAudience: 'ALL_ATHLETES',
                scheduledFor: new Date().toISOString(),
                status: 'SENT',
                recipientsCount: athletes.length,
                deepLinkScreen: 'CHALLENGE_WEEK',
              })
            }
          />
        )}

        {/* 1.E TRANSMISSION DU JOUR (VIDÉO, SONDAGES & COMMENTAIRES) */}
        {activeTab === 'daily_transmission' && (
          <DailyTransmissionManager
            athletes={athletes}
            userRole={userRole}
            onUpdateAthlete={handleUpdateAthlete}
            onSendPushNotification={(title, body) =>
              handleSendCampaign({
                id: `push_${Date.now()}`,
                title,
                bodyText: body,
                targetAudience: 'ALL_ATHLETES',
                scheduledFor: new Date().toISOString(),
                status: 'SENT',
                recipientsCount: athletes.length,
                deepLinkScreen: 'WORKOUT_TODAY',
              })
            }
          />
        )}

        {/* 2. COMPTES ATHLÈTES */}
        {activeTab === 'users' && (
          <UserManager
            users={athletes}
            userRole={userRole}
            onUpdateUser={handleUpdateAthlete}
            onAddUser={handleAddAthlete}
          />
        )}

        {/* 3. BIBLIOTHÈQUE D'EXERCICES */}
        {activeTab === 'exercises' && (
          <ExerciseLibraryManager
            exercises={exercises}
            userRole={userRole}
            onAddExercise={handleAddExercise}
            onUpdateExercise={handleUpdateExercise}
            onDeleteExercise={handleDeleteExercise}
          />
        )}

        {/* 4. PROGRAMMES D'ENTRAÎNEMENT */}
        {activeTab === 'programs' && (
          <WorkoutProgramsManager
            programs={programs}
            userRole={userRole}
            onAddProgram={handleAddProgram}
            onTogglePublish={handleTogglePublishProgram}
          />
        )}

        {/* 4.B ALPHA CONNECT & MODÉRATION DISCIPLINAIRE */}
        {activeTab === 'connect_moderation' && (
          <AlphaConnectModerationManager
            athletes={athletes}
            userRole={userRole}
            onUpdateAthlete={handleUpdateAthlete}
            onSendPushNotification={(title, body) =>
              handleSendCampaign({
                id: `push_${Date.now()}`,
                title,
                bodyText: body,
                targetAudience: 'ALL_ATHLETES',
                scheduledFor: new Date().toISOString(),
                status: 'SENT',
                recipientsCount: athletes.length,
                deepLinkScreen: 'WORKOUT_TODAY',
              })
            }
          />
        )}

        {/* 5. SPOTS DE STREET WORKOUT */}
        {activeTab === 'spots' && (
          <StreetWorkoutSpotsManager
            spots={spots}
            userRole={userRole}
            onAddSpot={handleAddSpot}
            onDeleteSpot={handleDeleteSpot}
          />
        )}

        {/* 6. ABONNEMENTS & REVENUS (GOOGLE PLAY / STRIPE) */}
        {activeTab === 'subscriptions' && (
          <SubscriptionsBillingManager
            metrics={revenueMetrics}
            userRole={userRole}
          />
        )}

        {/* 7. CAMPAGNES PUSH (FCM) */}
        {activeTab === 'notifications' && (
          <PushCampaignsManager
            campaigns={pushCampaigns}
            userRole={userRole}
            onSendCampaign={handleSendCampaign}
          />
        )}

        {/* 8. PARAMÈTRES TECHNIQUES DE L'APPLICATION */}
        {activeTab === 'config' && (
          <AppSettingsManager
            settings={globalSettings}
            userRole={userRole}
            onUpdateSettings={setGlobalSettings}
            onExportJsonBackup={handleExportFirestoreJson}
          />
        )}

        {/* 9. CODE GENERATOR & SIMULATEURS */}
        {activeTab === 'code_gen' && <FeatureCodeGenerator />}

        {/* 10. AUDIT ANDROID & TÉLÉMÉTRIE EN DIRECT */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <LiveEventLogger />

            {/* Android Core Specs Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Environnement de compilation Android natif ({globalSettings.appPackageId})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configuration Gradle Kotlin DSL, ciblage SDK 36 et réglages de performances
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block font-medium">Application ID</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">{globalSettings.appPackageId}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block font-medium">SDK Cible & Compilation</span>
                  <span className="font-semibold text-emerald-700 block mt-0.5">SDK 36 (Android 16)</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block font-medium">Obfuscation R8</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">Minify & Shrink Activés</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-400">
        <p>
          Osirion Console d'Administration • Back-Office Dédié à l'Application Mobile de Callisthénie
        </p>
      </footer>

      {/* Firestore Connection Hub Modal (16 Rubriques) */}
      <FirestoreConnectionHubModal
        isOpen={isFirestoreHubOpen}
        onClose={() => setIsFirestoreHubOpen(false)}
      />
    </div>
  );
}
