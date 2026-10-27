import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Zap,
  TrendingUp,
  Dumbbell,
  Brain,
  HeartPulse,
  Activity,
  CloudUpload,
  RefreshCw,
  Award,
  ShieldCheck,
  ChevronRight,
  Flame,
  Clock,
  Layers,
  BarChart3,
  Users,
  Check,
  MousePointerClick,
  UserCheck
} from 'lucide-react';
import { OFFICIAL_200_QUESTS_BANK, QuestAdminItem } from '../data/questsData';
import { AthleteUser } from '../types/admin';
import { db } from '../lib/firebase';
import {
  doc,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';

export interface QuestTrackingStat {
  clicks?: number;
  completions?: number;
  completedUsers?: string[];
  lastCompletedAt?: string;
}

export interface DailyPulseTrackingDoc {
  date: string;
  totalCompletions?: number;
  participants?: string[];
  completedAthletes?: string[];
  questStats?: Record<string, QuestTrackingStat>;
  updatedAt?: any;
}

interface DailyPulseQuestsManagerProps {
  athletes?: AthleteUser[];
  userRole?: 'superadmin' | 'auditor';
}

export function DailyPulseQuestsManager({
  athletes = [],
  userRole = 'superadmin',
}: DailyPulseQuestsManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'catalog' | 'analytics' | 'cloud'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'physical' | 'mental' | 'lifestyle'>('all');
  const [selectedArc, setSelectedArc] = useState<'all' | 'winter' | 'summer' | 'royal'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | '1' | '2' | '3'>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [cloudQuests, setCloudQuests] = useState<QuestAdminItem[] | null>(null);

  // Date active sélectionnée pour le suivi (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  // Télémétrie en direct lue depuis Firestore: daily_pulse_tracking/{selectedDate}
  const [trackingData, setTrackingData] = useState<DailyPulseTrackingDoc | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // 1. Détection Réelle et Dynamique de l'Arc Saisonnier selon le calendrier
  const currentArcInfo = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    if (month === 9 || month === 10) {
      // Royal Arc : Septembre & Octobre
      const winterStart = new Date(currentYear, 10, 1); // 1er Novembre
      const diffDays = Math.max(1, Math.ceil((winterStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        id: 'royal',
        name: 'ROYAL ARC',
        period: '01 Sep – 31 Oct',
        theme: 'Puissance, Conquête & Arène',
        colorBadge: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        countdownNotice: `${diffDays} jour${diffDays > 1 ? 's' : ''} restant${diffDays > 1 ? 's' : ''} avant le Winter Arc (01 Nov)`,
        nextArc: 'Winter Arc (La Forge dans l’Ombre)',
      };
    } else if (month >= 4 && month <= 8) {
      // Summer Body Arc : Avril à Août
      return {
        id: 'summer',
        name: 'SUMMER BODY ARC',
        period: '01 Avr – 31 Aoû',
        theme: 'Explosivité, Volume & Rayonnement Solaire',
        colorBadge: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        countdownNotice: 'Arc estival actif pour tous les athlètes',
        nextArc: 'Royal Arc (01 Sep)',
      };
    } else {
      // Winter Arc : Novembre à Mars
      return {
        id: 'winter',
        name: 'WINTER ARC',
        period: '01 Nov – 31 Mar',
        theme: 'La Forge dans l’Ombre & Discipline Stoïque',
        colorBadge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        countdownNotice: 'Discipline de fer sous le froid',
        nextArc: 'Summer Body Arc (01 Avr)',
      };
    }
  }, []);

  // 2. Synchronisation Réelle avec global_config/daily_pulse (5 quêtes officielles du jour)
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'global_config', 'daily_pulse'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.questIds && Array.isArray(data.questIds) && data.questIds.length === 5) {
            const loaded = data.questIds
              .map((id: string) => {
                const cleanId = id.toLowerCase().trim();
                return OFFICIAL_200_QUESTS_BANK.find((q) => {
                  const cand = q.id.toLowerCase().trim();
                  return (
                    cand === cleanId ||
                    cand === `q_${cleanId}` ||
                    cand.replace(/^q_/, '') === cleanId.replace(/^q_/, '')
                  );
                });
              })
              .filter(Boolean) as QuestAdminItem[];
            if (loaded.length === 5) {
              setCloudQuests(loaded);
            }
          }
        }
      },
      () => {}
    );
    return () => unsub();
  }, []);

