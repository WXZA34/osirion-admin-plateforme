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
  Library
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
} from './types/admin';

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

export type AdminTab =
  | 'analytics'
  | 'pantheon'
  | 'arena'
  | 'library'
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

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  
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

  // Application Real States
  const [athletes, setAthletes] = useState<AthleteUser[]>(INITIAL_ATHLETES);
  const [clans, setClans] = useState<Clan[]>([]);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [programs, setPrograms] = useState<WorkoutProgram[]>(INITIAL_PROGRAMS);
  const [spots, setSpots] = useState<StreetWorkoutSpot[]>(INITIAL_SPOTS);
  const [pushCampaigns, setPushCampaigns] = useState<PushNotificationCampaign[]>(INITIAL_PUSH_CAMPAIGNS);
  const [revenueMetrics] = useState<RevenueMetric>(INITIAL_REVENUE_METRICS);
  const [globalSettings, setGlobalSettings] = useState<GlobalAppSettings>(INITIAL_GLOBAL_SETTINGS);

  // Synchronisation des Utilisateurs en Temps Réel (Firebase)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // On enlève orderBy pour éviter les erreurs d'index manquant sur Firestore
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realAthletes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: data.pseudo || data.username || 'Athlète Alpha',
          username: data.username || doc.id,
          email: data.email || 'non-renseigné@osirion.com',
          subscriptionTier: 'FREE', // By default until we have billing
          subscriptionStatus: data.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
          status: data.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
          fitnessLevel: 'Initié',
          registeredAt: data.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || 'Inconnu',
          lastWorkoutAt: data.lastActiveDate?.toDate?.()?.toISOString()?.split('T')[0] || 'Jamais',
          streakDays: data.streak || 0,
          totalWorkouts: 0,
          totalReps: (data.maxPushups || 0) + (data.maxPullups || 0),
          weightKg: data.weight || 0,
          heightCm: data.height || 0,
          age: data.age || 0,
          bodyFat: data.bodyFat || 0,
          muscleMass: data.muscleMass || 0,
          city: 'Inconnue',
          deviceModel: 'Android',
          appVersion: '1.0.0',
          level: data.level || 1,
          xp: data.xp || 0,
          forceXp: data.forceXp || 0,
          wisdomXp: data.wisdomXp || 0,
          maxPushups: data.maxPushups || 0,
          maxPullups: data.maxPullups || 0,
          movementPrecision: data.movementPrecision || 0,
          bestPace1km: data.bestPace1km || 0,
          bestAlphaLoop6km: data.bestAlphaLoop6km || 0,
          totalDistance: data.totalDistance || 0,
          aetherBalance: data.aetherBalance || 0,
          gold: data.gold || 0,
          activeHalo: data.activeHalo,
          activeTitle: data.activeTitle,
          unlockedTitles: data.unlockedTitles || [],
          inventory: data.inventory || [],
          activeArcId: data.activeArcId,
          guardianPath: data.bio ? 'Voie Personnalisée' : 'Voie Initiale',
          ultimateOath: data.bio,
          clanIds: data.clanIds || [],
          friendIds: data.friendIds || [],
          onlineStatus: 'offline', // We could infer from lastActiveDate if needed
          personalRecords: {
            pushups: data.maxPushups || 0,
            pullups: data.maxPullups || 0,
            dips: 0,
            muscleups: 0,
            maxPlankSeconds: 0,
          },
        } as AthleteUser;
      });
      // Sort in memory to avoid missing index errors in Firestore
      realAthletes.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
      
      // We don't fallback to INITIAL_ATHLETES anymore so you can see if your database is truly empty
      setAthletes(realAthletes);
    }, (error) => {
      console.error("Erreur de synchronisation Firestore :", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Synchronisation des Clans en Temps Réel (Firebase)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const q = query(collection(db, 'clans'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realClans = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Clan Inconnu',
          description: data.description || '',
          leaderPseudo: data.leaderPseudo || data.leaderId || 'Système',
          membersCount: Array.isArray(data.members) ? data.members.length : (data.membersCount || 1),
          totalXp: data.totalXp || 0,
          ranking: data.ranking || 0,
          territoriesHeld: data.territoriesHeld || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
          logoUrl: data.logoUrl,
          isRecruiting: data.isRecruiting !== false,
          factionMotto: data.factionMotto || '',
        } as Clan;
      });
      // Sort by XP
      realClans.sort((a, b) => b.totalXp - a.totalXp);
      
      setClans(realClans);
    }, (error) => {
      console.error("Erreur de synchronisation Firestore (Clans) :", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Synchronisation de la Bibliothèque d'Exercices (Firebase)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const q = query(collection(db, 'exercises'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realExercises = snapshot.docs.map(doc => {
        const data = doc.data();
        const initialMatch = INITIAL_EXERCISES.find(ex => ex.id === doc.id || ex.name === data.name);
        return {
          ...initialMatch,
          ...data,
          id: doc.id,
          targetArea: data.targetArea || initialMatch?.targetArea || 'HAUT_DU_CORPS',
          trainingType: data.trainingType || initialMatch?.trainingType || 'FORCE',
          executionMode: data.executionMode || initialMatch?.executionMode || 'MODE_VISION',
          dojoMode: data.dojoMode || initialMatch?.dojoMode || 'DYNAMIC_REPS',
          movementSplit: data.movementSplit || initialMatch?.movementSplit || 'FULL_BODY',
          configProfile: data.configProfile || initialMatch?.configProfile || 'STANDARD_DAILY'
        } as ExerciseItem;
      });
      
      // Use only Firestore data as requested by the user
      if (realExercises.length > 0) {
        setExercises(realExercises);
      } else {
        setExercises([]);
      }
    }, (error) => {
      console.error("Erreur de synchronisation Firestore (Exercices) :", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Synchronisation des Bastions (Firebase)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const q = query(collection(db, 'bastions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realBastions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Bastion',
          address: data.address || '',
          city: data.city || 'Inconnue',
          postalCode: data.postalCode || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          equipmentList: data.equipmentList || [],
          groundType: data.groundType || 'Béton / Bitume',
          status: data.status || 'VERIFIED',
          rating: data.rating || 5,
          reviewsCount: data.reviewsCount || 0,
          photosCount: data.photosCount || 0,
          contributedBy: data.contributedBy || 'System',
          isCovered: data.isCovered || false,
          hasWaterPoint: data.hasWaterPoint || false,
          hasNightLighting: data.hasNightLighting || false,
          images: data.images || [],
        } as StreetWorkoutSpot;
      });
      
      if (realBastions.length > 0) {
        setSpots(realBastions);
      }
    }, (error) => {
      console.error("Erreur de synchronisation Firestore (Bastions) :", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Synchronisation des Programmes (Firebase)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const q = query(collection(db, 'programs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const realPrograms = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as WorkoutProgram;
      });
      
      if (realPrograms.length > 0) {
        setPrograms(realPrograms);
      }
    }, (error) => {
      console.error("Erreur de synchronisation Firestore (Programmes) :", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Synchronisation des Global Settings (Firebase)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const unsubscribe = onSnapshot(collection(db, 'global_config'), (snapshot) => {
      let appSettingsDoc = null;
      for (const doc of snapshot.docs) {
        if (doc.id.trim() === 'app_settings') {
          appSettingsDoc = doc;
          break;
        }
      }
      
      if (appSettingsDoc) {
        const data = appSettingsDoc.data();
        setGlobalSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    }, (error) => {
      console.error("Erreur de synchronisation Firestore (Global Settings) :", error);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

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
  const handleUpdateAthlete = async (updated: AthleteUser) => {
    // 1. Mise à jour optimiste locale
    setAthletes(athletes.map((u) => (u.id === updated.id ? updated : u)));
    
    // 2. Envoi de la mise à jour à Firebase
    try {
      // Import the needed firestore functions dynamically or use them if already imported.
      // Since it's a small update, we map the fields we care about.
      const { doc, updateDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', updated.id);
      
      const updateData: any = {};
      if (updated.status === 'SUSPENDED') {
        updateData.status = 'SUSPENDED';
      } else {
        updateData.status = 'ACTIVE';
      }
      
      if (updated.aetherBalance !== undefined) updateData.aetherBalance = updated.aetherBalance;
      if (updated.gold !== undefined) updateData.gold = updated.gold;
      
      await updateDoc(userRef, updateData);
    } catch (e) {
      console.error("Erreur lors de la mise à jour Firebase de l'athlète:", e);
    }
  };

  const handleAddAthlete = (newUser: AthleteUser) => {
    setAthletes([newUser, ...athletes]);
  };

  // Exercises Handlers
  const handleAddExercise = async (newEx: ExerciseItem) => {
    setExercises([newEx, ...exercises]);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'exercises', newEx.id), newEx);
    } catch (e) {
      console.error("Erreur ajout exercice Firebase:", e);
    }
  };

  const handleUpdateExercise = async (updated: ExerciseItem) => {
    setExercises(exercises.map((e) => (e.id === updated.id ? updated : e)));
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'exercises', updated.id), { ...updated });
    } catch (e) {
      console.error("Erreur update exercice Firebase:", e);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'exercises', id));
    } catch (e) {
      console.error("Erreur suppression exercice Firebase:", e);
    }
  };

  // Programs Handlers
  const handleAddProgram = async (newProg: WorkoutProgram) => {
    setPrograms([newProg, ...programs]);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'programs', newProg.id), newProg);
    } catch (e) {
      console.error("Erreur ajout programme Firebase:", e);
    }
  };

  const handleTogglePublishProgram = async (id: string) => {
    const prog = programs.find((p) => p.id === id);
    if (!prog) return;
    const newPublished = !prog.published;
    setPrograms(
      programs.map((p) => (p.id === id ? { ...p, published: newPublished } : p))
    );
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'programs', id), { published: newPublished });
    } catch (e) {
      console.error("Erreur update programme Firebase:", e);
    }
  };

  // Spots Handlers
  const handleAddSpot = async (newSpot: StreetWorkoutSpot) => {
    setSpots([newSpot, ...spots]);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'bastions', newSpot.id), newSpot);
    } catch (e) {
      console.error("Erreur ajout spot Firebase:", e);
    }
  };

  const handleDeleteSpot = async (id: string) => {
    setSpots(spots.filter((s) => s.id !== id));
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'bastions', id));
    } catch (e) {
      console.error("Erreur suppression spot Firebase:", e);
    }
  };

  // Global Settings Handler
  const handleUpdateGlobalSettings = async (newSettings: GlobalAppSettings) => {
    setGlobalSettings(newSettings);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'global_config', 'app_settings'), newSettings);
    } catch (e) {
      console.error("Erreur update global settings Firebase:", e);
    }
  };

  // Push Campaign Handler
  const handleSendCampaign = (newCamp: PushNotificationCampaign) => {
    setPushCampaigns([newCamp, ...pushCampaigns]);
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
  const filteredModules = NAV_MODULES.filter(
    (m) =>
      m.label.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(moduleSearchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(moduleSearchQuery.toLowerCase())
  );

  // Group filtered modules by category
  const categories = Array.from(new Set(filteredModules.map((m) => m.category)));

  const handleSelectTab = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setIsNavDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setModuleSearchQuery('');
  };

  // Liste des emails autorisés à accéder au Dashboard Admin
  const ADMIN_EMAILS = ['roland1kokou@gmail.com'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
          setIsAuthenticated(true);
        } else {
          // L'utilisateur n'est pas admin, on le déconnecte par sécurité
          signOut(auth);
          setIsAuthenticated(false);
          setLoginError(`Accès refusé. Le compte ${user.email} n'est pas administrateur.`);
        }
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      if (userCredential.user.email && !ADMIN_EMAILS.includes(userCredential.user.email)) {
        await signOut(auth);
        setLoginError('Accès refusé. Ce compte n\'a pas les privilèges administrateur.');
      }
    } catch (err: any) {
      setLoginError('Identifiants incorrects ou accès refusé. (' + err.message + ')');
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      if (userCredential.user.email && !ADMIN_EMAILS.includes(userCredential.user.email)) {
        await signOut(auth);
        setLoginError('Accès refusé. Ce compte n\'a pas les privilèges administrateur.');
      }
    } catch (err: any) {
      setLoginError('Erreur de connexion Google. (' + err.message + ')');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4 selection:bg-blue-500/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="relative bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex justify-center mb-6">
            <OsirionMiniLogo size={56} />
          </div>
          <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">Console d'Administration</h1>
          <p className="text-slate-400 text-center mb-8 text-sm">Veuillez vous authentifier pour accéder aux données en temps réel.</p>
          
          {loginError && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm mb-6 border border-red-500/20 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Administrateur</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                  placeholder="admin@osirion.com"
                  required 
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe de Sécurité</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none" 
                  placeholder="••••••••••••"
                  required 
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-2">
              <Terminal className="w-4 h-4" />
              Initialiser la connexion
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <button 
              onClick={handleGoogleLogin} 
              type="button" 
              className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        {activeTab === 'analytics' && <AnalyticsCharts athletes={athletes} />}

        {/* 1.B LE PANTHÉON DES LÉGENDES & HALL OF FAME */}
        {activeTab === 'pantheon' && (
          <PantheonManager
            athletes={athletes}
            clans={clans}
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
            onUpdateSettings={handleUpdateGlobalSettings}
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
    </div>
  );
}
