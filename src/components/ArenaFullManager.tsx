import React, { useState } from 'react';
import { AthleteUser, Clan } from '../types/admin';
import {
  ArenaSport,
  ForgeNavigationMode,
  TerrainType,
  BastionTacticalStatus,
  TerritoryTacticalStatus,
  DuelExerciseType,
  ForgeRouteTemplate,
  NoGoZone,
  TerritoryHexModel,
  BastionTacticalSpot,
  ColosseumRunRecord,
  ColosseumLiveDuel,
  ColosseumTournament,
} from '../types/arena';
import {
  INITIAL_FORGE_ROUTES,
  INITIAL_NO_GO_ZONES,
  INITIAL_HEX_TERRITORIES,
  INITIAL_BASTIONS_SPOTS,
  INITIAL_COLOSSEUM_RUNS,
  INITIAL_LIVE_DUELS,
  INITIAL_COLOSSEUM_TOURNAMENTS,
} from '../data/arenaData';
import {
  Swords,
  Shield,
  MapPin,
  Hexagon,
  Flame,
  Plus,
  Trash2,
  Navigation,
  Layers,
  Search,
  CheckCircle2,
  X,
  Compass,
  AlertTriangle,
  Trophy,
  Activity,
  Zap,
  Clock,
  Eye,
  Crosshair,
  TrendingDown,
  Sparkles,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  RotateCcw,
  Check,
  Flag,
  Share2,
  Map,
} from 'lucide-react';

interface ArenaFullManagerProps {
  athletes: AthleteUser[];
  userRole?: 'superadmin' | 'auditor';
  onUpdateAthlete?: (updated: AthleteUser) => void;
  onSendPushNotification?: (title: string, body: string) => void;
}

