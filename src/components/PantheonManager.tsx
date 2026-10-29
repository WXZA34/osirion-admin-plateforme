import React, { useState, useEffect } from 'react';
import { AthleteUser, Clan } from '../types/admin';
import {
  PantheonRecord,
  PantheonTitle,
  PantheonHalo,
  PantheonSeasonArchive,
  INITIAL_PANTHEON_RECORDS,
  INITIAL_PANTHEON_TITLES,
  INITIAL_PANTHEON_HALOS,
  INITIAL_PANTHEON_CLANS,
  INITIAL_PANTHEON_SEASONS,
  TitleRarity,
} from '../data/pantheonData';
import {
  BastionTacticalSpot,
  TerritoryHexModel,
  BastionTacticalStatus,
  TerritoryTacticalStatus,
} from '../types/arena';
import {
  INITIAL_BASTIONS_SPOTS,
  INITIAL_HEX_TERRITORIES,
} from '../data/arenaData';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Crown,
  Trophy,
  Award,
  Shield,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  Plus,
  Coins,
  Activity,
  Flame,
  Calendar,
  Send,
  Sliders,
  Eye,
  Trash2,
  Check,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Users,
  Compass,
  Radio,
  MapPin,
  Scale,
  BookOpen,
  Volume2,
  Video,
  Globe,
  Share2,
  Dumbbell,
  Hexagon,
  Swords,
  ShieldAlert,
  Crosshair,
  Layers,
  Building2,
  Navigation,
  UploadCloud,
  Lock,
  Unlock,
  History,
  Map,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';

export type PantheonSortType = 'xp' | 'forceXp' | 'wisdomXp' | 'clans';

interface PantheonManagerProps {
  athletes: AthleteUser[];
  userRole?: 'superadmin' | 'auditor';
  onUpdateAthlete?: (updated: AthleteUser) => void;
  onSendPushNotification?: (title: string, body: string) => void;
}