// Helper to normalize Firestore telemetry data whether written as nested maps or flat dotted keys
function normalizeTrackingDoc(raw: any): DailyPulseTrackingDoc | null {
  if (!raw) return null;
  const normalized: DailyPulseTrackingDoc = {
    date: raw.date || '',
    totalCompletions: typeof raw.totalCompletions === 'number' ? raw.totalCompletions : 0,
    participants: Array.isArray(raw.participants) ? [...raw.participants] : [],
    completedAthletes: Array.isArray(raw.completedAthletes) ? [...raw.completedAthletes] : [],
    questStats: {},
  };

  // 1. Copy over any nested questStats
  if (raw.questStats && typeof raw.questStats === 'object') {
    for (const [qid, stat] of Object.entries(raw.questStats)) {
      if (stat && typeof stat === 'object') {
        normalized.questStats![qid] = { ...(stat as QuestTrackingStat) };
      }
    }
  }

  // 2. Extract and merge any flat dotted keys (e.g. "questStats.q_phys_001.clicks")
  for (const [k, v] of Object.entries(raw)) {
    if (k.startsWith('questStats.')) {
      const parts = k.split('.');
      if (parts.length >= 3) {
        const qid = parts[1];
        const prop = parts.slice(2).join('.');
        if (!normalized.questStats![qid]) {
          normalized.questStats![qid] = {};
        }
        (normalized.questStats![qid] as any)[prop] = v;
      }
    }
  }

  return normalized;
}