export const ArenaFullManager: React.FC<ArenaFullManagerProps> = ({
  athletes,
  userRole = 'superadmin',
  onUpdateAthlete,
  onSendPushNotification,
}) => {
  // Navigation Principale parmi les 4 Piliers officiels de l'Arène
  const [activeTab, setActiveTab] = useState<'bastions' | 'territories' | 'colosseum' | 'forge'>('bastions');

  // Datasets
  const [bastions, setBastions] = useState<BastionTacticalSpot[]>(INITIAL_BASTIONS_SPOTS);
  const [territories, setTerritories] = useState<TerritoryHexModel[]>(INITIAL_HEX_TERRITORIES);
  const [liveDuels, setLiveDuels] = useState<ColosseumLiveDuel[]>(INITIAL_LIVE_DUELS);
  const [colosseumRuns, setColosseumRuns] = useState<ColosseumRunRecord[]>(INITIAL_COLOSSEUM_RUNS);
  const [tournaments, setTournaments] = useState<ColosseumTournament[]>(INITIAL_COLOSSEUM_TOURNAMENTS);
  const [forgeRoutes, setForgeRoutes] = useState<ForgeRouteTemplate[]>(INITIAL_FORGE_ROUTES);
  const [noGoZones, setNoGoZones] = useState<NoGoZone[]>(INITIAL_NO_GO_ZONES);

  // --- SYNCHRONISATION FIREBASE ---
  React.useEffect(() => {
    // Dynamically import to avoid top-level issues if not initialized
    import('firebase/firestore').then(({ collection, query, onSnapshot, getFirestore }) => {
      const db = getFirestore();

      // 1. Bastions
      const unsubBastions = onSnapshot(query(collection(db, 'bastions')), (snap) => {
        const data = snap.docs.map((doc) => {
          const raw = doc.data();
          return {
            id: doc.id,
            ...raw,
            position: raw.position || { latitude: raw.latitude || 0, longitude: raw.longitude || 0 },
          } as BastionTacticalSpot;
        });
        if (data.length > 0) setBastions(data);
      });

      // 2. Colosseum Runs
      const unsubRuns = onSnapshot(query(collection(db, 'colosseum_runs')), (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as ColosseumRunRecord[];
        if (data.length > 0) setColosseumRuns(data);
      });

      // 3. No Go Zones
      const unsubNoGo = onSnapshot(query(collection(db, 'tactical_no_go_zones')), (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as NoGoZone[];
        if (data.length > 0) setNoGoZones(data);
      });

      // 4. Territories (H3)
      const unsubTerritories = onSnapshot(query(collection(db, 'territories')), (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as TerritoryHexModel[];
        if (data.length > 0) setTerritories(data);
        else setTerritories([]); // Empty if no data
      });

      // 5. Live Duels (Colosseum)
      const unsubLiveDuels = onSnapshot(query(collection(db, 'live_duels')), (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as ColosseumLiveDuel[];
        if (data.length > 0) setLiveDuels(data);
        else setLiveDuels([]);
      });

      // 6. Tournaments (Colosseum)
      const unsubTournaments = onSnapshot(query(collection(db, 'colosseum_tournaments')), (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as ColosseumTournament[];
        if (data.length > 0) setTournaments(data);
        else setTournaments([]);
      });

      // 7. Forge Routes (IA & Routage)
      const unsubForgeRoutes = onSnapshot(query(collection(db, 'forge_routes')), (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as ForgeRouteTemplate[];
        if (data.length > 0) setForgeRoutes(data);
        else setForgeRoutes([]);
      });

      return () => {
        unsubBastions();
        unsubRuns();
        unsubNoGo();
        unsubTerritories();
        unsubLiveDuels();
        unsubTournaments();
        unsubForgeRoutes();
      };
    }).catch(e => console.error("Firebase sync error in ArenaFullManager:", e));
  }, []);

  // Filters & State
  const [bastionFilter, setBastionFilter] = useState<string>('ALL');
  const [bastionSearch, setBastionSearch] = useState<string>('');
  const [selectedBastion, setSelectedBastion] = useState<BastionTacticalSpot | null>(null);

  const [territoryFilter, setTerritoryFilter] = useState<string>('ALL');
  const [duelSportFilter, setDuelSportFilter] = useState<string>('ALL');
  const [forgeSportFilter, setForgeSportFilter] = useState<ArenaSport | 'ALL'>('ALL');

  // Modals
  const [showAddBastionModal, setShowAddBastionModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddNoGoZoneModal, setShowAddNoGoZoneModal] = useState(false);
  const [showAddTournamentModal, setShowAddTournamentModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Bastion Form
  const [newBastionName, setNewBastionName] = useState('');
  const [newBastionCity, setNewBastionCity] = useState('Paris');
  const [newBastionNeighborhood, setNewBastionNeighborhood] = useState('');
  const [newBastionType, setNewBastionType] = useState<BastionTacticalSpot['type']>('PARC_COMPLET');
  const [newBastionLat, setNewBastionLat] = useState('48.8566');
  const [newBastionLng, setNewBastionLng] = useState('2.3522');
  const [newBastionEquipment, setNewBastionEquipment] = useState('Barres de traction, Dips, Anneaux');

  // New Forge Route Form
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteSport, setNewRouteSport] = useState<ArenaSport>('RUNNING');
  const [newRouteMode, setNewRouteMode] = useState<ForgeNavigationMode>('BOUCLE_IA');
  const [newRouteDistance, setNewRouteDistance] = useState(5.0);
  const [newRouteTerrain, setNewRouteTerrain] = useState<TerrainType>('PLAT');

  // New No-Go Zone Form
  const [newNoGoName, setNewNoGoName] = useState('');
  const [newNoGoReason, setNewNoGoReason] = useState<NoGoZone['reason']>('ZONE_DANGEREUSE');
  const [newNoGoRadius, setNewNoGoRadius] = useState(300);

  // New Tournament Form
  const [newTournTitle, setNewTournTitle] = useState('');
  const [newTournPool, setNewTournPool] = useState(3000);
  const [newTournExercise, setNewTournExercise] = useState('Tractions Strictes • Dips • Pushups');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Metrics
  const forteressesCount = bastions.filter((b) => b.tacticalStatus === 'FORTERESSE').length;
  const conflitsCount = bastions.filter((b) => b.tacticalStatus === 'CONFLIT').length;
  const viergesCount = bastions.filter((b) => b.tacticalStatus === 'VIERGE').length;
  const liveDuelsCount = liveDuels.filter((d) => d.status === 'LIVE').length;
  const totalAetherAtStake = liveDuels
    .filter((d) => d.status === 'LIVE')
    .reduce((acc, curr) => acc + curr.aetherWagerPerAthlete * 2, 0);

  // Filtered lists
  const filteredBastions = bastions.filter((b) => {
    const searchLower = (bastionSearch || '').toLowerCase();
    const matchesSearch =
      (b.name || '').toLowerCase().includes(searchLower) ||
      (b.city || '').toLowerCase().includes(searchLower) ||
      (b.neighborhood || '').toLowerCase().includes(searchLower) ||
      (b.currentBoss?.pseudo || '').toLowerCase().includes(searchLower);
    const matchesStatus = bastionFilter === 'ALL' || b.tacticalStatus === bastionFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTerritories = territories.filter((t) => {
    if (territoryFilter === 'ALL') return true;
    return t.status === territoryFilter;
  });

  const filteredForgeRoutes = forgeRoutes.filter((r) => {
    if (forgeSportFilter === 'ALL') return true;
    return r.sport === forgeSportFilter;
  });

  // Handlers
  const handleCreateBastion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBastionName.trim()) return;

    const newSpot: BastionTacticalSpot = {
      id: `bastion_${Date.now()}`,
      name: newBastionName.trim(),
      city: newBastionCity.trim(),
      neighborhood: newBastionNeighborhood.trim() || 'Zone Urbaine',
      position: {
        latitude: parseFloat(newBastionLat) || 48.8566,
        longitude: parseFloat(newBastionLng) || 2.3522,
      },
      type: newBastionType,
      equipment: newBastionEquipment.split(',').map((s) => s.trim()),
      tacticalStatus: 'VIERGE',
      failedAttemptsCount: 0,
      sourcePriority: 'FIRESTORE_ECLAIREUR',
      images: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500'],
      leaderboard: [],
      osmNote: 'Bastion créé manuellement par l’administration Osirion.',
    };

    setBastions([newSpot, ...bastions]);
    setShowAddBastionModal(false);
    setNewBastionName('');
    setNewBastionNeighborhood('');
    showToast(`Nouveau Bastion Sacré « ${newSpot.name} » ajouté avec succès !`);

    if (onSendPushNotification) {
      onSendPushNotification(
        '🏰 Nouveau Bastion de Combat Découvert !',
        `Le Bastion « ${newSpot.name} » à ${newSpot.city} est ouvert aux conquérants. Devenez le premier Boss !`
      );
    }
  };

  const handleDestituteBoss = (bastionId: string) => {
    setBastions((prev) =>
      prev.map((b) => {
        if (b.id === bastionId) {
          return {
            ...b,
            currentBoss: undefined,
            tacticalStatus: 'VIERGE',
            leaderboard: [],
            lastBeatenAt: undefined,
          };
        }
        return b;
      })
    );
    if (selectedBastion && selectedBastion.id === bastionId) {
      setSelectedBastion(null);
    }
    showToast('Boss destitué pour non-conformité ou triche GPS. Le Bastion redevient VIERGE !');
  };

  const handleLiberateTerritory = (h3Id: string) => {
    setTerritories((prev) =>
      prev.map((t) => {
        if (t.id === h3Id) {
          return {
            ...t,
            status: 'NEUTRE',
            ownerClanId: undefined,
            ownerClanName: undefined,
            ownerLeaderPseudo: undefined,
            currentLeaderKms: 0,
            lastCapturedAt: 'Libéré par arbitrage admin',
            influencePoints: 0,
          };
        }
        return t;
      })
    );
    showToast('Territoire hexagonal H3 libéré ! Reclassé en Zone Neutre.');
  };

  const handleToggleNoGoZone = (zoneId: string) => {
    setNoGoZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, active: !z.active } : z))
    );
    showToast('Paramètre de sécurité de la No-Go Zone mis à jour.');
  };

  const handleCreateNoGoZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoGoName.trim()) return;

    const zone: NoGoZone = {
      id: `nogo_${Date.now()}`,
      name: newNoGoName.trim(),
      reason: newNoGoReason,
      center: { latitude: 48.8566, longitude: 2.3522 },
      radiusMeters: Number(newNoGoRadius) || 300,
      active: true,
      createdAt: 'Aujourd’hui',
    };

    setNoGoZones([zone, ...noGoZones]);
    setShowAddNoGoZoneModal(false);
    setNewNoGoName('');
    showToast(`No-Go Zone « ${zone.name} » activée. Les Boucles IA contourneront ce périmètre.`);
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournTitle.trim()) return;

    const tourn: ColosseumTournament = {
      id: `tourn_${Date.now()}`,
      title: newTournTitle.trim(),
      description: 'Tournoi officiel administré par Osirion Colisée.',
      totalAetherPool: Number(newTournPool) || 2000,
      participantsCount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
      featuredExercise: newTournExercise,
      rules: 'Arbitrage par vision IA Google ML Kit Pose Detection. Décompte dynamique Tug-of-War.',
    };

    setTournaments([tourn, ...tournaments]);
    setShowAddTournamentModal(false);
    setNewTournTitle('');
    showToast(`Tournoi officiel « ${tourn.title} » lancé avec ${tourn.totalAetherPool} Aether en jeu !`);

    if (onSendPushNotification) {
      onSendPushNotification(
        `⚔️ Nouveau Tournoi Officiel du Colisée : ${tourn.title}`,
        `Cagnotte de ${tourn.totalAetherPool} Aether Sacré. Entrez dans l'Arène et défiez vos rivaux !`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. GRAND BANDEAU DE SUPERVISION DE L'ARÈNE */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80 rounded-3xl border border-slate-800 shadow-xl p-6 sm:p-8 text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>COLISÉE, CONQUÊTE H3 & BASTIONS STREET WORKOUT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>L'Arène Complète Osirion</span>
              {conflitsCount > 0 && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-rose-600 text-white animate-pulse">
                  {conflitsCount} Bastion{conflitsCount > 1 ? 's' : ''} en Conflit
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Supervision temps réel des 4 piliers de combat : <strong>La Forge</strong> (Boucles IA & Routage), <strong>Les Territoires</strong> (Conquête H3), <strong>Les Bastions</strong> (Boss, Défense & Déclin 5%/semaine) et <strong>Le Colisée</strong> (Duels 1v1 synchronisés Tug-of-War & Runs Fantômes).
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Forteresses Actives</span>
              <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
                {forteressesCount}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Duels 1v1 en Direct</span>
              <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                {liveDuelsCount}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Cagnotte en Jeu</span>
              <span className="text-xl font-black text-purple-400 font-mono mt-0.5 block">
                {totalAetherAtStake} ₳
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">No-Go Zones IA</span>
              <span className="text-xl font-black text-sky-400 font-mono mt-0.5 block">
                {noGoZones.filter((z) => z.active).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ONGLET DE NAVIGATION ENTRE LES 4 PILIERS DE L'APPLICATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('bastions')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'bastions'
                ? 'bg-amber-500 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>1. Les Bastions ({bastions.length})</span>
            {conflitsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono">
                {conflitsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('territories')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'territories'
                ? 'bg-amber-500 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Hexagon className="w-4 h-4" />
            <span>2. Les Territoires H3 ({territories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('colosseum')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'colosseum'
                ? 'bg-amber-500 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>3. Le Colisée (Duels 1v1 & Tug-of-War)</span>
            {liveDuelsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('forge')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'forge'
                ? 'bg-amber-500 text-white shadow-md font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>4. La Forge (Navigation & Boucle IA)</span>
          </button>
        </div>

        {/* Action Button depending on tab */}
        <div>
          {activeTab === 'bastions' && userRole === 'superadmin' && (
            <button
              onClick={() => setShowAddBastionModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Bastion Sacré</span>
            </button>
          )}

          {activeTab === 'colosseum' && userRole === 'superadmin' && (
            <button
              onClick={() => setShowAddTournamentModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Trophy className="w-4 h-4" />
              <span>Lancer un Grand Tournoi</span>
            </button>
          )}

          {activeTab === 'forge' && userRole === 'superadmin' && (
            <button
              onClick={() => setShowAddNoGoZoneModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Ajouter une No-Go Zone</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 : LES BASTIONS (SPOTS STREET WORKOUT, BOSS & DÉCLIN TACTIQUE) */}
      {/* ========================================================================= */}
      {activeTab === 'bastions' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville, quartier ou pseudo du Boss..."
                value={bastionSearch}
                onChange={(e) => setBastionSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400"
              />
              {bastionSearch && (
                <button onClick={() => setBastionSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Statut Tactique :</span>
              {['ALL', 'FORTERESSE', 'CONFLIT', 'STABLE', 'VIERGE'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBastionFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    bastionFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' && 'Tous les Bastions'}
                  {st === 'FORTERESSE' && '🏰 Forteresse (>7j)'}
                  {st === 'CONFLIT' && '⚔️ Conflit (<48h)'}
                  {st === 'STABLE' && '🛡️ Stable'}
                  {st === 'VIERGE' && '⚪ Vierge (Sans Boss)'}
                </button>
              ))}
            </div>
          </div>

          {/* Bastions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBastions.map((spot) => (
              <div
                key={spot.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Badge & Tactical Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        spot.tacticalStatus === 'FORTERESSE'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : spot.tacticalStatus === 'CONFLIT'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : spot.tacticalStatus === 'STABLE'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {spot.tacticalStatus === 'FORTERESSE' && '🏰 Forteresse Imbattable'}
                      {spot.tacticalStatus === 'CONFLIT' && '⚔️ Siège & Conflit Ouvert'}
                      {spot.tacticalStatus === 'STABLE' && '🛡️ Bastion Pacifié'}
                      {spot.tacticalStatus === 'VIERGE' && '⚪ Bastion Inexploré'}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                      {spot.sourcePriority === 'FIRESTORE_ECLAIREUR' ? 'Éclaireur IA' : 'OpenStreetMap'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-tight">{spot.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>
                      {spot.city} • <strong className="text-slate-700">{spot.neighborhood}</strong>
                    </span>
                  </div>

                  {/* Boss Info Card */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/80">
                    {spot.currentBoss ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            👑 Boss Régnant :
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {spot.failedAttemptsCount} assauts repoussés
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-200 overflow-hidden border border-amber-300 shrink-0">
                            {spot.currentBoss.avatarUrl ? (
                              <img
                                src={spot.currentBoss.avatarUrl}
                                alt={spot.currentBoss.pseudo}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-amber-800">
                                {spot.currentBoss?.pseudo?.slice(0, 2).toUpperCase() || '??'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 text-xs truncate">
                              @{spot.currentBoss.pseudo}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {spot.currentBoss.clanName || 'Athlète Indépendant'}
                            </p>
                          </div>
                        </div>

                        {/* Score & Déclin Formula */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Record Initial :</span>
                            <span className="font-bold text-slate-800">
                              {spot.currentBoss.reps} {spot.currentBoss.exerciseType}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-amber-700 font-bold block flex items-center gap-1 justify-end">
                              <TrendingDown className="w-3 h-3 text-amber-600" />
                              Score Effectif :
                            </span>
                            <span className="font-black text-amber-600 font-mono text-sm">
                              {spot.currentBoss.effectiveReps} reps
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3 text-xs text-slate-400">
                        <Trophy className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                        <span className="font-semibold block text-slate-600">Aucun Boss pour ce Bastion</span>
                        <span className="text-[10px]">Le premier athlète à s'y entraîner sera couronné !</span>
                      </div>
                    )}
                  </div>

                  {/* Equipments Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(spot.equipment || []).slice(0, 3).map((eq, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium"
                      >
                        {eq}
                      </span>
                    ))}
                    {(spot.equipment || []).length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[10px]">
                        +{(spot.equipment || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedBastion(spot)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Détails & Classement</span>
                  </button>

                  {spot.currentBoss && userRole === 'superadmin' && (
                    <button
                      onClick={() => handleDestituteBoss(spot.id)}
                      title="Destituer le boss pour triche ou fausse position GPS"
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2 : LES TERRITOIRES H3 (CONQUÊTE SPATIALE & HEXAGONES) */}
      {/* ========================================================================= */}
      {activeTab === 'territories' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
                <Hexagon className="w-3.5 h-3.5 text-blue-400" />
                <span>INDEXATION SPATIALE H3 UBER (RÉSOLUTION 8)</span>
              </div>
              <h2 className="text-xl font-black text-white">Cartographie & Souveraineté Territoriale</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Chaque hexagone représente une zone d'influence capturable par les clans. Le champion ayant parcouru le plus grand volume de kilomètres homologués dans la zone en détient les droits de seigneurie et fait gagner des points de clan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Zones Conquises</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {territories.filter((t) => t.status === 'CONQUIS').length}
                </span>
              </div>
              <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">En Conflit</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {territories.filter((t) => t.status === 'DISPUTE').length}
                </span>
              </div>
              <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Zones Neutres</span>
                <span className="text-2xl font-black text-slate-400 font-mono">
                  {territories.filter((t) => t.status === 'NEUTRE').length}
                </span>
              </div>
            </div>
          </div>

          {/* Territories Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Hexagon className="w-4 h-4 text-amber-500" />
                <span>Hexagones Tactiques en France</span>
              </h3>

              <div className="flex items-center gap-2 text-xs">
                {['ALL', 'CONQUIS', 'DISPUTE', 'NEUTRE'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTerritoryFilter(st)}
                    className={`px-3 py-1 rounded-xl font-bold transition ${
                      territoryFilter === st
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'Tous' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Hexagone H3</th>
                    <th className="py-3 px-4">Ville & Zone</th>
                    <th className="py-3 px-4">Clan Souverain</th>
                    <th className="py-3 px-4">Leader Actuel</th>
                    <th className="py-3 px-4">Volume GPS (km)</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Arbitrage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTerritories.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {t.h3Index}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{t.zoneName}</span>
                        <span className="text-slate-400 text-[11px]">{t.city}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {t.ownerClanName ? (
                          <span className="font-semibold text-slate-800">{t.ownerClanName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Aucun clan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {t.ownerLeaderPseudo ? `@${t.ownerLeaderPseudo}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-black font-mono text-amber-600">
                        {t.currentLeaderKms} km
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'CONQUIS'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'DISPUTE'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {t.status !== 'NEUTRE' && userRole === 'superadmin' && (
                          <button
                            onClick={() => handleLiberateTerritory(t.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold transition text-[11px]"
                          >
                            Libérer la zone
                          </button>
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

      {/* ========================================================================= */}
      {/* SECTION 3 : LE COLISÉE (DUELS 1V1, RUNS GHOST & TUG-OF-WAR BAR) */}
      {/* ========================================================================= */}
      {activeTab === 'colosseum' && (
        <div className="space-y-6">
          {/* 3.A DUELS 1V1 EN DIRECT AVEC LA BARRE TUG-OF-WAR */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Swords className="w-5 h-5 text-rose-600" />
                  <span>Duels 1v1 Synchronisés & Tir à la Corde (Tug-of-War)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Affrontements en direct où chaque répétition validée par l'IA Pose Detection pousse la jauge au détriment de l'adversaire.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {liveDuels.filter((d) => d.status === 'LIVE').length} Combats Actifs
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {liveDuels.map((duel) => {
                const totalReps = duel.athlete1.currentReps + duel.athlete2.currentReps;
                const p1Percentage =
                  totalReps > 0
                    ? Math.round((duel.athlete1.currentReps / totalReps) * 100)
                    : 50;
                const p2Percentage = 100 - p1Percentage;

                return (
                  <div
                    key={duel.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4"
                  >
                    {/* Duel Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <h4 className="font-bold text-slate-900 text-sm">{duel.duelTitle}</h4>
                      </div>
                      <span className="text-xs font-mono font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                        {duel.aetherWagerPerAthlete * 2} ₳ en jeu
                      </span>
                    </div>

                    {/* Both Athletes Info */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Athlete 1 */}
                      <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900 text-xs">
                            @{duel.athlete1.pseudo}
                          </span>
                          <span className="text-[10px] text-blue-600 font-mono">
                            IA: {duel.athlete1.posePrecisionScore}%
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-600/80 truncate">
                          {duel.athlete1.clanName}
                        </p>
                        <p className="text-2xl font-black text-blue-900 font-mono pt-1">
                          {duel.athlete1.currentReps}{' '}
                          <span className="text-xs font-normal text-blue-600">/ {duel.athlete1.targetReps}</span>
                        </p>
                      </div>

                      {/* Athlete 2 */}
                      <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1 text-right">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-rose-600 font-mono">
                            IA: {duel.athlete2.posePrecisionScore}%
                          </span>
                          <span className="font-bold text-rose-900 text-xs">
                            @{duel.athlete2.pseudo}
                          </span>
                        </div>
                        <p className="text-[10px] text-rose-600/80 truncate">
                          {duel.athlete2.clanName}
                        </p>
                        <p className="text-2xl font-black text-rose-900 font-mono pt-1">
                          {duel.athlete2.currentReps}{' '}
                          <span className="text-xs font-normal text-rose-600">/ {duel.athlete2.targetReps}</span>
                        </p>
                      </div>
                    </div>

                    {/* TUG-OF-WAR BAR (JAUGE DE BRAS DE FER INTERACTIVE) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-blue-600">{p1Percentage}% de domination</span>
                        <span className="text-slate-400 font-mono">Tir à la Corde IA</span>
                        <span className="text-rose-600">{p2Percentage}% de domination</span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                        <div
                          style={{ width: `${p1Percentage}%` }}
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
                        />
                        <div
                          style={{ width: `${p2Percentage}%` }}
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-600 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Temps restant : {duel.timeRemainingSec}s</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                        Arbitrage PoseDetector ML Kit Actif
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3.B RECORDS ASYNCHRONES DU COLISÉE (COURSES FANTÔMES / GHOST RUNS) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-500" />
                  <span>Runs Fantômes & Défis Asynchrones du Colisée</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Parcours enregistrés avec vitesse segmentée permettant aux autres athlètes de concourir contre l'avatar Ghost.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {colosseumRuns.map((run) => (
                <div
                  key={run.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                        {run.activityType}
                      </span>
                      <h5 className="font-bold text-slate-900 text-xs mt-1">{run.title}</h5>
                    </div>
                    <span className="text-xs font-black font-mono text-slate-800">
                      {run.durationFormatted}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Distance :</span>
                      <span className="font-bold text-slate-800">{run.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Vitesse moy :</span>
                      <span className="font-bold text-slate-800">{run.averageSpeedKmh} km/h</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Créateur : <strong>@{run.creatorPseudo}</strong></span>
                    <span className="font-mono text-purple-600 font-bold">{run.challengersCount} challengers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3.C TOURNOIS OFFICIELS DU COLISÉE */}
          <div className="bg-gradient-to-br from-purple-900 to-slate-900 text-white rounded-3xl p-6 border border-purple-800/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-lg text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Grands Tournois du Colisée</span>
                </h4>
                <p className="text-xs text-purple-200/80">
                  Compétitions officielles à élimination directe ou classement par points hebdomadaire.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  className="bg-white/10 border border-white/15 rounded-2xl p-4 space-y-3 backdrop-blur-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {t.status === 'ACTIVE' ? 'En Cours' : 'À Venir'}
                      </span>
                      <h5 className="font-bold text-white text-sm mt-1">{t.title}</h5>
                    </div>
                    <span className="font-black font-mono text-amber-300 text-base">
                      {t.totalAetherPool} ₳
                    </span>
                  </div>

                  <p className="text-xs text-purple-200/90 leading-relaxed">{t.description}</p>

                  <div className="p-2.5 rounded-xl bg-black/20 text-xs space-y-1">
                    <p className="text-purple-300 font-semibold">Épreuve : {t.featuredExercise}</p>
                    <p className="text-[11px] text-purple-200/70">{t.rules}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-purple-300 pt-1">
                    <span>{t.participantsCount} participants</span>
                    <span>Fin : {t.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4 : LA FORGE (NAVIGATION, BOUCLE IA & NO-GO ZONES) */}
      {/* ========================================================================= */}
      {activeTab === 'forge' && (
        <div className="space-y-6">
          {/* Header Forge */}
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>MOTEUR GÉOSPATIAL DE LA FORGE</span>
              </div>
              <h2 className="text-xl font-black text-white">Algorithmes de Routage & Boucle IA</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervision du générateur automatique de boucle d'entraînement, calcul des altitudes et projection du Ghost Path Snapping. Les athlètes choisissent leur distance cible et la Forge calcule en temps réel l'itinéraire optimal évitant les No-Go Zones.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Parcours IA</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {forgeRoutes.length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tolérance Ghost</span>
                <span className="text-2xl font-black text-sky-400 font-mono">
                  15 m
                </span>
              </div>
            </div>
          </div>

          {/* Sub-section: No-Go Zones de Sécurité */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Périmètres d'Exclusion Sécuritaire (No-Go Zones)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Zones interdites au tracé IA (travaux, voies rapides, sites privés dangereux).
                </p>
              </div>

              {userRole === 'superadmin' && (
                <button
                  onClick={() => setShowAddNoGoZoneModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition"
                >
                  + Ajouter une Zone
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {noGoZones.map((zone) => {
                const lat = zone.center?.latitude || zone.latitude || 0;
                const lng = zone.center?.longitude || zone.longitude || 0;
                const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
                return (
                  <div
                    key={zone.id}
                    className={`p-3.5 rounded-2xl border transition ${
                      zone.active
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-100/80 px-2 py-0.5 rounded">
                          {zone.reason || 'NON_SPÉCIFIÉ'}
                        </span>
                        <h5 className="font-bold text-slate-900 text-xs mt-1.5">{zone.name || 'Zone sans nom'}</h5>
                        {zone.reported_by && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Signalé par: {zone.reported_by}</p>
                        )}
                        {zone.createdAt && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Le: {zone.createdAt}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleNoGoZone(zone.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          zone.active ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {zone.active ? 'Active' : 'Désactivée'}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2">
                      <p className="text-[11px] text-slate-500">
                        Rayon: <strong>{zone.radiusMeters || 0} m</strong>
                        <br />
                        GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
                      </p>
                      
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-slate-800 transition"
                      >
                        <Map className="w-3 h-3" />
                        Ouvrir Maps
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-section: Modèles de Boucles IA de la Forge */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Boucles IA & Tracés Spécifiques de l'Arc</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Itinéraires étalonnés avec Ghost Path Snapping prêt pour l'entraînement mobile.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {(['ALL', 'RUNNING', 'WALKING', 'CYCLING'] as const).map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setForgeSportFilter(sp)}
                    className={`px-3 py-1 rounded-xl font-bold transition ${
                      forgeSportFilter === sp
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sp === 'ALL' && 'Tous les sports'}
                    {sp === 'RUNNING' && '🏃 Course'}
                    {sp === 'WALKING' && '🚶 Marche'}
                    {sp === 'CYCLING' && '🚴 Vélo'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredForgeRoutes.map((route) => (
                <div
                  key={route.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {route.navigationMode === 'BOUCLE_IA' ? 'Boucle IA' : 'Point A -> B'}
                        </span>
                        {route.isOfficialArcLoop && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Arc Royal
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm mt-1">{route.name}</h5>
                    </div>

                    <span className="text-sm font-black font-mono text-amber-600">
                      {route.targetDistanceKm} km
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100 text-center">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Dénivelé :</span>
                      <span className="font-bold text-slate-800">+{route.elevationGainMeters} m</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Durée est. :</span>
                      <span className="font-bold text-slate-800">{route.estimatedDurationMin} min</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 block">Recalage Ghost :</span>
                      <span className="font-bold text-slate-800">±{route.snapToleranceMeters} m</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Allure Ghost : <strong>{route.ghostPaceMinKm}</strong></span>
                    <span className="text-[10px] font-mono text-slate-400">{route.waypointsCount} balises GPS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1 : DÉTAILS D'UN BASTION (LEADERBOARD & DÉCLIN TACTIQUE) */}
      {/* ========================================================================= */}
      {selectedBastion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-600">Fiche Tactique Bastion</span>
                <h3 className="font-black text-lg text-slate-900">{selectedBastion.name}</h3>
              </div>
              <button onClick={() => setSelectedBastion(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note & Localisation */}
            <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
              <p className="text-slate-600 font-semibold">{selectedBastion.city} • {selectedBastion.neighborhood}</p>
              <p className="text-slate-500 text-[11px]">{selectedBastion.osmNote}</p>
              <div className="text-[10px] font-mono text-slate-400 pt-1">
                GPS: {selectedBastion.position.latitude}, {selectedBastion.position.longitude}
              </div>
            </div>

            {/* Formule de Déclin Tactique (Explication) */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <TrendingDown className="w-4 h-4 text-amber-700" />
                <span>Règle de Déclin Tactique (5% / semaine) :</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Pour éviter qu'un boss ne s'approprie un spot indéfiniment sans s'entraîner, son score effectif décline de 0.71% par jour passé sans nouvelle confirmation sur place (avec un plancher à 50%).
              </p>
            </div>

            {/* Leaderboard Entries */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">Palmarès des Combattants :</h4>
              {selectedBastion.leaderboard.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {selectedBastion.leaderboard.map((entry, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">@{entry.pseudo}</p>
                          <p className="text-[10px] text-slate-400">{entry.clanName || 'Indépendant'}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-amber-600 text-sm block">
                          {entry.effectiveReps} reps
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (brut : {entry.reps} {entry.exerciseType})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-4">Aucun enregistrement sur ce spot.</p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedBastion(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2 : AJOUTER UN NOUVEAU BASTION */}
      {/* ========================================================================= */}
      {showAddBastionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Créer un Nouveau Bastion</h3>
              </div>
              <button onClick={() => setShowAddBastionModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBastion} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom du Bastion :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bastion de la Paix - Quai Saint-Bernard"
                  value={newBastionName}
                  onChange={(e) => setNewBastionName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ville :</label>
                  <input
                    type="text"
                    required
                    value={newBastionCity}
                    onChange={(e) => setNewBastionCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quartier / Secteur :</label>
                  <input
                    type="text"
                    placeholder="Ex: 5ème Arrondissement"
                    value={newBastionNeighborhood}
                    onChange={(e) => setNewBastionNeighborhood(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Latitude GPS :</label>
                  <input
                    type="text"
                    value={newBastionLat}
                    onChange={(e) => setNewBastionLat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Longitude GPS :</label>
                  <input
                    type="text"
                    value={newBastionLng}
                    onChange={(e) => setNewBastionLng(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Équipements (séparés par des virgules) :</label>
                <input
                  type="text"
                  value={newBastionEquipment}
                  onChange={(e) => setNewBastionEquipment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Ériger le Bastion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3 : AJOUTER UNE NO-GO ZONE */}
      {/* ========================================================================= */}
      {showAddNoGoZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">Nouvelle No-Go Zone Sécuritaire</h3>
              </div>
              <button onClick={() => setShowAddNoGoZoneModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNoGoZone} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom de la Zone :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chantier Métro Ligne 14"
                  value={newNoGoName}
                  onChange={(e) => setNewNoGoName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Motif d'Exclusion :</label>
                <select
                  value={newNoGoReason}
                  onChange={(e) => setNewNoGoReason(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                >
                  <option value="ZONE_DANGEREUSE">Zone Dangereuse (Nuit / Trafic)</option>
                  <option value="TRAVAUX">Travaux de voirie temporaires</option>
                  <option value="VOIE_RAPIDE_INTERDITE">Voie rapide / Autoroute interdite aux piétons</option>
                  <option value="SITE_PRIVE">Site Privé sans accès public</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rayon d'Exclusion (mètres) :</label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="50"
                  value={newNoGoRadius}
                  onChange={(e) => setNewNoGoRadius(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddNoGoZoneModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Activer la No-Go Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4 : LANCER UN GRAND TOURNOI */}
      {/* ========================================================================= */}
      {showAddTournamentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">Lancer un Tournoi Officiel</h3>
              </div>
              <button onClick={() => setShowAddTournamentModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Titre de la Compétition :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Colisée Clash • Défi National Dips"
                  value={newTournTitle}
                  onChange={(e) => setNewTournTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dotation Aether Sacré (Cagnotte) :</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={newTournPool}
                  onChange={(e) => setNewTournPool(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Épreuve Officielle :</label>
                <input
                  type="text"
                  value={newTournExercise}
                  onChange={(e) => setNewTournExercise(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTournamentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Ouvrir les Inscriptions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
