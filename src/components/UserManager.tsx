import React, { useState } from 'react';
import { AthleteUser, SubscriptionTier, AthleteLevel } from '../types/admin';
import {
  Users,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Flame,
  Filter,
  Check,
  Smartphone,
  Trophy,
  Shield,
  CreditCard,
  Lock,
  Unlock,
  Scale,
  Sparkles,
  Zap,
  Activity,
  Heart,
  TrendingUp,
  Award,
  Crown,
  Send,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  Compass,
  Footprints,
  Coins,
  MapPin,
  Calendar,
  Layers,
  Sliders
} from 'lucide-react';

interface UserManagerProps {
  users: AthleteUser[];
  userRole?: 'superadmin' | 'auditor';
  onUpdateUser: (updatedUser: AthleteUser) => void;
  onAddUser: (newUser: AthleteUser) => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  userRole = 'superadmin',
  onUpdateUser,
  onAddUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [guardianFilter, setGuardianFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Inspection Approfondie d'un Profil
  const [inspectedUser, setInspectedUser] = useState<AthleteUser | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<
    'biometrics' | 'dojo' | 'balance' | 'gps' | 'arsenal' | 'admin'
  >('biometrics');

  // Modal d'Édition Rapide & Création
  const [editingUser, setEditingUser] = useState<AthleteUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Formulaire d'ajout complet
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('Paris (11e)');
  const [newTier, setNewTier] = useState<SubscriptionTier>('FREE');
  const [newLevel, setNewLevel] = useState<AthleteLevel>('Débutant');
  const [newGuardianPath, setNewGuardianPath] = useState('Voie du Colosse');
  const [newWeight, setNewWeight] = useState(74);
  const [newHeight, setNewHeight] = useState(178);
  const [newBodyFat, setNewBodyFat] = useState(14.5);
  const [newMuscleMass, setNewMuscleMass] = useState(42.0);

  // Formulaire Notification directe à un athlète
  const [directPushTitle, setDirectPushTitle] = useState('');
  const [directPushBody, setDirectPushBody] = useState('');

  // Crédit rapide d'Aether/Gold
  const [aetherToAdd, setAetherToAdd] = useState(50);
  const [goldToAdd, setGoldToAdd] = useState(250);

  // Calculs KPIs communautaires
  const totalForceCommunity = users.reduce((acc, u) => acc + (u.forceXp || 0), 0);
  const totalWisdomCommunity = users.reduce((acc, u) => acc + (u.wisdomXp || 0), 0);
  const totalAetherCommunity = users.reduce((acc, u) => acc + (u.aetherBalance || 0), 0);
  const activeNowCount = users.filter((u) => u.onlineStatus === 'training' || u.onlineStatus === 'online').length;
  const avgPrecision = (
    users.reduce((acc, u) => acc + (u.movementPrecision || 90), 0) / (users.length || 1)
  ).toFixed(1);

  // Filtrage des athlètes
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.activeTitle && u.activeTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.guardianPath && u.guardianPath.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTier = tierFilter === 'ALL' || u.subscriptionTier === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    const matchesGuardian = guardianFilter === 'ALL' || u.guardianPath === guardianFilter;

    return matchesSearch && matchesTier && matchesStatus && matchesGuardian;
  });

  const triggerToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser(editingUser);
      if (inspectedUser && inspectedUser.id === editingUser.id) {
        setInspectedUser(editingUser);
      }
      setEditingUser(null);
      triggerToast(`Profil de @${editingUser.username} mis à jour avec succès !`);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim()) return;

    const newUser: AthleteUser = {
      id: `usr_${Date.now().toString().slice(-6)}`,
      fullName: newFullName || newUsername,
      username: newUsername.toLowerCase().replace(/\s+/g, '_'),
      email: newEmail,
      subscriptionTier: newTier,
      subscriptionStatus: 'ACTIVE',
      status: 'ACTIVE',
      fitnessLevel: newLevel,
      registeredAt: new Date().toISOString().split('T')[0],
      lastWorkoutAt: 'Jamais',
      streakDays: 0,
      totalWorkouts: 0,
      totalReps: 0,
      weightKg: Number(newWeight),
      heightCm: Number(newHeight),
      age: 24,
      bodyFat: Number(newBodyFat),
      muscleMass: Number(newMuscleMass),
      city: newCity,
      deviceModel: 'Android Flutter Native',
      appVersion: '1.0.30',
      level: 1,
      xp: 0,
      forceXp: 0,
      wisdomXp: 0,
      maxPushups: 0,
      maxPullups: 0,
      movementPrecision: 90.0,
      bestPace1km: 300,
      bestAlphaLoop6km: 35.0,
      totalDistance: 0.0,
      aetherBalance: 50,
      gold: 100,
      activeHalo: undefined,
      activeTitle: 'Initié Alpha',
      unlockedTitles: ['Initié Alpha'],
      inventory: ['potion_recovery'],
      activeArcId: 'ROYAL ARC',
      guardianPath: newGuardianPath,
      ultimateOath: '« Forger mon corps sans compromis »',
      clanIds: [],
      friendIds: [],
      onlineStatus: 'offline',
      personalRecords: {
        pushups: 0,
        pullups: 0,
        dips: 0,
        muscleups: 0,
        maxPlankSeconds: 0,
      },
    };

    onAddUser(newUser);
    setShowAddModal(false);
    triggerToast(`Compte athlète créé pour @${newUser.username} !`);
    setNewFullName('');
    setNewUsername('');
    setNewEmail('');
  };

  const toggleUserStatus = (user: AthleteUser) => {
    if (userRole !== 'superadmin') return;
    const nextStatus: 'ACTIVE' | 'SUSPENDED' = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated: AthleteUser = { ...user, status: nextStatus };
    onUpdateUser(updated);
    if (inspectedUser && inspectedUser.id === user.id) {
      setInspectedUser(updated);
    }
    triggerToast(
      nextStatus === 'SUSPENDED'
        ? `Compte de @${user.username} suspendu par la modération.`
        : `Compte de @${user.username} réactivé.`
    );
  };

  const handleGrantCurrency = (user: AthleteUser) => {
    if (userRole !== 'superadmin') return;
    const updated: AthleteUser = {
      ...user,
      aetherBalance: (user.aetherBalance || 0) + Number(aetherToAdd),
      gold: (user.gold || 0) + Number(goldToAdd),
    };
    onUpdateUser(updated);
    setInspectedUser(updated);
    triggerToast(`+${aetherToAdd} Aether et +${goldToAdd} Or injectés sur le compte de @${user.username} !`);
  };

  const handleSendDirectPush = (e: React.FormEvent, user: AthleteUser) => {
    e.preventDefault();
    if (!directPushTitle.trim() || !directPushBody.trim()) return;
    triggerToast(`Notification push transmise directement à ${user.fullName} (${user.deviceModel})`);
    setDirectPushTitle('');
    setDirectPushBody('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Bandeau Supérieur & Titre */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Comptes Athlètes & Superviseur de Profils</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono">
                  {users.length} Athlètes Inscrits
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Données réelles synchronisées avec <code className="text-blue-600 font-mono">UserEntity</code> du repo Flutter Osirion
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle Vue Cartes / Tableau */}
          <div className="bg-slate-100 p-0.5 rounded-xl flex">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vue Cartes Profils Alpha"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vue Tableau de Supervision"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {userRole === 'superadmin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un profil athlète</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Cartes KPIs de la Flotte d'Athlètes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* KPI 1 : Présence & Activité Live */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700">Athlètes Connectés</span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En direct
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {activeNowCount} / {users.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {users.filter((u) => u.onlineStatus === 'training').length} en plein entraînement Dojo
          </p>
        </div>

        {/* KPI 2 : Balance des Forces Globale */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700">Dual Balance Athlètes</span>
            <Scale className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs font-mono flex items-center justify-between font-bold pt-1">
            <span className="text-sky-600">Force : {(totalForceCommunity / 1000).toFixed(0)}k</span>
            <span className="text-amber-600">Sagesse : {(totalWisdomCommunity / 1000).toFixed(0)}k</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 mt-1">
            <div
              className="h-full bg-sky-400 rounded-l-full"
              style={{
                width: `${Math.round(
                  (totalForceCommunity / (totalForceCommunity + totalWisdomCommunity || 1)) * 100
                )}%`,
              }}
            />
            <div
              className="h-full bg-amber-400 rounded-r-full"
              style={{
                width: `${
                  100 -
                  Math.round(
                    (totalForceCommunity / (totalForceCommunity + totalWisdomCommunity || 1)) * 100
                  )
                }%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400">XP cumulée sur l'ensemble des profils</p>
        </div>

        {/* KPI 3 : Précision Biomécanique Moyenne (Dojo IA) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700">Précision IA Dojo</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {avgPrecision}%
          </div>
          <p className="text-[11px] text-slate-400">
            Score ROM strict via Google ML Kit Pose
          </p>
        </div>

        {/* KPI 4 : Réserve Économique Alpha */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700">Économie de l'Arsenal</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {totalAetherCommunity.toLocaleString()} <span className="text-xs text-slate-500 font-normal">Aether</span>
          </div>
          <p className="text-[11px] text-slate-400">
            En possession des athlètes actifs
          </p>
        </div>
      </div>

      {/* 3. Barre de Recherche et Filtres Avancés */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, pseudo, email, ville, titre honorifique ou voie du gardien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto text-xs">
          {/* Filtre Forfait */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tous les forfaits</option>
            <option value="FREE">Freemium (Gratuit)</option>
            <option value="PRO_MONTHLY">Osirion Pro (9,99€/m)</option>
            <option value="ATHLETE_ANNUAL">Pass Annuel (79,99€/an)</option>
          </select>

          {/* Filtre Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs uniquement</option>
            <option value="SUSPENDED">Suspendus (Modération)</option>
          </select>

          {/* Filtre Voie du Gardien */}
          <select
            value={guardianFilter}
            onChange={(e) => setGuardianFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Toutes les voies</option>
            <option value="Voie du Colosse">Voie du Colosse</option>
            <option value="Voie de l'Ombre">Voie de l'Ombre</option>
            <option value="Voie de la Foudre">Voie de la Foudre</option>
          </select>
        </div>
      </div>

      {/* 4. VUE CARTES DE PROFILS GUERRIERS ALPHA (viewMode === 'cards') */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => {
            const forceTotal = (user.forceXp || 0) + (user.wisdomXp || 0) || 1;
            const userForcePct = Math.round(((user.forceXp || 0) / forceTotal) * 100);
            const userWisdomPct = 100 - userForcePct;

            return (
              <div
                key={user.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Halo lumineux discret sur la carte si possédé */}
                {user.activeHalo && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                )}

                {/* Header de la carte */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar avec halo */}
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm ${
                            user.status === 'SUSPENDED'
                              ? 'bg-rose-600'
                              : user.subscriptionTier === 'ATHLETE_ANNUAL'
                              ? 'bg-gradient-to-tr from-amber-600 to-amber-400'
                              : 'bg-gradient-to-tr from-blue-700 to-sky-500'
                          }`}
                        >
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        {/* Indicateur de statut en ligne */}
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            user.onlineStatus === 'training'
                              ? 'bg-amber-500 animate-pulse'
                              : user.onlineStatus === 'online'
                              ? 'bg-emerald-500'
                              : 'bg-slate-300'
                          }`}
                          title={`Statut : ${user.onlineStatus}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm truncate">
                            {user.fullName}
                          </h3>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 font-mono">
                            Niv. {user.level || 1}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 font-semibold font-mono truncate">
                          @{user.username}
                        </div>
                        {user.activeTitle && (
                          <div className="text-[10px] font-bold text-amber-600 flex items-center gap-1 truncate mt-0.5">
                            <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{user.activeTitle}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badge Forfait */}
                    <div className="shrink-0 text-right">
                      {user.subscriptionTier === 'ATHLETE_ANNUAL' ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Pass Annuel
                        </span>
                      ) : user.subscriptionTier === 'PRO_MONTHLY' ? (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Pro Mensuel
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Freemium
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Serment Ultime & Voie du Gardien */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Compass className="w-3 h-3 text-indigo-500" />
                        <span>{user.guardianPath || 'Voie Initiatique'}</span>
                      </span>
                      <span className="font-mono text-slate-400">
                        {user.city}
                      </span>
                    </div>
                    {user.ultimateOath && (
                      <p className="italic text-slate-600 text-[11px] line-clamp-1">
                        {user.ultimateOath}
                      </p>
                    )}
                  </div>

                  {/* Dual Balance Force vs Sagesse de l'athlète */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-sky-600 font-semibold">Force : {user.forceXp || 0} XP</span>
                      <span className="text-amber-600 font-semibold">Sagesse : {user.wisdomXp || 0} XP</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex p-0.5">
                      <div className="h-full bg-sky-400 rounded-l-full" style={{ width: `${userForcePct}%` }} />
                      <div className="h-full bg-amber-400 rounded-r-full" style={{ width: `${userWisdomPct}%` }} />
                    </div>
                  </div>

                  {/* Records Physiques & Précision Dojo IA */}
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
                    <div>
                      <span className="text-slate-400 block">Pompes</span>
                      <strong className="text-slate-800 text-xs">{user.personalRecords.pushups}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tractions</span>
                      <strong className="text-slate-800 text-xs">{user.personalRecords.pullups}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Dips</span>
                      <strong className="text-slate-800 text-xs">{user.personalRecords.dips}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">IA ROM</span>
                      <strong className="text-emerald-700 text-xs">{user.movementPrecision || 90}%</strong>
                    </div>
                  </div>

                  {/* Solde Aether & Streak */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1 text-amber-600 font-bold font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{user.aetherBalance || 0} Aether</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{user.streakDays} jours de série</span>
                    </div>
                  </div>
                </div>

                {/* Bouton d'action sur la carte */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setInspectedUser(user);
                      setActiveProfileTab('biometrics');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Inspecter Profil Complet</span>
                  </button>

                  {userRole === 'superadmin' && (
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition"
                      title="Modifier les paramètres"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. VUE TABLEAU DÉTAILLÉ DE SUPERVISION (viewMode === 'table') */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Athlète & Halo</th>
                  <th className="py-3 px-3">Forfait & Status</th>
                  <th className="py-3 px-3">Biométrie</th>
                  <th className="py-3 px-3">Balance Force/Sagesse</th>
                  <th className="py-3 px-3">Records Dojo IA</th>
                  <th className="py-3 px-3">GPS Running</th>
                  <th className="py-3 px-3">Aether & Or</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.fullName}</div>
                          <div className="text-[11px] text-blue-600 font-mono">@{user.username}</div>
                          {user.activeTitle && (
                            <span className="text-[10px] text-amber-600 font-semibold block">
                              {user.activeTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-100 text-slate-700">
                        {user.subscriptionTier}
                      </span>
                      <div className="mt-0.5 text-[11px]">
                        {user.status === 'ACTIVE' ? (
                          <span className="text-emerald-600 font-medium">Actif</span>
                        ) : (
                          <span className="text-rose-600 font-bold">Suspendu</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div>{user.weightKg} kg • {user.heightCm} cm</div>
                      <div className="text-slate-400 text-[10px]">{user.bodyFat || 14}% MG • {user.muscleMass || 42}% MM</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className="text-sky-600 font-semibold">{user.forceXp || 0} Force</div>
                      <div className="text-amber-600">{user.wisdomXp || 0} Sagesse</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div>{user.personalRecords.pushups}P / {user.personalRecords.pullups}T / {user.personalRecords.dips}D</div>
                      <span className="text-emerald-700 font-bold">ROM {user.movementPrecision || 90}%</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div>{user.totalDistance || 0} km totaux</div>
                      <span className="text-slate-400 text-[10px]">1km : {user.bestPace1km || 240}s</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className="text-amber-600 font-bold">{user.aetherBalance || 0} Aether</div>
                      <div className="text-slate-500">{user.gold || 0} Gold</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setInspectedUser(user);
                            setActiveProfileTab('biometrics');
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Fiche détaillée"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {userRole === 'superadmin' && (
                          <button
                            onClick={() => toggleUserStatus(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title={user.status === 'ACTIVE' ? "Suspendre" : "Réactiver"}
                          >
                            {user.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL D'INSPECTION APPROFONDIE DU PROFIL ATHLÈTE */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900 max-h-[92vh] overflow-y-auto">
            {/* Header de la Fiche Profil */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {inspectedUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900">
                      {inspectedUser.fullName}
                    </h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Niveau {inspectedUser.level || 1}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {inspectedUser.subscriptionTier}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 font-mono font-semibold">
                    @{inspectedUser.username} • {inspectedUser.email}
                  </div>
                  {inspectedUser.activeTitle && (
                    <div className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-0.5">
                      <Crown className="w-3.5 h-3.5" />
                      <span>{inspectedUser.activeTitle}</span>
                      {inspectedUser.activeHalo && (
                        <span className="text-[10px] text-purple-600 font-normal ml-2">
                          (Halo : {inspectedUser.activeHalo})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setInspectedUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation par Onglets à l'intérieur du Profil */}
            <div className="flex space-x-1 border-b border-slate-100 pb-2 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveProfileTab('biometrics')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeProfileTab === 'biometrics'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Biométrie & Santé
              </button>
              <button
                onClick={() => setActiveProfileTab('dojo')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeProfileTab === 'dojo'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Dojo IA & Records
              </button>
              <button
                onClick={() => setActiveProfileTab('balance')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeProfileTab === 'balance'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Dual Balance Force
              </button>
              <button
                onClick={() => setActiveProfileTab('gps')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeProfileTab === 'gps'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Running & Bastions GPS
              </button>
              <button
                onClick={() => setActiveProfileTab('arsenal')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeProfileTab === 'arsenal'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Arsenal & Économie
              </button>
              <button
                onClick={() => setActiveProfileTab('admin')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeProfileTab === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                Supervision Directe
              </button>
            </div>

            {/* Contenu de l'onglet actif */}
            <div className="text-xs space-y-4 pt-1">
              {/* ONGLET 1 : BIOMÉTRIE & SANTÉ */}
              {activeProfileTab === 'biometrics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">Poids corporel</span>
                      <strong className="text-slate-800 text-base font-mono">{inspectedUser.weightKg} kg</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">Taille</span>
                      <strong className="text-slate-800 text-base font-mono">{inspectedUser.heightCm} cm</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">Masse Grasse (BF)</span>
                      <strong className="text-amber-600 text-base font-mono">{inspectedUser.bodyFat || 14}%</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px]">Masse Musculaire</span>
                      <strong className="text-sky-600 text-base font-mono">{inspectedUser.muscleMass || 42}%</strong>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-blue-600" />
                      <span>Orientation Athlétique & Engagement</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Voie du Gardien :</span>
                        <span className="font-semibold text-slate-800">{inspectedUser.guardianPath || 'Voie du Colosse'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Série active (Streak) :</span>
                        <span className="font-semibold text-amber-600">{inspectedUser.streakDays} jours consécutifs</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Serment Ultime :</span>
                      <p className="italic text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                        {inspectedUser.ultimateOath || '« Aucun serment enregistré »'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 2 : DOJO IA & RECORDS */}
              {activeProfileTab === 'dojo' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">Précision d'Exécution Google ML Kit</span>
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        {inspectedUser.movementPrecision || 90}%
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Score biomécanique validé par le PoseMathService sans triche
                      </p>
                    </div>
                    <Activity className="w-10 h-10 text-emerald-400" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <span className="text-slate-400 block text-[11px]">Max Pompes Strictes</span>
                      <strong className="text-slate-800 text-lg font-mono">{inspectedUser.personalRecords.pushups}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <span className="text-slate-400 block text-[11px]">Max Tractions Strictes</span>
                      <strong className="text-slate-800 text-lg font-mono">{inspectedUser.personalRecords.pullups}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <span className="text-slate-400 block text-[11px]">Max Dips Parallèles</span>
                      <strong className="text-slate-800 text-lg font-mono">{inspectedUser.personalRecords.dips}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <span className="text-slate-400 block text-[11px]">Max Muscle-Ups</span>
                      <strong className="text-slate-800 text-lg font-mono">{inspectedUser.personalRecords.muscleups}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <span className="text-slate-400 block text-[11px]">Planche Isométrique</span>
                      <strong className="text-slate-800 text-lg font-mono">{inspectedUser.personalRecords.maxPlankSeconds}s</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <span className="text-slate-400 block text-[11px]">Répétitions Totales</span>
                      <strong className="text-blue-600 text-lg font-mono">{inspectedUser.totalReps.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 3 : DUAL BALANCE FORCE VS SAGESSE */}
              {activeProfileTab === 'balance' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-amber-500" />
                        <span>Répartition Dual Balance</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600">
                        {((inspectedUser.forceXp || 0) + (inspectedUser.wisdomXp || 0)).toLocaleString()} XP Totale
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-xs">
                        <span className="text-sky-600 font-bold">
                          FORCE : {inspectedUser.forceXp || 0} XP ({Math.round(((inspectedUser.forceXp || 0) / ((inspectedUser.forceXp || 0) + (inspectedUser.wisdomXp || 0) || 1)) * 100)}%)
                        </span>
                        <span className="text-amber-600 font-bold">
                          SAGESSE : {inspectedUser.wisdomXp || 0} XP ({100 - Math.round(((inspectedUser.forceXp || 0) / ((inspectedUser.forceXp || 0) + (inspectedUser.wisdomXp || 0) || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex p-0.5">
                        <div
                          className="h-full bg-sky-500 rounded-l-full"
                          style={{
                            width: `${Math.round(((inspectedUser.forceXp || 0) / ((inspectedUser.forceXp || 0) + (inspectedUser.wisdomXp || 0) || 1)) * 100)}%`,
                          }}
                        />
                        <div
                          className="h-full bg-amber-500 rounded-r-full"
                          style={{
                            width: `${100 - Math.round(((inspectedUser.forceXp || 0) / ((inspectedUser.forceXp || 0) + (inspectedUser.wisdomXp || 0) || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 4 : RUNNING & BASTIONS GPS */}
              {activeProfileTab === 'gps' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                    <Footprints className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                    <span className="text-slate-400 block text-[11px]">Distance Parcourue</span>
                    <strong className="text-slate-900 text-base font-mono">{inspectedUser.totalDistance || 0} km</strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                    <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <span className="text-slate-400 block text-[11px]">Record Allure 1 km</span>
                    <strong className="text-slate-900 text-base font-mono">
                      {Math.floor((inspectedUser.bestPace1km || 240) / 60)}'{(inspectedUser.bestPace1km || 240) % 60}" /km
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                    <Trophy className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <span className="text-slate-400 block text-[11px]">Boucle Alpha 6 km</span>
                    <strong className="text-slate-900 text-base font-mono">{inspectedUser.bestAlphaLoop6km || 30} min</strong>
                  </div>
                </div>
              )}

              {/* ONGLET 5 : ARSENAL & ÉCONOMIE */}
              {activeProfileTab === 'arsenal' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
                      <span className="text-amber-800 text-[11px] block font-semibold">Solde Aether Sacré</span>
                      <strong className="text-amber-700 text-xl font-mono">{inspectedUser.aetherBalance || 0}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-slate-600 text-[11px] block font-semibold">Pièces d'Or</span>
                      <strong className="text-slate-800 text-xl font-mono">{inspectedUser.gold || 0}</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-600 font-semibold block mb-1">Titres Débloqués :</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(inspectedUser.unlockedTitles || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-medium text-[11px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ONGLET 6 : SUPERVISION DIRECTE / ACTIONS ADMIN */}
              {activeProfileTab === 'admin' && (
                <div className="space-y-4">
                  {/* Créditer Aether & Gold */}
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 space-y-3">
                    <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-600" />
                      <span>Injecter des Devises sur le Compte</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-600 font-semibold block mb-1">Montant Aether :</label>
                        <input
                          type="number"
                          value={aetherToAdd}
                          onChange={(e) => setAetherToAdd(Number(e.target.value))}
                          className="w-full bg-white border border-amber-200 rounded-xl p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-600 font-semibold block mb-1">Montant Or :</label>
                        <input
                          type="number"
                          value={goldToAdd}
                          onChange={(e) => setGoldToAdd(Number(e.target.value))}
                          className="w-full bg-white border border-amber-200 rounded-xl p-2 font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGrantCurrency(inspectedUser)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition text-xs"
                    >
                      Créditer les devises
                    </button>
                  </div>

                  {/* Notification Push directe à cet athlète */}
                  <form onSubmit={(e) => handleSendDirectPush(e, inspectedUser)} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-blue-600" />
                      <span>Envoyer une notification push FCM personnalisée</span>
                    </h4>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Titre du push (ex: ⚔️ Défi personnel validé !)"
                        value={directPushTitle}
                        onChange={(e) => setDirectPushTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        required
                        placeholder="Message personnalisé envoyé directement sur l'appareil..."
                        value={directPushBody}
                        onChange={(e) => setDirectPushBody(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition text-xs"
                    >
                      Transmettre l'alerte à l'athlète
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE CRÉATION D'ATHLÈTE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Créer un nouveau compte athlète</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nom complet :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Petit"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pseudo :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: lucas_alpha"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email :</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: lucas@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Forfait :</label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as SubscriptionTier)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  >
                    <option value="FREE">Freemium</option>
                    <option value="PRO_MONTHLY">Osirion Pro (9,99€)</option>
                    <option value="ATHLETE_ANNUAL">Pass Annuel (79,99€)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Voie du Gardien :</label>
                  <select
                    value={newGuardianPath}
                    onChange={(e) => setNewGuardianPath(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  >
                    <option value="Voie du Colosse">Voie du Colosse</option>
                    <option value="Voie de l'Ombre">Voie de l'Ombre</option>
                    <option value="Voie de la Foudre">Voie de la Foudre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Taille (cm)</label>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={(e) => setNewHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">% MG</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBodyFat}
                    onChange={(e) => setNewBodyFat(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">% MM</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMuscleMass}
                    onChange={(e) => setNewMuscleMass(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Créer le profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL D'ÉDITION DE PROFIL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Modifier le profil de {editingUser.fullName}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Forfait attribué :</label>
                <select
                  value={editingUser.subscriptionTier}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, subscriptionTier: e.target.value as SubscriptionTier })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  <option value="FREE">Freemium (Gratuit)</option>
                  <option value="PRO_MONTHLY">Osirion Pro (9,99€/m)</option>
                  <option value="ATHLETE_ANNUAL">Pass Annuel (79,99€/an)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Niveau estimé :</label>
                  <select
                    value={editingUser.fitnessLevel}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, fitnessLevel: e.target.value as AthleteLevel })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Élite">Élite</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Série (Streak jours) :</label>
                  <input
                    type="number"
                    value={editingUser.streakDays}
                    onChange={(e) => setEditingUser({ ...editingUser, streakDays: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Titre honorifique actif :</label>
                <input
                  type="text"
                  value={editingUser.activeTitle || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, activeTitle: e.target.value })}
                  placeholder="ex: Titan d'Acier"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}
    </div>
  );
};