function getQuestStat(
  stats: Record<string, QuestTrackingStat> | undefined,
  questId: string
): QuestTrackingStat | undefined {
  if (!stats) return undefined;
  if (stats[questId]) return stats[questId];
  const cleanId = questId.toLowerCase().trim();
  for (const [k, v] of Object.entries(stats)) {
    const ck = k.toLowerCase().trim();
    if (
      ck === cleanId ||
      ck === `q_${cleanId}` ||
      ck.replace(/^q_/, '') === cleanId.replace(/^q_/, '')
    ) {
      return v;
    }
  }
  return undefined;
}

  // 3. Écoute Temps Réel de la Télémétrie Firestore (daily_pulse_tracking/{selectedDate})
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'daily_pulse_tracking', selectedDate),
      (snap) => {
        setIsLiveConnected(true);
        if (snap.exists()) {
          setTrackingData(normalizeTrackingDoc(snap.data()));
        } else {
          setTrackingData(null);
        }
      },
      (err) => {
        console.error('Erreur écoute daily_pulse_tracking :', err);
        setIsLiveConnected(false);
      }
    );
    return () => unsub();
  }, [selectedDate]);

  // Données de télémétrie réelles
  const realParticipantsUids = trackingData?.participants ?? [];
  const realParticipantsCount = realParticipantsUids.length;

  const realCompletedAthletesUids = trackingData?.completedAthletes ?? [];
  const realCompletedAthletesCount = realCompletedAthletesUids.length;

  const realTotalCompletions = trackingData?.totalCompletions ?? 0;

  // 4. Tirage Déterministe Réel du Jour avec télémétrie attachée
  const todayQuests = useMemo(() => {
    let baseQuests: QuestAdminItem[] = [];

    if (cloudQuests && cloudQuests.length === 5) {
      baseQuests = cloudQuests;
    } else {
      let seed = 0;
      for (let i = 0; i < selectedDate.length; i++) {
        seed = (seed * 31 + selectedDate.charCodeAt(i)) & 0xffffffff;
      }
      const pseudoRand = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
      };

      const currentArcId = currentArcInfo.id;
      const pool = OFFICIAL_200_QUESTS_BANK;

      const physPool = pool.filter((q) => q.category === 'physical' && (q.targetArc === 'all' || q.targetArc === currentArcId));
      const mentPool = pool.filter((q) => q.category === 'mental' && (q.targetArc === 'all' || q.targetArc === currentArcId));
      const lifePool = pool.filter((q) => q.category === 'lifestyle' && (q.targetArc === 'all' || q.targetArc === currentArcId));

      const p = physPool[Math.floor(pseudoRand(10) * physPool.length)] || physPool[0];
      const m = mentPool[Math.floor(pseudoRand(20) * mentPool.length)] || mentPool[0];
      const l = lifePool[Math.floor(pseudoRand(30) * lifePool.length)] || lifePool[0];

      const remaining = pool.filter((q) => q.id !== p.id && q.id !== m.id && q.id !== l.id);
      const extra1 = remaining[Math.floor(pseudoRand(40) * remaining.length)] || remaining[0];
      const remaining2 = remaining.filter((q) => q.id !== extra1.id);
      const extra2 = remaining2[Math.floor(pseudoRand(50) * remaining2.length)] || remaining2[0];

      baseQuests = [p, m, l, extra1, extra2];
    }

    return baseQuests.map((quest) => {
      const qStat = getQuestStat(trackingData?.questStats, quest.id);
      const realClicks = qStat?.clicks ?? 0;
      const completionsCount = qStat?.completions ?? (qStat?.completedUsers?.length ?? 0);
      const completedUids = qStat?.completedUsers ?? [];

      const completedAthletesDetails = completedUids.map((uid) => {
        const found = athletes.find((a) => a.id === uid);
        return {
          id: uid,
          username: found?.username || found?.fullName || `Athlète #${uid.slice(0, 4)}`,
          avatarUrl: found?.avatarUrl,
          level: found?.level || 1,
        };
      });

      // Taux calculé sur les participants réels de la journée
      const completionRate = realParticipantsCount > 0
        ? Math.min(100, Math.round((completionsCount / realParticipantsCount) * 100))
        : 0;

      const avgTimeMin = quest.difficulty === 1 ? 5 : quest.difficulty === 2 ? 12 : 20;

      return {
        ...quest,
        clicks: realClicks,
        completions: completionsCount,
        totalCompletions: completionsCount,
        completionRate,
        completedAthletesDetails,
        avgTimeMin,
      };
    });
  }, [cloudQuests, currentArcInfo, selectedDate, trackingData, athletes, realParticipantsCount]);

  const realTotalClicks = useMemo(() => {
    return todayQuests.reduce((acc, q) => acc + q.clicks, 0);
  }, [todayQuests]);

  const realCommunityRate = useMemo(() => {
    if (realParticipantsCount === 0) return 0;
    return Math.round((realTotalCompletions / (realParticipantsCount * 5)) * 1000) / 10;
  }, [realParticipantsCount, realTotalCompletions]);

  // Détail par athlète ayant ouvert ou validé le daily pulse aujourd'hui
  const participantAthletes = useMemo(() => {
    const uidsSet = new Set<string>();
    (trackingData?.participants || []).forEach((u) => uidsSet.add(u));
    (trackingData?.completedAthletes || []).forEach((u) => uidsSet.add(u));

    if (trackingData?.questStats) {
      Object.values(trackingData.questStats).forEach((stat) => {
        (stat.completedUsers || []).forEach((u) => uidsSet.add(u));
      });
    }

    const allUids = Array.from(uidsSet);

    return allUids.map((uid) => {
      const found = athletes.find((a) => a.id === uid);
      const completedQuestList = todayQuests.filter((q) => {
        const stat = getQuestStat(trackingData?.questStats, q.id);
        return stat?.completedUsers?.includes(uid);
      });
      return {
        id: uid,
        username: found?.username || found?.fullName || `Athlète #${uid.slice(0, 5)}`,
        avatarUrl: found?.avatarUrl,
        level: found?.level || 1,
        fitnessLevel: found?.fitnessLevel || 'Initié',
        completedQuests: completedQuestList,
        totalXpToday: completedQuestList.reduce((acc, q) => acc + q.xpReward, 0),
      };
    });
  }, [trackingData, athletes, todayQuests]);

  // Quête championne du jour basée sur les vraies complétions
  const championQuest = useMemo(() => {
    return [...todayQuests].sort((a, b) => b.completions - a.completions)[0] || todayQuests[0];
  }, [todayQuests]);

  // Total XP réellement distribuée aujourd'hui
  const todayXpDistributed = useMemo(() => {
    const totalXp = todayQuests.reduce((acc, q) => acc + (q.completions * q.xpReward), 0);
    return totalXp.toLocaleString('fr-FR');
  }, [todayQuests]);

  // Nombre de quêtes vérifiées avec succès par l'IA aujourd'hui
  const realAiVerifiedCount = useMemo(() => {
    return todayQuests
      .filter((q) => q.isVerifiable)
      .reduce((acc, q) => acc + q.completions, 0);
  }, [todayQuests]);

  // Statistiques Globales du Catalogue des 200
  const stats = useMemo(() => {
    const physicalCount = OFFICIAL_200_QUESTS_BANK.filter((q) => q.category === 'physical').length;
    const mentalCount = OFFICIAL_200_QUESTS_BANK.filter((q) => q.category === 'mental').length;
    const lifestyleCount = OFFICIAL_200_QUESTS_BANK.filter((q) => q.category === 'lifestyle').length;
    const winterCount = OFFICIAL_200_QUESTS_BANK.filter((q) => q.targetArc === 'winter').length;
    const royalCount = OFFICIAL_200_QUESTS_BANK.filter((q) => q.targetArc === 'royal').length;
    const aiVerifiableCount = OFFICIAL_200_QUESTS_BANK.filter((q) => q.isVerifiable).length;

    return {
      total: OFFICIAL_200_QUESTS_BANK.length,
      physicalCount,
      mentalCount,
      lifestyleCount,
      winterCount,
      royalCount,
      aiVerifiableCount,
    };
  }, []);

  // Déploiement Cloud sur Firestore
  const handleSyncToFirestore = async () => {
    try {
      setIsSyncing(true);
      setSyncFeedback(null);

      const batch = writeBatch(db);

      // 1. Déploiement des 200 quêtes dans /quests/{id}
      for (const quest of OFFICIAL_200_QUESTS_BANK) {
        const ref = doc(db, 'quests', quest.id);
        batch.set(
          ref,
          {
            ...quest,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      // 2. Publication du tirage officiel dans /global_config/daily_pulse
      const pulseRef = doc(db, 'global_config', 'daily_pulse');
      batch.set(
        pulseRef,
        {
          date: selectedDate,
          arcId: currentArcInfo.id,
          arcName: currentArcInfo.name,
          questIds: todayQuests.map((q) => q.id),
          publishedAt: new Date().toISOString(),
          totalBankSize: OFFICIAL_200_QUESTS_BANK.length,
        },
        { merge: true }
      );

      await batch.commit();
      setSyncFeedback('✅ Les 200 quêtes et le tirage du jour ont été déployés et synchronisés avec succès sur Firestore (/quests et global_config/daily_pulse) !');
    } catch (e: any) {
      setSyncFeedback(`❌ Erreur lors du déploiement : ${e.message || e}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Quêtes filtrées dans le catalogue des 200
  const filteredQuests = useMemo(() => {
    return OFFICIAL_200_QUESTS_BANK.filter((q) => {
      const matchesSearch =
        q.titleFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.descFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.descEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
      if (selectedArc !== 'all' && q.targetArc !== 'all' && q.targetArc !== selectedArc) return false;
      if (selectedDifficulty !== 'all' && q.difficulty.toString() !== selectedDifficulty) return false;

      return true;
    });
  }, [searchQuery, selectedCategory, selectedArc, selectedDifficulty]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'physical':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/25';
      case 'mental':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/25';
      case 'lifestyle':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/25';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/25';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'physical':
        return <Dumbbell className="w-3.5 h-3.5" />;
      case 'mental':
        return <Brain className="w-3.5 h-3.5" />;
      case 'lifestyle':
        return <HeartPulse className="w-3.5 h-3.5" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* En-tête Supérieur */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>PULSE QUOTIDIEN & 200 QUÊTES</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {stats.total} Actives
                  </span>
                  {isLiveConnected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Collecte Live Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Connexion...
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Collecte en continu des données réelles issues de l'application mobile : athlètes participants, clics sur les exercices et complétions certifiées.
                </p>
              </div>
            </div>
          </div>

          {/* Onglets de navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('today')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'today'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Tirage du Jour
            </button>
            <button
              onClick={() => setActiveSubTab('catalog')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Explorateur (200)
            </button>
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Statistiques Quotidiennes
            </button>
            <button
              onClick={() => setActiveSubTab('cloud')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'cloud'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <CloudUpload className="w-3.5 h-3.5" />
              Cloud Sync
            </button>
          </div>
        </div>

        {/* 4 Métriques Clés 100% Connectées à Firestore */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Athlètes Participants</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-400">{realParticipantsCount}</span>
              <span className="text-xs text-slate-400 font-medium">/ {athletes.length} inscrits</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <UserCheck className="w-3 h-3 text-cyan-400" />
              <span>{realCompletedAthletesCount} ayant validé ≥ 1 quête</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Taux de Complétion Réel</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{realCommunityRate}%</span>
              <span className="text-xs text-emerald-400 font-bold">Live</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {realTotalCompletions} quête(s) validée(s) aujourd'hui
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Clics sur les Quêtes</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-400">{realTotalClicks}</span>
              <span className="text-xs text-slate-400">interactions</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Taps réels depuis l'application</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Validation IA & Anti-Triche</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{realAiVerifiedCount}</span>
              <span className="text-xs text-slate-400">validées</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">ML Kit Pose & Podomètre certifiés</span>
          </div>
        </div>
      </div>

      {/* 1. TIRAGE DU JOUR EN DIRECT */}
      {activeSubTab === 'today' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                    TIRAGE ACTIF DU JOUR (5 QUÊTES SYNCHRONISÉES)
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Données collectées en continu sur <code className="text-amber-300 font-mono">daily_pulse_tracking/{selectedDate}</code> depuis les smartphones des athlètes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Sélecteur de date */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-white text-xs focus:outline-none font-mono"
                  />
                </div>

                <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${currentArcInfo.colorBadge}`}>
                  Arc : <strong>{currentArcInfo.name}</strong>
                </span>
              </div>
            </div>

            {/* Grille des 5 Quêtes du Jour */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {todayQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${getCategoryColor(quest.category)}`}>
                        {getCategoryIcon(quest.category)}
                        {quest.category}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        +{quest.xpReward} XP
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {quest.descFr}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2">
                      "{quest.descEn}"
                    </p>

                    {quest.isVerifiable && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-1.5 py-0.5 rounded mt-2">
                        <CheckCircle2 className="w-3 h-3" />
                        Vérifié Dojo IA / Podomètre
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    {/* Statistiques réelles collectées */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/80 p-2 rounded border border-slate-800">
                      <div>
                        <span className="text-slate-400 text-[10px] block">CLICS MOBILES</span>
                        <span className="text-purple-300 font-bold flex items-center gap-1">
                          <MousePointerClick className="w-3 h-3 text-purple-400" />
                          {quest.clicks}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">COMPLÉTIONS</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          {quest.completions}
                        </span>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 text-[10px]">Taux ({quest.completions}/{realParticipantsCount || 1}) :</span>
                        <span className="text-emerald-400 font-bold text-xs">{quest.completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${quest.completionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Liste des athlètes ayant validé */}
                    <div className="pt-1">
                      {quest.completedAthletesDetails.length > 0 ? (
                        <div className="text-[10px] text-slate-400">
                          <span className="text-slate-500 block mb-1">Validé par :</span>
                          <div className="flex flex-wrap gap-1">
                            {quest.completedAthletesDetails.slice(0, 3).map((ath) => (
                              <span
                                key={ath.id}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-semibold"
                              >
                                {ath.username}
                              </span>
                            ))}
                            {quest.completedAthletesDetails.length > 3 && (
                              <span className="text-slate-500 text-[10px]">
                                +{quest.completedAthletesDetails.length - 3} autre(s)
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic block">
                          En attente de validation
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journal de Collecte des Athlètes du Jour */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Journal de Collecte des Athlètes ({selectedDate})
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {realParticipantsCount} participant{realParticipantsCount > 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Synchronisé automatiquement dès qu'un athlète utilise l'application
              </span>
            </div>

            {participantAthletes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Athlète</th>
                      <th className="py-2.5 px-3">Niveau</th>
                      <th className="py-2.5 px-3">Quêtes Validées Aujourd'hui</th>
                      <th className="py-2.5 px-3 text-right">Progression</th>
                      <th className="py-2.5 px-3 text-right">XP Gagnée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {participantAthletes.map((ath) => {
                      const completedCount = ath.completedQuests.length;
                      const progressPct = Math.round((completedCount / 5) * 100);
                      return (
                        <tr key={ath.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              {ath.avatarUrl ? (
                                <img
                                  src={ath.avatarUrl}
                                  alt={ath.username}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                                  {ath.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <span className="font-sans font-bold text-white block">{ath.username}</span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {ath.id.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-amber-400 font-bold">Niv. {ath.level}</span>
                            <span className="text-[10px] text-slate-500 block">{ath.fitnessLevel}</span>
                          </td>
                          <td className="py-3 px-3 font-sans">
                            {completedCount > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {ath.completedQuests.map((q) => (
                                  <span
                                    key={q.id}
                                    className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-semibold flex items-center gap-1"
                                    title={q.descFr}
                                  >
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    {q.titleFr || q.id}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">
                                Pulse ouvert • Aucune quête cochée pour l'instant
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`font-bold ${progressPct === 100 ? 'text-emerald-400' : 'text-slate-300'}`}>
                              {completedCount} / 5 ({progressPct}%)
                            </span>
                            <div className="w-24 bg-slate-800 h-1 rounded-full overflow-hidden ml-auto mt-1">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-amber-400">
                            +{ath.totalXpToday} XP
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-slate-400">Aucune activité enregistrée pour le moment le {selectedDate}</p>
                <p className="text-[11px] mt-1 text-slate-600">
                  Dès qu'un athlète ouvrira son application et consultera le Pulse Quotidien, ses interactions (clics et complétions) apparaîtront automatiquement ici en direct.
                </p>
              </div>
            )}
          </div>

          {/* Analyse comparative du jour basée sur les vrais flux */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Flame className="w-4 h-4" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Quête Championne du Jour</h4>
              </div>
              <p className="text-xs text-slate-300 font-medium line-clamp-2">{championQuest.descFr}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Performances réelles :</span>
                <span className="text-emerald-400 font-bold">{championQuest.completions} complétion(s) • {championQuest.clicks} clic(s)</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Clock className="w-4 h-4" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Participation Mobile Active</h4>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {realParticipantsCount > 0
                  ? `${realParticipantsCount} athlète(s) ont synchronisé leurs objectifs aujourd'hui.`
                  : 'En attente des premières connexions d\'athlètes sur l\'application.'}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total athlètes enregistrés :</span>
                <span className="text-cyan-400 font-bold">{athletes.length} athlètes</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Award className="w-4 h-4" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">XP Distribuée Aujourd'hui</h4>
              </div>
              <p className="text-2xl font-black text-white mt-1">{todayXpDistributed} XP</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">{realTotalCompletions} validation(s) enregistrée(s)</span>
                <span className="text-purple-400 font-bold">{realCommunityRate}% de succès</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EXPLORATEUR DES 200 QUÊTES */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          {/* Barre de filtres et recherche */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher parmi les 200 quêtes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">Tous les Piliers (200)</option>
                <option value="physical">⚔️ Physique ({stats.physicalCount})</option>
                <option value="mental">🧠 Mental ({stats.mentalCount})</option>
                <option value="lifestyle">🌿 Lifestyle ({stats.lifestyleCount})</option>
              </select>

              <select
                value={selectedArc}
                onChange={(e) => setSelectedArc(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">Tous les Arcs</option>
                <option value="royal">👑 Royal Arc ({stats.royalCount})</option>
                <option value="winter">❄️ Winter Arc ({stats.winterCount})</option>
                <option value="summer">☀️ Summer Body</option>
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">Toutes Difficultés</option>
                <option value="1">Niveau 1 : Novice</option>
                <option value="2">Niveau 2 : Intermédiaire</option>
                <option value="3">Niveau 3 : Titan</option>
              </select>

              <span className="text-xs text-slate-500 font-mono pl-2">
                {filteredQuests.length} affichée(s)
              </span>
            </div>
          </div>

          {/* Grille des Quêtes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredQuests.map((quest) => (
              <div
                key={quest.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {quest.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1 ${getCategoryColor(quest.category)}`}>
                      {getCategoryIcon(quest.category)}
                      {quest.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {quest.descFr}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    "{quest.descEn}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-mono font-bold">+{quest.xpReward} XP</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Diff. {quest.difficulty}/3
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {quest.isVerifiable && (
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Dojo IA
                      </span>
                    )}
                    {quest.targetArc !== 'all' && (
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-medium uppercase">
                        {quest.targetArc}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. STATISTIQUES QUOTIDIENNES CONNECTÉES */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Télémétrie en Direct de la Journée Sélectionnée ({selectedDate})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold">PARTICIPANTS UNIQUES</span>
                <span className="text-2xl font-black text-white mt-1 block">{realParticipantsCount}</span>
                <span className="text-[11px] text-slate-500">Athlètes ayant ouvert le Pulse</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold">CLICS TOTAUX ENREGISTRÉS</span>
                <span className="text-2xl font-black text-purple-400 mt-1 block">{realTotalClicks}</span>
                <span className="text-[11px] text-slate-500">Taps sur les cartes de quêtes</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold">COMPLÉTIONS DU JOUR</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{realTotalCompletions}</span>
                <span className="text-[11px] text-slate-500">Validations confirmées</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block font-semibold">TAUX DE SUCCÈS MOYEN</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">{realCommunityRate}%</span>
                <span className="text-[11px] text-slate-500">Basé sur les participants réels</span>
              </div>
            </div>

            {/* Détail quête par quête */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">ID Quête</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Pilier</th>
                    <th className="py-2.5 px-3">Clics Mobile</th>
                    <th className="py-2.5 px-3">Complétions</th>
                    <th className="py-2.5 px-3">Taux de Succès</th>
                    <th className="py-2.5 px-3">XP Validée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {todayQuests.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-amber-400">{q.id}</td>
                      <td className="py-3 px-3 text-white font-sans">{q.descFr}</td>
                      <td className="py-3 px-3 uppercase text-slate-300">{q.category}</td>
                      <td className="py-3 px-3 text-purple-400 font-bold">{q.clicks}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{q.completions}</td>
                      <td className="py-3 px-3 text-amber-400 font-bold">{q.completionRate}%</td>
                      <td className="py-3 px-3 text-white">{(q.completions * q.xpReward).toLocaleString('fr-FR')} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CLOUD SYNC & DÉPLOIEMENT FIRESTORE */}
      {activeSubTab === 'cloud' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-amber-400" />
              Synchronisation & Déploiement Cloud (/quests & global_config/daily_pulse)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Les 200 quêtes et le tirage du jour sont synchronisés en direct avec Firestore. Ce bouton pousse l'intégralité du catalogue des 200 quêtes dans la collection <code className="text-amber-300 font-mono">quests</code> et fixe le tirage du jour dans <code className="text-amber-300 font-mono">global_config/daily_pulse</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-white block">Collection cible : Firestore /quests & global_config/daily_pulse</span>
              <span className="text-xs text-slate-400">200 documents prêts à être déployés ou synchronisés</span>
            </div>

            {userRole === 'superadmin' && (
              <button
                onClick={handleSyncToFirestore}
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer shrink-0"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Déploiement en cours...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    Déployer les 200 quêtes vers Firestore
                  </>
                )}
              </button>
            )}
          </div>

          {syncFeedback && (
            <div className={`p-4 rounded-lg text-xs font-semibold border ${
              syncFeedback.startsWith('✅')
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}>
              {syncFeedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