export const PantheonManager: React.FC<PantheonManagerProps> = ({
  athletes,
  userRole = 'superadmin',
  onUpdateAthlete,
  onSendPushNotification,
}) => {
  // Navigation Principale du Panthéon
  const [activeMainTab, setActiveMainTab] = useState<
    'rankings' | 'clans_management' | 'connect' | 'domination' | 'records' | 'titles_halos' | 'seasons'
  >(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes('domination') || hash.includes('domination')) {
        return 'domination';
      }
    }
    return 'rankings';
  });

  // Les 4 Types Officiels de Classement (Issus du code Flutter Osirion)
  const [currentSortBy, setCurrentSortBy] = useState<PantheonSortType>('xp');
  const [scopeFilter, setScopeFilter] = useState<'GLOBAL' | 'FRANCE' | 'PARIS' | 'LYON' | 'MARSEILLE'>('GLOBAL');

  // Datasets Réels
  const [records, setRecords] = useState<PantheonRecord[]>(INITIAL_PANTHEON_RECORDS);
  const [titles, setTitles] = useState<PantheonTitle[]>(INITIAL_PANTHEON_TITLES);
  const [halos, setHalos] = useState<PantheonHalo[]>(INITIAL_PANTHEON_HALOS);
  const [clansList, setClansList] = useState<Clan[]>(INITIAL_PANTHEON_CLANS);
  const [seasons] = useState<PantheonSeasonArchive[]>(INITIAL_PANTHEON_SEASONS);

  // Datasets Domination Territoriale H3
  const [bastions, setBastions] = useState<BastionTacticalSpot[]>(INITIAL_BASTIONS_SPOTS);
  const [territories, setTerritories] = useState<TerritoryHexModel[]>(INITIAL_HEX_TERRITORIES);
  const [dominationView, setDominationView] = useState<'bastions' | 'map_h3' | 'clans_leaderboard'>('bastions');
  const [dominationCityFilter, setDominationCityFilter] = useState<string>('ALL');
  const [dominationStatusFilter, setDominationStatusFilter] = useState<string>('ALL');
  const [dominationSearch, setDominationSearch] = useState<string>('');
  const [selectedHexId, setSelectedHexId] = useState<string | null>(null);

  // Modals Domination
  const [showAddBastionModal, setShowAddBastionModal] = useState<boolean>(false);
  const [transferringBastion, setTransferringBastion] = useState<BastionTacticalSpot | null>(null);
  const [siegingBastion, setSiegingBastion] = useState<BastionTacticalSpot | null>(null);
  const [detailBastion, setDetailBastion] = useState<BastionTacticalSpot | null>(null);
  const [isSyncingDomination, setIsSyncingDomination] = useState<boolean>(false);

  // Formulaire Nouveau Bastion
  const [newBastionName, setNewBastionName] = useState('');
  const [newBastionCity, setNewBastionCity] = useState('Paris');
  const [newBastionNeighborhood, setNewBastionNeighborhood] = useState('');
  const [newBastionLat, setNewBastionLat] = useState<number>(48.8566);
  const [newBastionLng, setNewBastionLng] = useState<number>(2.3522);
  const [newBastionType, setNewBastionType] = useState<BastionTacticalSpot['type']>('PARC_COMPLET');
  const [newBastionEquipmentInput, setNewBastionEquipmentInput] = useState<string>(
    'Kenguru Pro Master, Barres de Dips Jumelées, Barres Freestyle'
  );
  const [newBastionClan, setNewBastionClan] = useState('Ronin Calisthenics Paris');
  const [newBastionBossPseudo, setNewBastionBossPseudo] = useState('max_frontlever');
  const [newBastionBossReps, setNewBastionBossReps] = useState(30);
  const [newBastionBossExercise, setNewBastionBossExercise] = useState('Tractions strictes');
  const [newBastionStatus, setNewBastionStatus] = useState<BastionTacticalStatus>('FORTERESSE');

  // Formulaire Transfert de Souveraineté
  const [transferTargetClanName, setTransferTargetClanName] = useState('Ronin Calisthenics Paris');
  const [transferNewStatus, setTransferNewStatus] = useState<BastionTacticalStatus>('FORTERESSE');
  const [transferSendPush, setTransferSendPush] = useState(true);

  // Formulaire Alerte Siège
  const [siegeAttackingClanName, setSiegeAttackingClanName] = useState('Sparta Street Workout Lyon');
  const [siegePushCustomText, setSiegePushCustomText] = useState('');

  // Searches
  const [clanSearchQuery, setClanSearchQuery] = useState('');
  const [athleteSearchQuery, setAthleteSearchQuery] = useState('');
  const [recordStatusFilter, setRecordStatusFilter] = useState<string>('ALL');

  // Dialogs / Modals
  const [inspectedAthlete, setInspectedAthlete] = useState<AthleteUser | null>(null);
  const [inspectedClan, setInspectedClan] = useState<Clan | null>(null);
  const [showCreateClanModal, setShowCreateClanModal] = useState(false);
  const [showInductModal, setShowInductModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showNewTitleModal, setShowNewTitleModal] = useState(false);
  const [showCloseSeasonModal, setShowCloseSeasonModal] = useState(false);

  // Formulaire Fonder un Clan
  const [newClanName, setNewClanName] = useState('');
  const [newClanDescription, setNewClanDescription] = useState('');
  const [newClanLeader, setNewClanLeader] = useState('max_frontlever');
  const [newClanMotto, setNewClanMotto] = useState('« Force et Rigueur sous la Barre »');
  const [newClanTerritory, setNewClanTerritory] = useState(1);

  // Formulaire Intronisation
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
  const [selectedTitleId, setSelectedTitleId] = useState<string>('Titan d\'Acier');
  const [selectedHaloId, setSelectedHaloId] = useState<string>('Halo Alpha Gold');
  const [bonusAether, setBonusAether] = useState<number>(500);

  // Formulaire Nouveau Titre
  const [newTitleName, setNewTitleName] = useState('');
  const [newTitleRarity, setNewTitleRarity] = useState<TitleRarity>('EPIC');
  const [newTitleDesc, setNewTitleDesc] = useState('');
  const [newTitleCondition, setNewTitleCondition] = useState('');

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- FILTRAGE ET TRI SELON LES 4 TYPES DE CLASSEMENTS ---
  // 1. Filtrage géographique des athlètes
  const filteredAthletesByScope = athletes.filter((a) => {
    if (scopeFilter === 'GLOBAL') return true;
    if (scopeFilter === 'FRANCE') return true; // Tous nos mock sont basés en France
    const cityLower = (a.city || '').toLowerCase();
    if (scopeFilter === 'PARIS') return cityLower.includes('paris');
    if (scopeFilter === 'LYON') return cityLower.includes('lyon');
    if (scopeFilter === 'MARSEILLE') return cityLower.includes('marseille');
    return true;
  });

  // 2. Tri dynamique pour les 3 classements individuels
  const sortedAthletes = [...filteredAthletesByScope].sort((a, b) => {
    if (currentSortBy === 'xp') {
      return (b.xp || 0) - (a.xp || 0); // Alpha Suprême (Harmonie)
    }
    if (currentSortBy === 'forceXp') {
      return (b.forceXp || 0) - (a.forceXp || 0); // Maîtres du Dojo (Force)
    }
    if (currentSortBy === 'wisdomXp') {
      return (b.wisdomXp || 0) - (a.wisdomXp || 0); // Sages de l'Arène (Sagesse)
    }
    return 0;
  });

  // 3. Tri et filtrage pour le 4ème classement : Factions (Top Clans)
  const clanQ = (clanSearchQuery || '').toLowerCase();
  const sortedClans = [...clansList]
    .filter(
      (c) =>
        (c.name || '').toLowerCase().includes(clanQ) ||
        (c.leaderPseudo || '').toLowerCase().includes(clanQ) ||
        (c.description || '').toLowerCase().includes(clanQ)
    )
    .sort((a, b) => b.totalXp - a.totalXp);

  // Top 3 Athlètes pour le podium actuel
  const podiumTop1 = sortedAthletes[0];
  const podiumTop2 = sortedAthletes[1];
  const podiumTop3 = sortedAthletes[2];

  // Top 3 Clans pour le podium Factions
  const clanPodium1 = sortedClans[0];
  const clanPodium2 = sortedClans[1];
  const clanPodium3 = sortedClans[2];

  // Actions
  const handleApproveRecord = (recId: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recId
          ? { ...r, status: 'HOMOLOGATED', certifiedBy: `Validé par SuperAdmin le ${new Date().toLocaleDateString()}` }
          : r
      )
    );
    showToast('Record homologué et gravé au Panthéon avec succès !');
  };

  const handleRejectRecord = (recId: string, reason: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recId
          ? {
              ...r,
              status: 'REJECTED',
              rejectionReason: reason || 'Anomalie biomécanique ou amplitude incomplète',
              certifiedBy: 'Rejeté par SuperAdmin',
            }
          : r
      )
    );
    showToast('Record rejeté avec notification transmise à l\'athlète.');
  };

  const handleInductAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAthlete = athletes.find((a) => a.id === selectedAthleteId);
    if (!targetAthlete) return;

    const existingTitles = targetAthlete.unlockedTitles || [];
    const updatedTitles = existingTitles.includes(selectedTitleId)
      ? existingTitles
      : [...existingTitles, selectedTitleId];

    const updatedUser: AthleteUser = {
      ...targetAthlete,
      activeTitle: selectedTitleId,
      activeHalo: selectedHaloId,
      unlockedTitles: updatedTitles,
      aetherBalance: (targetAthlete.aetherBalance || 0) + bonusAether,
    };

    if (onUpdateAthlete) {
      onUpdateAthlete(updatedUser);
    }

    if (onSendPushNotification) {
      onSendPushNotification(
        '👑 Nouvelle Légende au Panthéon Osirion !',
        `L'athlète @${targetAthlete.username} a été intronisé(e) avec le titre suprême de « ${selectedTitleId} » !`
      );
    }

    setShowInductModal(false);
    showToast(`L'athlète @${targetAthlete.username} a été intronisé(e) au Panthéon !`);
  };

  const handleCreateClan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClanName.trim()) return;

    const newClan: Clan = {
      id: `clan_${Date.now()}`,
      name: newClanName.trim(),
      description: newClanDescription || 'Faction fondée au Colisée d\'Osirion.',
      leaderPseudo: newClanLeader,
      membersCount: 1,
      totalXp: 5000,
      ranking: clansList.length + 1,
      territoriesHeld: newClanTerritory || 1,
      createdAt: new Date().toISOString().slice(0, 10),
      isRecruiting: true,
      factionMotto: newClanMotto,
    };

    setClansList([newClan, ...clansList]);
    setShowCreateClanModal(false);
    setNewClanName('');
    setNewClanDescription('');
    showToast(`La Faction « ${newClan.name} » a été forgée avec succès !`);
  };

  const handleDissolveClan = (clanId: string) => {
    setClansList(clansList.filter((c) => c.id !== clanId));
    if (inspectedClan?.id === clanId) setInspectedClan(null);
    showToast('Le clan a été dissous avec succès.');
  };

  const handleUpdateAthleteStatus = (athlete: AthleteUser, status: 'training' | 'online' | 'offline') => {
    const updated = { ...athlete, onlineStatus: status };
    if (onUpdateAthlete) onUpdateAthlete(updated);
    if (inspectedAthlete?.id === athlete.id) setInspectedAthlete(updated);
    showToast(`Statut de @${athlete.username} mis à jour : ${status.toUpperCase()}`);
  };

  // --- SYNCHRONISATION FIRESTORE ET CALCULS DOMINATION H3 ---
  useEffect(() => {
    const unsubBastions = onSnapshot(
      collection(db, 'bastions'),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => {
            const raw = d.data() as any;
            return {
              id: d.id || raw.id || `bastion_${Date.now()}`,
              name: raw.name || 'Bastion sans nom',
              city: raw.city || 'Paris',
              neighborhood: raw.neighborhood || 'Zone Urbaine',
              position: raw.position || { latitude: 48.8566, longitude: 2.3522 },
              type: raw.type || 'STREET_WORKOUT',
              equipment: Array.isArray(raw.equipment) ? raw.equipment : ['Barres de traction'],
              tacticalStatus: raw.tacticalStatus || 'VIERGE',
              failedAttemptsCount: typeof raw.failedAttemptsCount === 'number' ? raw.failedAttemptsCount : 0,
              sourcePriority: raw.sourcePriority || 'FIRESTORE_ECLAIREUR',
              images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'],
              currentBoss: raw.currentBoss,
              lastBeatenAt: raw.lastBeatenAt,
              bossAchievedAt: raw.bossAchievedAt,
              leaderboard: Array.isArray(raw.leaderboard) ? raw.leaderboard : [],
              osmNote: raw.osmNote,
            } as BastionTacticalSpot;
          });
          setBastions(list);
        }
      },
      (err) => console.warn('Firestore bastions onSnapshot error:', err)
    );

    const unsubTerritories = onSnapshot(
      collection(db, 'territories'),
      (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TerritoryHexModel));
          setTerritories(list);
        }
      },
      (err) => console.warn('Firestore territories onSnapshot error:', err)
    );

    return () => {
      unsubBastions();
      unsubTerritories();
    };
  }, []);

  // Déclin de 5% par tranche de 7 jours (Plafond 50%)
  const computeDecayInfo = (bastion: BastionTacticalSpot) => {
    const achievedDateStr = bastion.bossAchievedAt || bastion.lastBeatenAt || '2026-09-01';
    const achievedTime = new Date(achievedDateStr).getTime();
    const now = Date.now();
    const daysInactive = Math.max(0, Math.floor((now - achievedTime) / (1000 * 60 * 60 * 24)));
    const weeksInactive = Math.floor(daysInactive / 7);
    const decayPercent = Math.min(50, weeksInactive * 5);
    const bossReps = bastion.currentBoss?.reps || 25;
    const effectiveReps = Math.max(1, Math.round(bossReps * (1 - decayPercent / 100)));
    const isVulnerable = decayPercent >= 15 || bastion.tacticalStatus === 'CONFLIT';
    return { daysInactive, weeksInactive, decayPercent, effectiveReps, isVulnerable };
  };

  // Statistiques de Domination
  const clanDominanceStats = clansList.map((clan) => {
    const clanName = (clan.name || '').toLowerCase();
    const clanBastions = bastions.filter(
      (b) =>
        b.currentBoss?.clanName?.toLowerCase().includes(clanName) ||
        (clanName && clanName.includes(b.currentBoss?.clanName?.toLowerCase() || '___'))
    );
    const clanHexes = territories.filter(
      (t) =>
        t.ownerClanName?.toLowerCase().includes(clanName) ||
        (clanName && clanName.includes(t.ownerClanName?.toLowerCase() || '___'))
    );
    const dailyPassiveAether = clanBastions.length * 250;
    return {
      clan,
      bastionsCount: clanBastions.length,
      hexesCount: clanHexes.length,
      dailyPassiveAether,
    };
  }).sort((a, b) => b.bastionsCount - a.bastionsCount || b.hexesCount - a.hexesCount);

  const supremeDominantClan = clanDominanceStats[0]?.clan?.name || 'Ronin Calisthenics Paris';
  const conflitsCount = bastions.filter((b) => b.tacticalStatus === 'CONFLIT').length;
  const forteressesCount = bastions.filter((b) => b.tacticalStatus === 'FORTERESSE').length;
  const stablesCount = bastions.filter((b) => b.tacticalStatus === 'STABLE').length;

  // Handlers Domination
  const handleSyncDominationWithFirestore = async () => {
    setIsSyncingDomination(true);
    try {
      const batch = writeBatch(db);
      bastions.forEach((b) => {
        const ref = doc(db, 'bastions', b.id);
        batch.set(ref, b, { merge: true });
      });
      territories.forEach((t) => {
        const ref = doc(db, 'territories', t.id);
        batch.set(ref, t, { merge: true });
      });
      await batch.commit();
      showToast(`🔥 Synchronisation réussie : ${bastions.length} Bastions et ${territories.length} Territoires H3 sauvegardés sur Firestore !`);
    } catch (err: any) {
      console.error('Erreur synchronisation domination:', err);
      showToast(`Erreur lors de la synchronisation Firestore: ${err?.message || err}`);
    } finally {
      setIsSyncingDomination(false);
    }
  };

  const handleSaveNewBastion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBastionName.trim()) return;

    const equipments = newBastionEquipmentInput
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const nowIso = new Date().toISOString();
    const newSpotId = `bastion_${newBastionCity.toLowerCase().slice(0, 3)}_${Date.now()}`;

    const newSpot: BastionTacticalSpot = {
      id: newSpotId,
      name: newBastionName.trim(),
      city: newBastionCity,
      neighborhood: newBastionNeighborhood.trim() || 'Centre Urbain',
      position: { latitude: Number(newBastionLat), longitude: Number(newBastionLng) },
      type: newBastionType,
      equipment: equipments.length > 0 ? equipments : ['Barre de traction', 'Barres parallèles'],
      tacticalStatus: newBastionStatus,
      failedAttemptsCount: 0,
      bossAchievedAt: nowIso,
      lastBeatenAt: nowIso,
      sourcePriority: 'FIRESTORE_ECLAIREUR',
      images: [
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500',
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500',
      ],
      osmNote: `Homologué par le SuperAdmin le ${new Date().toLocaleDateString('fr-FR')}`,
      currentBoss: {
        userId: `boss_${Date.now()}`,
        pseudo: newBastionBossPseudo.trim() || 'Guerrier_Inconnu',
        clanName: newBastionClan,
        reps: Number(newBastionBossReps) || 25,
        exerciseType: newBastionBossExercise,
        achievedAt: nowIso.slice(0, 10),
        effectiveReps: Number(newBastionBossReps) || 25,
      },
      leaderboard: [
        {
          userId: `boss_${Date.now()}`,
          pseudo: newBastionBossPseudo.trim() || 'Guerrier_Inconnu',
          clanName: newBastionClan,
          reps: Number(newBastionBossReps) || 25,
          exerciseType: newBastionBossExercise,
          achievedAt: nowIso.slice(0, 10),
          effectiveReps: Number(newBastionBossReps) || 25,
        },
      ],
    };

    setBastions((prev) => [newSpot, ...prev]);

    try {
      await setDoc(doc(db, 'bastions', newSpotId), newSpot);
    } catch (err) {
      console.warn('Erreur setDoc bastion:', err);
    }

    if (onSendPushNotification) {
      onSendPushNotification(
        '🏰 Nouveau Bastion de Street Workout Homologué !',
        `Le Bastion « ${newSpot.name} » (${newSpot.city}) entre dans le Panthéon sous le règne de ${newBastionClan} !`
      );
    }

    setShowAddBastionModal(false);
    setNewBastionName('');
    setNewBastionNeighborhood('');
    showToast(`Bastion « ${newSpot.name} » homologué et actif !`);
  };

  const handleTransferSovereignty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringBastion) return;

    const nowIso = new Date().toISOString();

    const updatedBastion: BastionTacticalSpot = {
      ...transferringBastion,
      tacticalStatus: transferNewStatus,
      bossAchievedAt: nowIso,
      lastBeatenAt: nowIso,
      currentBoss: transferringBastion.currentBoss
        ? {
            ...transferringBastion.currentBoss,
            clanName: transferTargetClanName,
            achievedAt: nowIso.slice(0, 10),
            effectiveReps: transferringBastion.currentBoss.reps, // Reset decay
          }
        : undefined,
    };

    setBastions((prev) => prev.map((b) => (b.id === transferringBastion.id ? updatedBastion : b)));

    try {
      await setDoc(doc(db, 'bastions', transferringBastion.id), updatedBastion, { merge: true });
    } catch (err) {
      console.warn('Erreur Firestore transfert:', err);
    }

    if (transferSendPush && onSendPushNotification) {
      onSendPushNotification(
        '🚩 Souveraineté Territoriale Transférée !',
        `Le Bastion « ${transferringBastion.name} » (${transferringBastion.city}) passe sous le contrôle officiel de « ${transferTargetClanName} » !`
      );
    }

    setTransferringBastion(null);
    showToast(`Souveraineté transmise à ${transferTargetClanName} (Decay réinitialisé) !`);
  };

  const handleTriggerSiege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siegingBastion) return;

    const updatedBastion: BastionTacticalSpot = {
      ...siegingBastion,
      tacticalStatus: 'CONFLIT',
    };

    setBastions((prev) => prev.map((b) => (b.id === siegingBastion.id ? updatedBastion : b)));

    try {
      await setDoc(doc(db, 'bastions', siegingBastion.id), updatedBastion, { merge: true });
    } catch (err) {
      console.warn('Erreur Firestore siège:', err);
    }

    const notifMsg =
      siegePushCustomText.trim() ||
      `La faction « ${siegeAttackingClanName} » a déclaré le siège sur le Bastion « ${siegingBastion.name} » (${siegingBastion.city}) ! Défenseurs demandés d'urgence !`;

    if (onSendPushNotification) {
      onSendPushNotification('⚔️ ALERTE SIÈGE : CONFLIT DÉCLARÉ !', notifMsg);
    }

    setSiegingBastion(null);
    setSiegePushCustomText('');
    showToast(`⚔️ État de siège déclaré sur « ${siegingBastion.name} » !`);
  };

  const handleRepairBastionFortress = async (bastion: BastionTacticalSpot) => {
    const nowIso = new Date().toISOString();
    const updatedBastion: BastionTacticalSpot = {
      ...bastion,
      tacticalStatus: 'FORTERESSE',
      bossAchievedAt: nowIso,
      currentBoss: bastion.currentBoss
        ? {
            ...bastion.currentBoss,
            achievedAt: nowIso.slice(0, 10),
            effectiveReps: bastion.currentBoss.reps, // Decay 0%
          }
        : undefined,
    };

    setBastions((prev) => prev.map((b) => (b.id === bastion.id ? updatedBastion : b)));

    try {
      await setDoc(doc(db, 'bastions', bastion.id), updatedBastion, { merge: true });
    } catch (err) {
      console.warn('Erreur Firestore repair:', err);
    }

    showToast(`🛡️ Bastion « ${bastion.name} » consolidé en FORTERESSE ! Decay réinitialisé à 0%.`);
  };

  const handleDeleteBastion = async (bastionId: string, bastionName: string) => {
    if (!confirm(`Supprimer définitivement le Bastion « ${bastionName} » du Panthéon et de Firestore ?`)) return;

    setBastions((prev) => prev.filter((b) => b.id !== bastionId));

    try {
      await deleteDoc(doc(db, 'bastions', bastionId));
    } catch (err) {
      console.warn('Erreur Firestore delete bastion:', err);
    }

    showToast(`Bastion « ${bastionName} » supprimé.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. GRAND BANDEAU PANTHÉON OSIRION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80 rounded-3xl border border-slate-800 shadow-xl p-6 sm:p-8 text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>MODULE OFFICIEL DU PANTHÉON • VALERION / OSIRION ALPHA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Le Panthéon & Les 4 Classements</span>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-xl bg-slate-800/80 text-amber-300 border border-slate-700">
                Saison Active : Royal Arc
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Console miroir de l’écran mobile <code className="text-amber-300 font-mono text-[11px]">PantheonScreen</code>. Supervisez les 4 catégories de classements, la chambre d'homologation des records, les factions territoriales et l'Alpha Connect.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Athlètes Classés</span>
              <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">{athletes.length}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Factions (Clans)</span>
              <span className="text-xl font-black text-indigo-400 font-mono mt-0.5 block">{clansList.length}</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Records ML Kit</span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                {records.filter((r) => r.status === 'HOMOLOGATED').length}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Cagnotte Aether</span>
              <span className="text-xl font-black text-yellow-300 font-mono mt-0.5 block">15 000</span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        {userRole === 'superadmin' && (
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowInductModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/30 transition transform active:scale-95"
              >
                <Crown className="w-4 h-4" />
                <span>Introniser une Légende</span>
              </button>
              <button
                onClick={() => setShowCreateClanModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Fonder une Faction</span>
              </button>
              <button
                onClick={() => setShowAddRecordModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Homologuer un Record</span>
              </button>
            </div>

            <button
              onClick={() => setShowCloseSeasonModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/50 text-amber-200 text-xs font-semibold transition"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Clôturer Saison Royal Arc</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. NAVIGATION D'ONGLETS PRINCIPAUX DU PANTHÉON */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveMainTab('rankings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeMainTab === 'rankings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Les 4 Classements & Immortels</span>
        </button>

        <button
          onClick={() => setActiveMainTab('clans_management')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeMainTab === 'clans_management'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Gestion des Factions ({clansList.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('connect')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeMainTab === 'connect'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-4 h-4 text-sky-400" />
          <span>Alpha Connect & Transmissions</span>
        </button>

        <button
          onClick={() => setActiveMainTab('domination')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeMainTab === 'domination'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Hexagon className="w-4 h-4 text-emerald-400" />
          <span>Domination H3 ({bastions.length})</span>
          {conflitsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse">
              {conflitsCount} Siège{conflitsCount > 1 ? 's' : ''}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('records')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeMainTab === 'records'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-400" />
          <span>Chambre d'Homologation IA ({records.length})</span>
          {records.some((r) => r.status === 'PENDING_REVIEW') && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('titles_halos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeMainTab === 'titles_halos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Arsenal des Titres ({titles.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('seasons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeMainTab === 'seasons'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Arcs Historiques</span>
        </button>
      </div>

      {/* 3. ONGLET 1 : LES 4 TYPES DE CLASSEMENTS (CŒUR DE LA DEMANDE) */}
      {activeMainTab === 'rankings' && (
        <div className="space-y-6">
          {/* BARRE DE CONTRÔLE : SÉLECTEUR DES 4 TYPES & PORTEE GÉOGRAPHIQUE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Les 4 Piliers de Classement Officiels (comme dans pantheon_screen.dart) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setCurrentSortBy('xp')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  currentSortBy === 'xp'
                    ? 'bg-amber-400 text-amber-950 shadow-sm ring-2 ring-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>1. Alpha Suprême (Harmonie)</span>
              </button>

              <button
                onClick={() => setCurrentSortBy('forceXp')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  currentSortBy === 'forceXp'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>2. Maîtres du Dojo (Force)</span>
              </button>

              <button
                onClick={() => setCurrentSortBy('wisdomXp')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  currentSortBy === 'wisdomXp'
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>3. Sages de l'Arène (Sagesse)</span>
              </button>

              <button
                onClick={() => setCurrentSortBy('clans')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  currentSortBy === 'clans'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>4. Factions (Top Clans)</span>
              </button>
            </div>

            {/* Filtre de Portée Géographique (Mondial, France, Villes) */}
            <div className="flex items-center gap-2 shrink-0">
              <Globe className="w-4 h-4 text-slate-400" />
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="GLOBAL">Portée : Mondial</option>
                <option value="FRANCE">Portée : France (National)</option>
                <option value="PARIS">Zone : Paris & Île-de-France</option>
                <option value="LYON">Zone : Lyon (Gerland)</option>
                <option value="MARSEILLE">Zone : Marseille (Prado)</option>
              </select>
            </div>
          </div>

          {/* CAS A : CLASSEMENT FACTIONS (TOP CLANS) */}
          {currentSortBy === 'clans' ? (
            <div className="space-y-4">
              {/* Barre de recherche de Faction */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher une faction... (Ex : Les Spartiates du Prado, Ronin...)"
                    value={clanSearchQuery}
                    onChange={(e) => setClanSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono font-semibold">
                  {sortedClans.length} Factions répertoriées
                </span>
              </div>

              {/* Podium des Clans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* #2 Clan Argent */}
                {clanPodium2 && (
                  <div
                    onClick={() => setInspectedClan(clanPodium2)}
                    className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 cursor-pointer hover:shadow-md transition order-2 md:order-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center">
                        #2
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        {clanPodium2.totalXp.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                        <Shield className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{clanPodium2.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">Chef : @{clanPodium2.leaderPseudo}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center text-xs text-slate-600">
                      <strong>{clanPodium2.membersCount}</strong> athlètes • <strong>{clanPodium2.territoriesHeld}</strong> bastions
                    </div>
                  </div>
                )}

                {/* #1 Clan Or */}
                {clanPodium1 && (
                  <div
                    onClick={() => setInspectedClan(clanPodium1)}
                    className="bg-gradient-to-b from-amber-500/10 via-white to-amber-500/5 rounded-3xl border-2 border-amber-400 p-6 space-y-3 cursor-pointer hover:shadow-lg transition order-1 md:order-2 md:-translate-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <span className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center shadow-xs">
                          #1
                        </span>
                      </div>
                      <span className="text-sm font-mono font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                        {clanPodium1.totalXp.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="text-center space-y-1.5">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md ring-4 ring-amber-100">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">{clanPodium1.name}</h4>
                      <p className="text-xs text-blue-600 font-mono font-semibold">Chef : @{clanPodium1.leaderPseudo}</p>
                      {clanPodium1.factionMotto && (
                        <p className="italic text-[11px] text-slate-600 bg-amber-50 p-1.5 rounded-xl border border-amber-200/50">
                          {clanPodium1.factionMotto}
                        </p>
                      )}
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-center text-xs font-semibold text-slate-800">
                      <strong>{clanPodium1.membersCount} athlètes</strong> mobilisés • <strong>{clanPodium1.territoriesHeld} bastions conquis</strong>
                    </div>
                  </div>
                )}

                {/* #3 Clan Bronze */}
                {clanPodium3 && (
                  <div
                    onClick={() => setInspectedClan(clanPodium3)}
                    className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 cursor-pointer hover:shadow-md transition order-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                        #3
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        {clanPodium3.totalXp.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                        <Shield className="w-7 h-7" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{clanPodium3.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">Chef : @{clanPodium3.leaderPseudo}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center text-xs text-slate-600">
                      <strong>{clanPodium3.membersCount}</strong> athlètes • <strong>{clanPodium3.territoriesHeld}</strong> bastions
                    </div>
                  </div>
                )}
              </div>

              {/* Liste Complète des Factions */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Classement Complet des Factions</span>
                </h4>

                <div className="divide-y divide-slate-100">
                  {sortedClans.map((clan, idx) => (
                    <div
                      key={clan.id}
                      onClick={() => setInspectedClan(clan)}
                      className="py-3 px-3 hover:bg-slate-50 rounded-2xl transition flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-slate-500 w-8">
                          #{idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                          <Shield className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition">
                            {clan.name}
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            Chef : <strong className="text-slate-700 font-mono">@{clan.leaderPseudo}</strong> • {clan.membersCount} membres
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <strong className="text-xs font-mono font-bold text-emerald-600 block">
                            {clan.totalXp.toLocaleString()} XP
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            {clan.territoriesHeld} bastions contrôlés
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* CAS B : CLASSEMENTS INDIVIDUELS (XP, FORCE, WISDOM) */
            <div className="space-y-6">
              {/* Podium Dynamique pour les 3 types individuels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* #2 Argent */}
                {podiumTop2 && (
                  <div
                    onClick={() => setInspectedAthlete(podiumTop2)}
                    className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 cursor-pointer hover:shadow-md transition order-2 md:order-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center">
                        #2
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600">
                        {currentSortBy === 'xp'
                          ? `${podiumTop2.xp.toLocaleString()} XP`
                          : currentSortBy === 'forceXp'
                          ? `${podiumTop2.forceXp?.toLocaleString() || 0} Force XP`
                          : `${podiumTop2.wisdomXp?.toLocaleString() || 0} Sagesse XP`}
                      </span>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
                        {podiumTop2.username.slice(0, 2).toUpperCase()}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{podiumTop2.fullName}</h4>
                      <p className="text-xs text-blue-600 font-mono">@{podiumTop2.username}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center text-xs text-slate-600">
                      {currentSortBy === 'forceXp' ? (
                        <span>{podiumTop2.personalRecords.pushups} Pompes • {podiumTop2.personalRecords.pullups} Tractions</span>
                      ) : currentSortBy === 'wisdomXp' ? (
                        <span>Série : <strong>{podiumTop2.streakDays} jours</strong> • {podiumTop2.guardianPath}</span>
                      ) : (
                        <span>Dual Balance : <strong>{podiumTop2.movementPrecision}% Précision IA</strong></span>
                      )}
                    </div>
                  </div>
                )}

                {/* #1 Or */}
                {podiumTop1 && (
                  <div
                    onClick={() => setInspectedAthlete(podiumTop1)}
                    className="bg-gradient-to-b from-amber-500/10 via-white to-amber-500/5 rounded-3xl border-2 border-amber-400 p-6 space-y-3 cursor-pointer hover:shadow-lg transition order-1 md:order-2 md:-translate-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <span className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center shadow-xs">
                          #1
                        </span>
                      </div>
                      <span className="text-sm font-mono font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">
                        {currentSortBy === 'xp'
                          ? `${podiumTop1.xp.toLocaleString()} XP`
                          : currentSortBy === 'forceXp'
                          ? `${podiumTop1.forceXp?.toLocaleString() || 0} Force XP`
                          : `${podiumTop1.wisdomXp?.toLocaleString() || 0} Sagesse XP`}
                      </span>
                    </div>
                    <div className="text-center space-y-1.5">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-md ring-4 ring-amber-200">
                        {podiumTop1.username.slice(0, 2).toUpperCase()}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base">{podiumTop1.fullName}</h4>
                      <p className="text-xs text-blue-600 font-mono font-semibold">@{podiumTop1.username}</p>
                      {podiumTop1.activeTitle && (
                        <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {podiumTop1.activeTitle}
                        </span>
                      )}
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-center text-xs font-semibold text-slate-800">
                      {currentSortBy === 'forceXp' ? (
                        <span>{podiumTop1.personalRecords.muscleups} Muscle-ups • {podiumTop1.personalRecords.pushups} Pompes</span>
                      ) : currentSortBy === 'wisdomXp' ? (
                        <span>Streak {podiumTop1.streakDays}j • Serment gravé</span>
                      ) : (
                        <span>Harmonie Totale • {podiumTop1.movementPrecision}% Précision</span>
                      )}
                    </div>
                  </div>
                )}

                {/* #3 Bronze */}
                {podiumTop3 && (
                  <div
                    onClick={() => setInspectedAthlete(podiumTop3)}
                    className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 cursor-pointer hover:shadow-md transition order-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                        #3
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600">
                        {currentSortBy === 'xp'
                          ? `${podiumTop3.xp.toLocaleString()} XP`
                          : currentSortBy === 'forceXp'
                          ? `${podiumTop3.forceXp?.toLocaleString() || 0} Force XP`
                          : `${podiumTop3.wisdomXp?.toLocaleString() || 0} Sagesse XP`}
                      </span>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
                        {podiumTop3.username.slice(0, 2).toUpperCase()}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{podiumTop3.fullName}</h4>
                      <p className="text-xs text-blue-600 font-mono">@{podiumTop3.username}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center text-xs text-slate-600">
                      {currentSortBy === 'forceXp' ? (
                        <span>{podiumTop3.personalRecords.pushups} Pompes • {podiumTop3.personalRecords.pullups} Tractions</span>
                      ) : currentSortBy === 'wisdomXp' ? (
                        <span>Série : <strong>{podiumTop3.streakDays} jours</strong></span>
                      ) : (
                        <span>Précision : <strong>{podiumTop3.movementPrecision}%</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Tableau Interactif des Immortels */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>
                        {currentSortBy === 'xp'
                          ? 'Classement Alpha Suprême (Harmonie Globale)'
                          : currentSortBy === 'forceXp'
                          ? 'Classement Maîtres du Dojo (Force Pure & PRs)'
                          : 'Classement Sages de l\'Arène (Sagesse & Constance)'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cliquez sur une ligne pour ouvrir le profil public complet (PublicProfileDialog)
                    </p>
                  </div>

                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filtrer les athlètes..."
                      value={athleteSearchQuery}
                      onChange={(e) => setAthleteSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3">Rang</th>
                        <th className="py-3 px-3">Athlète</th>
                        <th className="py-3 px-3">Titre & Halo</th>
                        {currentSortBy === 'xp' && <th className="py-3 px-3">Dual Balance (Force/Sagesse)</th>}
                        {currentSortBy === 'forceXp' && <th className="py-3 px-3">Records Validés Dojo IA</th>}
                        {currentSortBy === 'wisdomXp' && <th className="py-3 px-3">Série & Voie du Gardien</th>}
                        <th className="py-3 px-3">Score Homologué</th>
                        <th className="py-3 px-3 text-right">Profil & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedAthletes
                        .filter(
                          (a) => {
                            const q = (athleteSearchQuery || '').toLowerCase();
                            return (
                              (a.fullName || '').toLowerCase().includes(q) ||
                              (a.username || '').toLowerCase().includes(q)
                            );
                          }
                        )
                        .map((athlete, idx) => {
                          const totalDual = (athlete.forceXp || 0) + (athlete.wisdomXp || 0) || 1;
                          const forceRatio = Math.round(((athlete.forceXp || 0) / totalDual) * 100);
                          const wisdomRatio = 100 - forceRatio;

                          return (
                            <tr
                              key={athlete.id}
                              onClick={() => setInspectedAthlete(athlete)}
                              className="hover:bg-slate-50/80 transition cursor-pointer group"
                            >
                              <td className="py-3.5 px-3 font-mono font-bold text-slate-500">
                                {idx === 0 ? (
                                  <span className="w-6 h-6 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-black">
                                    1
                                  </span>
                                ) : idx === 1 ? (
                                  <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center text-xs font-black">
                                    2
                                  </span>
                                ) : idx === 2 ? (
                                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black">
                                    3
                                  </span>
                                ) : (
                                  `#${idx + 1}`
                                )}
                              </td>

                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="relative">
                                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                                      {athlete.username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span
                                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${
                                        athlete.onlineStatus === 'training'
                                          ? 'bg-amber-500'
                                          : athlete.onlineStatus === 'online'
                                          ? 'bg-emerald-500'
                                          : 'bg-slate-300'
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <strong className="text-slate-900 font-semibold block">{athlete.fullName}</strong>
                                    <span className="text-blue-600 font-mono text-[11px]">@{athlete.username}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                                  <Crown className="w-3 h-3 text-amber-500" />
                                  {athlete.activeTitle || 'Initié Alpha'}
                                </span>
                              </td>

                              {currentSortBy === 'xp' && (
                                <td className="py-3.5 px-3">
                                  <div className="space-y-1 w-36">
                                    <div className="flex justify-between font-mono text-[10px]">
                                      <span className="text-sky-600 font-semibold">{forceRatio}% F</span>
                                      <span className="text-amber-600 font-semibold">{wisdomRatio}% S</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full flex overflow-hidden">
                                      <div className="bg-sky-500 h-full" style={{ width: `${forceRatio}%` }} />
                                      <div className="bg-amber-500 h-full" style={{ width: `${wisdomRatio}%` }} />
                                    </div>
                                  </div>
                                </td>
                              )}

                              {currentSortBy === 'forceXp' && (
                                <td className="py-3.5 px-3 font-mono text-[11px] text-slate-700">
                                  {athlete.personalRecords.pushups} Pompes • {athlete.personalRecords.pullups} Tractions • {athlete.personalRecords.muscleups} MU
                                </td>
                              )}

                              {currentSortBy === 'wisdomXp' && (
                                <td className="py-3.5 px-3 text-[11px]">
                                  <strong className="text-amber-600 font-mono block">Streak : {athlete.streakDays} jours</strong>
                                  <span className="text-slate-400">{athlete.guardianPath}</span>
                                </td>
                              )}

                              <td className="py-3.5 px-3 font-mono">
                                <strong className="text-slate-900 text-sm block">
                                  {currentSortBy === 'xp'
                                    ? `${athlete.xp.toLocaleString()} XP`
                                    : currentSortBy === 'forceXp'
                                    ? `${(athlete.forceXp || 0).toLocaleString()} XP`
                                    : `${(athlete.wisdomXp || 0).toLocaleString()} XP`}
                                </strong>
                                <span className="text-slate-400 text-[10px]">{athlete.totalReps.toLocaleString()} reps</span>
                              </td>

                              <td className="py-3.5 px-3 text-right">
                                <span className="text-slate-400 group-hover:text-blue-600 text-xs font-semibold inline-flex items-center gap-1 transition">
                                  <span>Détails</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ONGLET 2 : GESTION DES FACTIONS (CLANS) */}
      {activeMainTab === 'clans_management' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Gestion des Factions d'Athlètes & Recrutement</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Création, dissolution et modération des guildes territoriales de Street Workout
                </p>
              </div>

              <button
                onClick={() => setShowCreateClanModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Fonder une Faction</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clansList.map((clan) => (
                <div
                  key={clan.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3.5 shadow-2xs hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg">
                        #{clan.ranking}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{clan.name}</span>
                          {clan.ranking === 1 && <Crown className="w-4 h-4 text-amber-500" />}
                        </h4>
                        <p className="text-xs text-slate-400">Fondé le {clan.createdAt}</p>
                      </div>
                    </div>

                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {clan.membersCount} athlètes
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {clan.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Chef</span>
                      <strong className="text-slate-800 font-mono truncate block mt-0.5">@{clan.leaderPseudo}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">XP Guilde</span>
                      <strong className="text-blue-600 font-mono block mt-0.5">{clan.totalXp.toLocaleString()}</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Bastions H3</span>
                      <strong className="text-emerald-700 font-mono block mt-0.5">{clan.territoriesHeld}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => setInspectedClan(clan)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                    >
                      Détails de Faction
                    </button>
                    {userRole === 'superadmin' && (
                      <button
                        onClick={() => handleDissolveClan(clan.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition"
                      >
                        Dissoudre
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. ONGLET 3 : ALPHA CONNECT (MESSAGERIE & STATUTS) */}
      {activeMainTab === 'connect' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-600" />
                <span>Alpha Connect • Transmissions & Statuts d'Effort</span>
              </h3>
              <p className="text-xs text-slate-500">
                Canaux de communication chiffrés, statuts en temps réel et cercle de confiance des athlètes
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-2xl">
                <span className="text-xs text-emerald-800 font-bold block mb-1">DISPONIBLE</span>
                <p className="text-[11px] text-emerald-700">Athlètes prêts pour un entraînement ou un duel asynchrone.</p>
              </div>
              <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl">
                <span className="text-xs text-amber-800 font-bold block mb-1">EN PLEIN EFFORT</span>
                <p className="text-[11px] text-amber-700">Actuellement en session au Dojo IA ou sur un spot de street workout.</p>
              </div>
              <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl">
                <span className="text-xs text-blue-800 font-bold block mb-1">EN REPOS</span>
                <p className="text-[11px] text-blue-700">Période de récupération musculaire et lecture du Codex.</p>
              </div>
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl">
                <span className="text-xs text-slate-700 font-bold block mb-1">NE PAS DÉRANGER</span>
                <p className="text-[11px] text-slate-600">Notifications muettes et concentration maximale.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-indigo-600" />
                <span>Module Alpha Cam & Messages Vocaux (Gal / Record)</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Les athlètes peuvent transmettre des vidéoclips de 15 secondes max encodés en H.264 et des notes vocales enregistrées sous le protocole audio d'Osirion pour s'entraider sur les corrections posturales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. ONGLET 4 : DOMINATION TERRITORIALE (BASTIONS H3 & SOUVERAINETÉ) */}
      {activeMainTab === 'domination' && (
        <div className="space-y-6 animate-in fade-in">
          {/* BANDEAU EN-TÊTE DOMINATION */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/80 rounded-3xl border border-slate-800 shadow-xl p-6 sm:p-7 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide">
                  <Hexagon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GRILLE SPATIALE UBER H3 • SOUVERAINETÉ DES BASTIONS & FACTIONS</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                  <span>Domination Territoriale des Factions</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                    5% Decay / 7 jours
                  </span>
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Cartographie spatiale des bastions de Street Workout en France. Arbitrez les conquêtes de territoires, visualisez le déclin d'inactivité du Boss et déclenchez des états de siège avec pushs synchronisés.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setShowAddBastionModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Homologuer un Bastion</span>
                </button>

                <button
                  onClick={handleSyncDominationWithFirestore}
                  disabled={isSyncingDomination}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-xs border border-slate-700 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingDomination ? 'animate-spin' : ''}`} />
                  <span>{isSyncingDomination ? 'Synchronisation...' : 'Synchroniser Firestore'}</span>
                </button>
              </div>
            </div>

            {/* 5 KPIs DOMINATION */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80">
              <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 block font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Bastions Homologués</span>
                </span>
                <strong className="text-xl font-black font-mono text-white mt-1 block">
                  {bastions.length} <span className="text-xs text-slate-400 font-normal">spots</span>
                </strong>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 block font-semibold flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Faction Empereur</span>
                </span>
                <strong className="text-sm font-bold text-amber-300 mt-1 block truncate">
                  {supremeDominantClan}
                </strong>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 block font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sièges / Conflits</span>
                </span>
                <strong className={`text-xl font-black font-mono mt-1 block ${conflitsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                  {conflitsCount} <span className="text-xs font-normal">actifs</span>
                </strong>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 block font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Forteresses Inviolées</span>
                </span>
                <strong className="text-xl font-black font-mono text-emerald-400 mt-1 block">
                  {forteressesCount} <span className="text-xs font-normal">bastions</span>
                </strong>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl backdrop-blur-xs col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 block font-semibold flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Aether Passif / Jour</span>
                </span>
                <strong className="text-xl font-black font-mono text-yellow-300 mt-1 block">
                  {clanDominanceStats.reduce((sum, c) => sum + c.dailyPassiveAether, 0).toLocaleString()} ₳
                </strong>
              </div>
            </div>
          </div>

          {/* SOUS-NAVIGATION DES 3 VUES DOMINATION */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setDominationView('bastions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  dominationView === 'bastions'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Bastions & Lieux Sacrés ({bastions.length})</span>
              </button>

              <button
                onClick={() => setDominationView('map_h3')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  dominationView === 'map_h3'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Radar & Carte Hexagonale H3 ({territories.length})</span>
              </button>

              <button
                onClick={() => setDominationView('clans_leaderboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  dominationView === 'clans_leaderboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Classement Factions & Conquête</span>
              </button>
            </div>

            {/* BARRE DE RECHERCHE ET FILTRES RAPIDES */}
            {dominationView !== 'clans_leaderboard' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrer spot, boss, clan..."
                    value={dominationSearch}
                    onChange={(e) => setDominationSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
                  />
                </div>

                <select
                  value={dominationCityFilter}
                  onChange={(e) => setDominationCityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden"
                >
                  <option value="ALL">Toutes les métropoles</option>
                  <option value="Paris">Paris</option>
                  <option value="Lyon">Lyon</option>
                  <option value="Marseille">Marseille</option>
                  <option value="Bordeaux">Bordeaux</option>
                  <option value="Lille">Lille</option>
                  <option value="Toulouse">Toulouse</option>
                </select>

                <select
                  value={dominationStatusFilter}
                  onChange={(e) => setDominationStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-hidden"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="FORTERESSE">Forteresses Inviolées</option>
                  <option value="CONFLIT">En Siège / Conflit</option>
                  <option value="STABLE">Stables</option>
                  <option value="VIERGE">Vierges</option>
                </select>
              </div>
            )}
          </div>

          {/* VUE 1 : GRILLE DES BASTIONS & DÉCLIN DE DÉFENSE (DECAY 5%) */}
          {dominationView === 'bastions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bastions
                  .filter((b) => {
                    const matchCity = dominationCityFilter === 'ALL' || (b.city || '').toLowerCase() === dominationCityFilter.toLowerCase();
                    const matchStatus = dominationStatusFilter === 'ALL' || b.tacticalStatus === dominationStatusFilter;
                    const q = dominationSearch.toLowerCase();
                    const matchQuery =
                      !q ||
                      (b.name || '').toLowerCase().includes(q) ||
                      (b.city || '').toLowerCase().includes(q) ||
                      (b.neighborhood || '').toLowerCase().includes(q) ||
                      (b.currentBoss?.pseudo || '').toLowerCase().includes(q) ||
                      (b.currentBoss?.clanName || '').toLowerCase().includes(q);
                    return matchCity && matchStatus && matchQuery;
                  })
                  .map((bastion) => {
                    const decay = computeDecayInfo(bastion);
                    const isConflit = bastion.tacticalStatus === 'CONFLIT';
                    const isForteresse = bastion.tacticalStatus === 'FORTERESSE';
                    const isStable = bastion.tacticalStatus === 'STABLE';

                    return (
                      <div
                        key={bastion.id}
                        className={`bg-white rounded-3xl border transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between ${
                          isConflit
                            ? 'border-rose-400 ring-2 ring-rose-400/30'
                            : isForteresse
                            ? 'border-emerald-300/80'
                            : 'border-slate-200/80'
                        }`}
                      >
                        <div>
                          {/* BANNIÈRE IMAGE DU SPOT */}
                          <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                            <img
                              src={
                                bastion.images?.[0] ||
                                'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600'
                              }
                              alt={bastion.name}
                              className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                            {/* BADGES HAUT DE BANNIÈRE */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white font-mono text-[11px] font-bold border border-slate-700/60 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                <span>{bastion.city || 'Paris'}</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-black/60 text-slate-300 text-[10px] font-medium backdrop-blur-xs">
                                {bastion.neighborhood || 'Zone Urbaine'}
                              </span>
                            </div>

                            <div className="absolute top-3 right-3">
                              {isConflit && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-600/95 text-white font-black text-[10px] uppercase tracking-wider animate-pulse shadow-lg">
                                  <Swords className="w-3 h-3" />
                                  <span>SIÈGE ACTIF</span>
                                </span>
                              )}
                              {isForteresse && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600/90 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-xs shadow-md">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>FORTERESSE</span>
                                </span>
                              )}
                              {isStable && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-600/90 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                                  <Shield className="w-3 h-3" />
                                  <span>STABLE</span>
                                </span>
                              )}
                              {bastion.tacticalStatus === 'VIERGE' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-700 text-slate-200 font-bold text-[10px] uppercase">
                                  <span>VIERGE</span>
                                </span>
                              )}
                            </div>

                            {/* TITRE DU BASTION DANS LE BAS DE L'IMAGE */}
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <h4 className="font-black text-base drop-shadow-sm leading-snug truncate">
                                {bastion.name}
                              </h4>
                              <span className="text-[11px] text-slate-300 font-medium">
                                Type : {(bastion.type || 'STREET_WORKOUT').replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* CONTENU PRINCIPAL DE LA CARTE */}
                          <div className="p-4 space-y-3.5">
                            {/* TAGS D'ÉQUIPEMENTS */}
                            <div className="flex flex-wrap gap-1">
                              {(bastion.equipment || []).slice(0, 3).map((eq, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200/60"
                                >
                                  {eq}
                                </span>
                              ))}
                              {(bastion.equipment?.length || 0) > 3 && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-lg font-medium">
                                  +{(bastion.equipment?.length || 0) - 3}
                                </span>
                              )}
                            </div>

                            {/* BLOC BOSS ET FACTION SOUVERAINE */}
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xs shadow-xs">
                                    {bastion.currentBoss?.pseudo?.[0]?.toUpperCase() || 'B'}
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-medium block">Boss Souverain</span>
                                    <strong className="text-xs font-bold text-slate-900 block leading-tight">
                                      @{bastion.currentBoss?.pseudo || 'Non réclamé'}
                                    </strong>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 block font-medium">Record de Défense</span>
                                  <span className="text-sm font-black font-mono text-emerald-700 block">
                                    {bastion.currentBoss?.reps || 0} reps
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-indigo-500" />
                                  <span className="font-semibold text-slate-800">
                                    {bastion.currentBoss?.clanName || 'Faction Indépendante'}
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {bastion.currentBoss?.exerciseType || 'PULL_UPS'}
                                </span>
                              </div>
                            </div>

                            {/* BLOC DÉCLIN DU RECORD (DECAY 5% / 7 JOURS) */}
                            <div className="bg-slate-900 text-white p-3 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                                  <History className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Déclin de 5% / 7 jours</span>
                                </span>
                                <span className={`font-mono font-bold text-xs ${decay.decayPercent > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  -{decay.decayPercent}% ({decay.effectiveReps} reps eff.)
                                </span>
                              </div>

                              {/* Jauge visuelle */}
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    decay.decayPercent >= 15
                                      ? 'bg-rose-500'
                                      : decay.decayPercent > 0
                                      ? 'bg-amber-400'
                                      : 'bg-emerald-400'
                                  }`}
                                  style={{ width: `${Math.max(5, 100 - decay.decayPercent * 2)}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>Inactivité : {decay.daysInactive}j ({decay.weeksInactive} sem.)</span>
                                {decay.isVulnerable ? (
                                  <span className="text-rose-400 font-bold flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Vulnérable au Siège</span>
                                  </span>
                                ) : (
                                  <span className="text-emerald-400 font-semibold">Défense Optimale</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BARRE D'ACTIONS DU BASTION */}
                        <div className="p-4 pt-0 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                              onClick={() => handleRepairBastionFortress(bastion)}
                              title="Réinitialise le decay et passe le spot en FORTERESSE"
                              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold transition flex items-center justify-center gap-1.5 border border-emerald-200/80"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Fortifier</span>
                            </button>

                            <button
                              onClick={() => {
                                setTransferringBastion(bastion);
                                setTransferTargetClanName(clansList[0]?.name || 'Ronin Calisthenics Paris');
                              }}
                              className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold transition flex items-center justify-center gap-1.5 border border-indigo-200/80"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Transférer</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSiegingBastion(bastion);
                                setSiegeAttackingClanName(clansList[1]?.name || 'Sparta Street Workout Lyon');
                              }}
                              className="flex-1 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-rose-200"
                            >
                              <Swords className="w-3.5 h-3.5 text-rose-600" />
                              <span>Déclarer Siège</span>
                            </button>

                            <button
                              onClick={() => setDetailBastion(bastion)}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1"
                              title="Consulter le Leaderboard complet"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Fiche</span>
                            </button>

                            {userRole === 'superadmin' && (
                              <button
                                onClick={() => handleDeleteBastion(bastion.id, bastion.name)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                title="Supprimer le Bastion"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* VUE 2 : RADAR & CARTE HEXAGONALE H3 */}
          {dominationView === 'map_h3' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Hexagon className="w-4 h-4 text-emerald-600" />
                    <span>Radar Tactique Uber H3 (Résolution 8)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Découpage spatial géodésique des métropoles françaises en hexagones de 0.73 km²
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Métropole active :</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
                    {['Paris', 'Lyon', 'Marseille'].map((city) => (
                      <button
                        key={city}
                        onClick={() => setDominationCityFilter(city)}
                        className={`px-3 py-1 rounded-lg transition ${
                          dominationCityFilter === city
                            ? 'bg-white text-emerald-700 shadow-xs'
                            : 'hover:text-slate-900'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRILLE TACTIQUE HEXAGONALE INTERACTIVE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CANVAS / SVG INTERACTIF DE LA GRILLE */}
                <div className="lg:col-span-2 bg-slate-950 rounded-2xl p-6 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[380px]">
                  {/* Grille de fond radar */}
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

                  {/* Hexagons Honeycomb SVG */}
                  <div className="relative z-10 w-full max-w-lg aspect-square flex items-center justify-center">
                    <svg viewBox="0 0 500 450" className="w-full h-full filter drop-shadow-xl">
                      {/* Hexagones interconnectés */}
                      {territories.map((hex, idx) => {
                        // Positionnement schématique géodésique
                        const positions = [
                          { cx: 250, cy: 150 },
                          { cx: 160, cy: 200 },
                          { cx: 340, cy: 200 },
                          { cx: 250, cy: 250 },
                          { cx: 160, cy: 300 },
                          { cx: 340, cy: 300 },
                        ];
                        const pos = positions[idx % positions.length];
                        const isSelected = selectedHexId === hex.id;
                        const isDisputed = hex.status === 'DISPUTE';
                        const fillHex = isDisputed
                          ? '#f43f5e'
                          : hex.ownerClanName?.includes('Ronin')
                          ? '#6366f1'
                          : hex.ownerClanName?.includes('Spart')
                          ? '#f59e0b'
                          : '#10b981';

                        return (
                          <g
                            key={hex.id}
                            onClick={() => setSelectedHexId(hex.id)}
                            className="cursor-pointer transition-transform hover:scale-105"
                          >
                            <polygon
                              points={`${pos.cx},${pos.cy - 48} ${pos.cx + 42},${pos.cy - 24} ${pos.cx + 42},${pos.cy + 24} ${pos.cx},${pos.cy + 48} ${pos.cx - 42},${pos.cy + 24} ${pos.cx - 42},${pos.cy - 24}`}
                              fill={fillHex}
                              fillOpacity={isSelected ? 0.9 : 0.4}
                              stroke={isSelected ? '#ffffff' : fillHex}
                              strokeWidth={isSelected ? 3 : 1.5}
                              strokeDasharray={isDisputed ? '4 2' : 'none'}
                              className="transition-all duration-300"
                            />
                            {/* Pin / Icône au centre de l'hexagone */}
                            <circle cx={pos.cx} cy={pos.cy} r={6} fill="#ffffff" />
                            <text
                              x={pos.cx}
                              y={pos.cy + 18}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {hex.zoneName.slice(0, 10)}
                            </text>
                            <text
                              x={pos.cx}
                              y={pos.cy + 28}
                              textAnchor="middle"
                              fill="#94a3b8"
                              fontSize="8"
                              fontFamily="monospace"
                            >
                              {hex.influencePoints} pts
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Légende radar */}
                  <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span>Ronin Paris</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>Sparta Lyon</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Marseille</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <span>Zone en Siège</span>
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono">H3 Index: 881fb4...</span>
                  </div>
                </div>

                {/* PANNEAU D'INSPECTION DE LA CELLULE SÉLECTIONNÉE */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
                  {(() => {
                    const activeHex = territories.find((t) => t.id === selectedHexId) || territories[0];
                    if (!activeHex) return <p className="text-xs text-slate-400">Aucune zone sélectionnée</p>;

                    const associatedBastions = bastions.filter(
                      (b) => b.city.toLowerCase() === activeHex.city.toLowerCase()
                    );

                    return (
                      <div className="space-y-4">
                        <div className="border-b border-slate-200 pb-3">
                          <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">
                            Cellule Tactique H3 #{activeHex.h3Index.slice(-8)}
                          </span>
                          <h4 className="text-lg font-black text-slate-900 mt-0.5">{activeHex.zoneName}</h4>
                          <span className="text-xs text-slate-500">{activeHex.city} • Coordonnées : {activeHex.center.latitude.toFixed(4)}, {activeHex.center.longitude.toFixed(4)}</span>
                        </div>

                        {/* Faction Souveraine */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Faction Régnante</span>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">{activeHex.ownerClanName || 'Zone Neutre'}</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {activeHex.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                            <img
                              src={activeHex.ownerLeaderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt="Leader"
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-slate-600">
                              Chef de zone : <strong>@{activeHex.ownerLeaderPseudo || 'Inconnu'}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Métriques de contrôle */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">Contenders Actifs</span>
                            <strong className="text-sm font-black text-slate-900 mt-0.5 block">
                              {activeHex.contendersCount} athlètes
                            </strong>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 block font-medium">Points d'Influence</span>
                            <strong className="text-sm font-black text-emerald-600 font-mono mt-0.5 block">
                              {activeHex.influencePoints} pts
                            </strong>
                          </div>
                        </div>

                        {/* Déclin de défense du territoire */}
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5 text-amber-600" />
                            <span>Compte à rebours du Déclin :</span>
                          </span>
                          <p className="text-[11px] text-amber-800">
                            Il reste <strong className="font-mono">{activeHex.defenseDecayHoursLeft} heures</strong> avant que cette cellule ne perde son bouclier territorial si aucune session de course ou de workout n'est enregistrée.
                          </p>
                        </div>

                        {/* Bastions dans cette zone */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-700 block">
                            Bastions dans ce secteur ({associatedBastions.length}) :
                          </span>
                          {associatedBastions.map((b) => (
                            <div
                              key={b.id}
                              onClick={() => {
                                setDominationView('bastions');
                                setDominationSearch(b.name);
                              }}
                              className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-emerald-400 cursor-pointer transition"
                            >
                              <span className="font-semibold text-slate-900 truncate">{b.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* VUE 3 : CLASSEMENT NATIONAL DES FACTIONS & CONQUÊTE */}
          {dominationView === 'clans_leaderboard' && (
            <div className="space-y-6">
              {/* PODIUM DES 3 CLANS MAÎTRES DE FRANCE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clanDominanceStats.slice(0, 3).map((item, idx) => {
                  const medals = ['👑 EMPEREUR NATIONAL', '🥈 DEUXIÈME FACTION', '🥉 TROISIÈME FACTION'];
                  const borders = ['border-amber-400 bg-amber-50/30', 'border-slate-300 bg-slate-50', 'border-amber-700/30 bg-orange-50/20'];

                  return (
                    <div
                      key={item.clan.id}
                      className={`rounded-3xl border p-5 space-y-3 relative overflow-hidden ${borders[idx] || 'border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                          {medals[idx]}
                        </span>
                        <span className="text-xl font-black font-mono text-slate-900">#{idx + 1}</span>
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-slate-900">{item.clan.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Suzerain : <strong>@{item.clan.leaderPseudo}</strong> • {item.clan.membersCount} athlètes
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-medium">Bastions Tenus</span>
                          <strong className="text-base font-black text-emerald-700 font-mono mt-0.5 block">
                            {item.bastionsCount}
                          </strong>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-medium">Revenu Passif</span>
                          <strong className="text-base font-black text-yellow-600 font-mono mt-0.5 block">
                            {item.dailyPassiveAether} ₳/j
                          </strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 italic bg-white/80 p-2 rounded-xl">
                        {item.clan.factionMotto || '« Force et Rigueur sous la Barre »'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TABLEAU COMPARATIF COMPLET DES FACTIONS */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Registre Impérial de Souveraineté Territoriale</h4>
                    <p className="text-xs text-slate-500">Détail des bastions détenus et génération d'Aether par jour</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Formule : 250 ₳ / Bastion / Jour</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-4">Rang</th>
                        <th className="p-4">Faction / Clan</th>
                        <th className="p-4">Suzerain</th>
                        <th className="p-4 text-center">Bastions Contrôlés</th>
                        <th className="p-4 text-center">Hexagones H3</th>
                        <th className="p-4 text-right">Aether Passif / Jour</th>
                        <th className="p-4 text-center">Statut de Conquête</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clanDominanceStats.map((item, idx) => (
                        <tr key={item.clan.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 font-mono font-bold text-slate-900">#{idx + 1}</td>
                          <td className="p-4">
                            <strong className="text-slate-900 block">{item.clan.name}</strong>
                            <span className="text-[11px] text-slate-400">{item.clan.description}</span>
                          </td>
                          <td className="p-4 font-mono font-medium text-slate-700">@{item.clan.leaderPseudo}</td>
                          <td className="p-4 text-center font-mono font-black text-emerald-700 text-sm">
                            {item.bastionsCount}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-slate-700">
                            {item.hexesCount}
                          </td>
                          <td className="p-4 text-right font-mono font-black text-yellow-600 text-sm">
                            +{item.dailyPassiveAether} ₳
                          </td>
                          <td className="p-4 text-center">
                            {item.bastionsCount >= 4 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                                HÉGÉMONIE
                              </span>
                            ) : item.bastionsCount > 0 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] bg-sky-100 text-sky-800 font-bold">
                                IMPLANTE
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] bg-slate-100 text-slate-500 font-medium">
                                SANS TERRE
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. ONGLET 5 : HOMOLOGATION DES RECORDS IA (GOOGLE ML KIT) */}
      {activeMainTab === 'records' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Arbitrage des Records Mondiaux & IA Anti-Triche</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Validation des mouvements par PoseMathService (ML Kit Pose Detection)
                </p>
              </div>

              <select
                value={recordStatusFilter}
                onChange={(e) => setRecordStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="HOMOLOGATED">Homologués au Panthéon</option>
                <option value="PENDING_REVIEW">En attente d'arbitrage</option>
                <option value="REJECTED">Rejetés (Anomalie)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {records
                .filter((r) => recordStatusFilter === 'ALL' || r.status === recordStatusFilter)
                .map((record) => (
                  <div
                    key={record.id}
                    className={`rounded-2xl border p-5 space-y-3 transition ${
                      record.status === 'HOMOLOGATED'
                        ? 'bg-emerald-50/20 border-emerald-200'
                        : record.status === 'REJECTED'
                        ? 'bg-rose-50/20 border-rose-200'
                        : 'bg-amber-50/20 border-amber-200 ring-2 ring-amber-300/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{record.exerciseName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Athlète : <strong>{record.athleteFullName}</strong> (@{record.athleteUsername})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black font-mono text-slate-900">{record.recordValue}</span>
                        <span className="text-xs text-slate-500 block">{record.unit}</span>
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Précision ML Kit :</span>
                        <strong className={record.aiPrecisionScore >= 95 ? 'text-emerald-600' : 'text-rose-600'}>
                          {record.aiPrecisionScore}%
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Déviation du tronc :</span>
                        <span className="text-slate-800">{record.aiTrunkDeviationDeg}°</span>
                      </div>
                      {record.rejectionReason && (
                        <p className="text-rose-700 bg-rose-50 p-2 rounded-lg mt-1 font-sans">
                          <strong>Motif :</strong> {record.rejectionReason}
                        </p>
                      )}
                    </div>

                    {userRole === 'superadmin' && record.status === 'PENDING_REVIEW' && (
                      <div className="flex justify-end gap-2 pt-1 border-t border-slate-200">
                        <button
                          onClick={() => handleRejectRecord(record.id, 'Amplitude coudes incomplète')}
                          className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-semibold"
                        >
                          Rejeter
                        </button>
                        <button
                          onClick={() => handleApproveRecord(record.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                        >
                          Homologuer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. ONGLET 6 : ARSENAL DES TITRES & HALOS */}
      {activeMainTab === 'titles_halos' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Titres Honorifiques & Halos Divins du Panthéon</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Débloqués automatiquement par l'IA ou décernés par les SuperAdmins
                </p>
              </div>

              <button
                onClick={() => setShowNewTitleModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Titre</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {titles.map((t) => (
                <div key={t.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">{t.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 font-bold uppercase text-purple-700">
                      {t.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{t.description}</p>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 text-[11px] text-slate-700 font-medium">
                    <span className="text-slate-400 block text-[10px] uppercase">Condition</span>
                    {t.unlockCondition}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. ONGLET 7 : ARCS HISTORIQUES */}
      {activeMainTab === 'seasons' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {seasons.map((season) => (
              <div
                key={season.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">{season.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {season.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{season.theme}</p>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Champion Individuel</span>
                    <strong className="text-slate-900">{season.championAthlete.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Faction Vainqueur</span>
                    <strong className="text-indigo-700">{season.championClan.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cagnotte</span>
                    <strong className="text-amber-600 font-mono">{season.prizePoolAether} Aether</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL : PUBLIC PROFILE DIALOG (Comme dans le code Flutter) */}
      {inspectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900">Profil Public du Panthéon</h3>
              </div>
              <button onClick={() => setInspectedAthlete(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md ring-4 ring-amber-200">
                {inspectedAthlete.username.slice(0, 2).toUpperCase()}
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">{inspectedAthlete.fullName}</h4>
              <p className="text-xs text-blue-600 font-mono font-semibold">@{inspectedAthlete.username}</p>
              {inspectedAthlete.activeTitle && (
                <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-0.5 rounded-full border border-amber-200">
                  👑 {inspectedAthlete.activeTitle}
                </span>
              )}
            </div>

            {/* Statuts Alpha Modifiables */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-semibold text-slate-600 block">Statut d'Activité en Direct :</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleUpdateAthleteStatus(inspectedAthlete, 'training')}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition ${
                    inspectedAthlete.onlineStatus === 'training'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  EN EFFORT
                </button>
                <button
                  onClick={() => handleUpdateAthleteStatus(inspectedAthlete, 'online')}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition ${
                    inspectedAthlete.onlineStatus === 'online'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  DISPONIBLE
                </button>
                <button
                  onClick={() => handleUpdateAthleteStatus(inspectedAthlete, 'offline')}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition ${
                    inspectedAthlete.onlineStatus === 'offline'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  EN REPOS
                </button>
              </div>
            </div>

            {/* Records physiques */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono font-bold bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Pompes</span>
                <span className="text-slate-800">{inspectedAthlete.personalRecords.pushups}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Tractions</span>
                <span className="text-slate-800">{inspectedAthlete.personalRecords.pullups}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-sans block">Muscle-ups</span>
                <span className="text-amber-700">{inspectedAthlete.personalRecords.muscleups}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectedAthlete(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : CLAN DETAILS DIALOG (Comme dans le code Flutter) */}
      {inspectedClan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Détails de la Faction</h3>
              </div>
              <button onClick={() => setInspectedClan(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-black text-indigo-700 text-2xl shadow-sm">
                #{inspectedClan.ranking}
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">{inspectedClan.name}</h4>
              <p className="text-xs text-slate-500 font-mono">Chef de Faction : @{inspectedClan.leaderPseudo}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 block">Manifeste du Clan :</span>
              <p className="text-xs text-slate-700 leading-relaxed">{inspectedClan.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">Effectif</span>
                <strong className="text-slate-900 font-mono text-base">{inspectedClan.membersCount} athlètes</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">XP de Guilde</span>
                <strong className="text-blue-600 font-mono text-base">{inspectedClan.totalXp.toLocaleString()} XP</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectedClan(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : FONDER UN CLAN (CRÉATION DE FACTION) */}
      {showCreateClanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Forger une Nouvelle Faction</h3>
              </div>
              <button onClick={() => setShowCreateClanModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClan} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom de la Faction :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Fraternité d'Acier Paris"
                  value={newClanName}
                  onChange={(e) => setNewClanName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chef de Clan :</label>
                <select
                  value={newClanLeader}
                  onChange={(e) => setNewClanLeader(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.username}>
                      {a.fullName} (@{a.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Devise du Clan :</label>
                <input
                  type="text"
                  value={newClanMotto}
                  onChange={(e) => setNewClanMotto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Manifeste / Description :</label>
                <textarea
                  rows={2}
                  value={newClanDescription}
                  onChange={(e) => setNewClanDescription(e.target.value)}
                  placeholder="Objectif de la faction, entraînements conjoints..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateClanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Créer la Faction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL : INTRONISER UNE LÉGENDE */}
      {showInductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900">Intronisation au Panthéon</h3>
              </div>
              <button onClick={() => setShowInductModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInductAthlete} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sélectionner l'Athlète :</label>
                <select
                  value={selectedAthleteId}
                  onChange={(e) => setSelectedAthleteId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} (@{a.username}) • {a.xp} XP
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Titre Divin :</label>
                  <select
                    value={selectedTitleId}
                    onChange={(e) => setSelectedTitleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    {titles.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Halo Cosmétique :</label>
                  <select
                    value={selectedHaloId}
                    onChange={(e) => setSelectedHaloId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    {halos.map((h) => (
                      <option key={h.id} value={h.name}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Prime d'Aether Sacré :</label>
                <input
                  type="number"
                  value={bonusAether}
                  onChange={(e) => setBonusAether(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  Introniser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1 : HOMOLOGUER UN NOUVEAU BASTION */}
      {showAddBastionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Homologuer un Nouveau Bastion</h3>
              </div>
              <button onClick={() => setShowAddBastionModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewBastion} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom du Bastion :</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Bastion des Arènes de Lutèce"
                  value={newBastionName}
                  onChange={(e) => setNewBastionName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Métropole :</label>
                  <select
                    value={newBastionCity}
                    onChange={(e) => setNewBastionCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="Paris">Paris</option>
                    <option value="Lyon">Lyon</option>
                    <option value="Marseille">Marseille</option>
                    <option value="Bordeaux">Bordeaux</option>
                    <option value="Lille">Lille</option>
                    <option value="Toulouse">Toulouse</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quartier / Secteur :</label>
                  <input
                    type="text"
                    placeholder="ex: Quartier Latin"
                    value={newBastionNeighborhood}
                    onChange={(e) => setNewBastionNeighborhood(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Latitude GPS :</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBastionLat}
                    onChange={(e) => setNewBastionLat(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Longitude GPS :</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newBastionLng}
                    onChange={(e) => setNewBastionLng(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Configuration du Spot :</label>
                  <select
                    value={newBastionType}
                    onChange={(e) => setNewBastionType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="PARC_COMPLET">Parc Complet</option>
                    <option value="BARRES_TRACTION">Barres de Traction</option>
                    <option value="STATION_FREESTYLE">Station Freestyle</option>
                    <option value="MODULES_STREET">Modules Street</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Statut Tactique :</label>
                  <select
                    value={newBastionStatus}
                    onChange={(e) => setNewBastionStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="FORTERESSE">FORTERESSE (Imprenable)</option>
                    <option value="STABLE">STABLE</option>
                    <option value="CONFLIT">CONFLIT (En Siège)</option>
                    <option value="VIERGE">VIERGE (Inexploré)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Équipements répertoriés (virgules) :</label>
                <input
                  type="text"
                  value={newBastionEquipmentInput}
                  onChange={(e) => setNewBastionEquipmentInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Défense Initiale (Boss du Spot)</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Faction Régnante :</label>
                    <select
                      value={newBastionClan}
                      onChange={(e) => setNewBastionClan(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900"
                    >
                      {clansList.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Pseudo du Boss :</label>
                    <input
                      type="text"
                      value={newBastionBossPseudo}
                      onChange={(e) => setNewBastionBossPseudo(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Exercice imposé :</label>
                    <select
                      value={newBastionBossExercise}
                      onChange={(e) => setNewBastionBossExercise(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2"
                    >
                      <option value="Tractions strictes">Tractions strictes</option>
                      <option value="Dips aux barres parallèles">Dips barres parallèles</option>
                      <option value="Muscle-ups stricts">Muscle-ups stricts</option>
                      <option value="Pompes diamant">Pompes diamant</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Record de Répétitions :</label>
                    <input
                      type="number"
                      value={newBastionBossReps}
                      onChange={(e) => setNewBastionBossReps(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBastionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Homologuer le Bastion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : TRANSFÉRER LA SOUVERAINETÉ D'UN BASTION */}
      {transferringBastion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Transférer la Souveraineté</h3>
              </div>
              <button onClick={() => setTransferringBastion(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Bastion Cible</span>
              <h4 className="font-bold text-sm text-slate-900">{transferringBastion.name}</h4>
              <p className="text-slate-600">
                Ville : {transferringBastion.city} • Actuel Souverain : <strong>{transferringBastion.currentBoss?.clanName || 'Indépendant'}</strong>
              </p>
            </div>

            <form onSubmit={handleTransferSovereignty} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nouvelle Faction Souveraine :</label>
                <select
                  value={transferTargetClanName}
                  onChange={(e) => setTransferTargetClanName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  {clansList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} (Chef: @{c.leaderPseudo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Statut Tactique après transfert :</label>
                <select
                  value={transferNewStatus}
                  onChange={(e) => setTransferNewStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  <option value="FORTERESSE">FORTERESSE (Défense Maximale)</option>
                  <option value="STABLE">STABLE</option>
                  <option value="CONFLIT">CONFLIT (Siège en cours)</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-indigo-900 space-y-1">
                <span className="font-bold block text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Réinitialisation du Decay :</span>
                </span>
                <p className="text-[11px] text-indigo-800">
                  Le transfert réinitialise immédiatement le déclin de 5%/semaine à <strong>0%</strong>, octroyant un mandat complet à la nouvelle faction.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={transferSendPush}
                  onChange={(e) => setTransferSendPush(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Diffuser une alerte push prioritaire aux athlètes</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransferringBastion(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Confirmer le Transfert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : DÉCLARATION D'UN ÉTAT DE SIÈGE */}
      {siegingBastion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">Déclarer un Siège de Faction</h3>
              </div>
              <button onClick={() => setSiegingBastion(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-rose-900 space-y-1">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Bastion sous Menace : {siegingBastion.name}</span>
              </span>
              <p className="text-[11px] text-rose-800">
                Faction Défenseuse : <strong>{siegingBastion.currentBoss?.clanName || 'Faction Actuelle'}</strong> (Boss : @{siegingBastion.currentBoss?.pseudo})
              </p>
            </div>

            <form onSubmit={handleTriggerSiege} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Faction Assaillante :</label>
                <select
                  value={siegeAttackingClanName}
                  onChange={(e) => setSiegeAttackingClanName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  {clansList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Message d'Alerte Push Personnalisé :</label>
                <textarea
                  rows={3}
                  placeholder="Laissez vide pour le message automatique d'appel aux armes..."
                  value={siegePushCustomText}
                  onChange={(e) => setSiegePushCustomText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSiegingBastion(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Lancer le Siège & Notifier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4 : FICHE DÉTAILLÉE & LEADERBOARD DU BASTION */}
      {detailBastion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">{detailBastion.name}</h3>
                  <span className="text-slate-500 text-[11px]">{detailBastion.city} • {detailBastion.neighborhood}</span>
                </div>
              </div>
              <button onClick={() => setDetailBastion(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo grand format */}
            <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={detailBastion.images?.[0] || 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=700'}
                alt={detailBastion.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-xl bg-slate-950/80 text-white font-mono font-bold backdrop-blur-md">
                  {detailBastion.tacticalStatus}
                </span>
              </div>
            </div>

            {/* Équipements & Détails */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Type d'infrastructure</span>
                <strong className="text-slate-800 font-mono text-xs block">{(detailBastion.type || 'STREET_WORKOUT').replace('_', ' ')}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">Coordonnées GPS</span>
                <strong className="text-slate-800 font-mono text-xs block">
                  {detailBastion.position?.latitude != null ? detailBastion.position.latitude.toFixed(4) : '48.8566'}, {detailBastion.position?.longitude != null ? detailBastion.position.longitude.toFixed(4) : '2.3522'}
                </strong>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700 block">Équipements répertoriés :</span>
              <div className="flex flex-wrap gap-1.5">
                {(detailBastion.equipment || []).map((eq, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                    {eq}
                  </span>
                ))}
              </div>
            </div>

            {/* Leaderboard des Défenseurs & Challengers */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Registre du Panthéon du Spot</h4>
                <span className="text-slate-400 text-[11px]">{detailBastion.leaderboard?.length || 0} performances certifiées</span>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Rang</th>
                      <th className="p-3">Athlète</th>
                      <th className="p-3">Faction</th>
                      <th className="p-3 text-center">Exercice</th>
                      <th className="p-3 text-right">Reps Brutes</th>
                      <th className="p-3 text-right">Reps Effectives</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {(detailBastion.leaderboard || []).map((entry, idx) => (
                      <tr key={idx} className={idx === 0 ? 'bg-amber-50/40 font-bold' : ''}>
                        <td className="p-3 font-mono">
                          {idx === 0 ? '👑 Boss' : `#${idx + 1}`}
                        </td>
                        <td className="p-3 font-mono text-slate-900">@{entry.pseudo}</td>
                        <td className="p-3 text-slate-700">{entry.clanName || 'Indépendant'}</td>
                        <td className="p-3 text-center font-mono text-slate-600">{entry.exerciseType}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{entry.reps}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">{entry.effectiveReps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setDetailBastion(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
