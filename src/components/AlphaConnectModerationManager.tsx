import React, { useState } from 'react';
import { AthleteUser } from '../types/admin';
import {
  ConnectMessageItem,
  UserReport,
  UserSanction,
  AdminTransmission,
  ModerationEvidence,
  ReportStatus,
  ReportSeverity,
  SanctionType,
} from '../types/moderation';
import {
  INITIAL_USER_REPORTS,
  INITIAL_USER_SANCTIONS,
  INITIAL_ADMIN_TRANSMISSIONS,
  INITIAL_EVIDENCE_STORE,
} from '../data/moderationData';
import {
  ShieldAlert,
  Radio,
  MessageSquare,
  AlertTriangle,
  UserX,
  FileText,
  Send,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Lock,
  Unlock,
  Plus,
  Volume2,
  Video,
  FileCheck,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Download,
  AlertOctagon,
  ChevronRight,
  Shield,
  Megaphone,
  ShieldCheck,
  KeyRound,
  FileSearch,
} from 'lucide-react';

interface AlphaConnectModerationManagerProps {
  athletes: AthleteUser[];
  userRole?: 'superadmin' | 'auditor';
  onUpdateAthlete?: (updated: AthleteUser) => void;
  onSendPushNotification?: (title: string, body: string) => void;
}

export const AlphaConnectModerationManager: React.FC<AlphaConnectModerationManagerProps> = ({
  athletes,
  userRole = 'superadmin',
  onUpdateAthlete,
  onSendPushNotification,
}) => {
  // Navigation Tabs - Axée 100% sur les Signalements, Preuves, Avertissements et Messages Admins
  const [activeTab, setActiveTab] = useState<
    'reports' | 'sanctions' | 'evidence' | 'admin_transmissions' | 'privacy_audit'
  >('reports');

  // Datasets
  const [reports, setReports] = useState<UserReport[]>(INITIAL_USER_REPORTS);
  const [sanctions, setSanctions] = useState<UserSanction[]>(INITIAL_USER_SANCTIONS);
  const [adminTransmissions, setAdminTransmissions] = useState<AdminTransmission[]>(INITIAL_ADMIN_TRANSMISSIONS);
  const [evidenceStore, setEvidenceStore] = useState<ModerationEvidence[]>(INITIAL_EVIDENCE_STORE);

  // Filters & Searches
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('ALL');
  const [reportSeverityFilter, setReportSeverityFilter] = useState<string>('ALL');
  const [reportSearchQuery, setReportSearchQuery] = useState('');

  // Modals & Inspection States
  const [inspectedReport, setInspectedReport] = useState<UserReport | null>(null);
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [showAddEvidenceModal, setShowAddEvidenceModal] = useState(false);
  const [showAdminMessageModal, setShowAdminMessageModal] = useState(false);

  // Formulaire Sanction
  const [targetAthleteId, setTargetAthleteId] = useState<string>(athletes[0]?.id || '');
  const [sanctionType, setSanctionType] = useState<SanctionType>('WARNING');
  const [sanctionReason, setSanctionReason] = useState('');
  const [sanctionEvidenceId, setSanctionEvidenceId] = useState<string>(evidenceStore[0]?.id || '');

  // Formulaire Preuve
  const [newEvidenceTitle, setNewEvidenceTitle] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<ModerationEvidence['type']>('SCREENSHOT');
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');
  const [newEvidenceDesc, setNewEvidenceDesc] = useState('');

  // Formulaire Transmission Admin
  const [adminMsgTitle, setAdminMsgTitle] = useState('');
  const [adminMsgBody, setAdminMsgBody] = useState('');
  const [adminMsgAudience, setAdminMsgAudience] = useState<AdminTransmission['targetAudience']>('ALL_ATHLETES');
  const [adminMsgPriority, setAdminMsgPriority] = useState<AdminTransmission['priority']>('OFFICIAL');
  const [adminMsgTargetAthlete, setAdminMsgTargetAthlete] = useState('');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPIs
  const pendingReportsCount = reports.filter((r) => r.status === 'PENDING' || r.status === 'INVESTIGATING').length;
  const activeBansCount = sanctions.filter((s) => s.isActive && (s.sanctionType === 'PERMANENT_BAN' || s.sanctionType.includes('BAN'))).length;
  const warnedAthletesCount = sanctions.filter((s) => s.isActive && s.sanctionType === 'WARNING').length;

  // Actions Modération
  const handleResolveReport = (reportId: string, resolution: 'RESOLVED_WARNING' | 'RESOLVED_BAN' | 'DISMISSED') => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: resolution,
              updatedAt: 'Aujourd’hui à ' + new Date().toLocaleTimeString().slice(0, 5),
              adminNotes: `Dossier clôturé avec statut ${resolution} par l'administrateur.`,
            }
          : r
      )
    );
    if (inspectedReport?.id === reportId) {
      setInspectedReport(null);
    }
    showToast(`Signalement mis à jour : ${resolution}`);
  };

  const handleApplySanction = (e: React.FormEvent) => {
    e.preventDefault();
    const athlete = athletes.find((a) => a.id === targetAthleteId);
    if (!athlete) return;

    // Déterminer le compteur d'avertissements existant
    const existingSanctions = sanctions.filter((s) => s.athleteId === athlete.id && s.isActive);
    let nextWarningCount = 1;
    if (existingSanctions.length > 0) {
      nextWarningCount = Math.min(3, existingSanctions[existingSanctions.length - 1].warningsCount + 1);
    }

    // Auto-ban si 3ème avertissement
    let effectiveSanctionType = sanctionType;
    if (nextWarningCount >= 3 && sanctionType === 'WARNING') {
      effectiveSanctionType = 'PERMANENT_BAN';
    }

    const newSanctionItem: UserSanction = {
      id: `sanc_${Date.now()}`,
      athleteId: athlete.id,
      athleteUsername: athlete.username,
      athleteFullName: athlete.fullName,
      sanctionType: effectiveSanctionType,
      warningsCount: nextWarningCount,
      reason: sanctionReason || 'Manquement aux règles de respect et de fair-play de la communauté Osirion.',
      issuedBy: 'SuperAdmin Modération',
      issuedAt: 'Aujourd’hui à ' + new Date().toLocaleTimeString().slice(0, 5),
      isActive: true,
      evidenceIds: [sanctionEvidenceId],
      publicNotice: `Sanction ${effectiveSanctionType} appliquée avec niveau d'alerte ${nextWarningCount}/3.`,
    };

    setSanctions([newSanctionItem, ...sanctions]);

    // Mettre à jour l'utilisateur si banni
    if (effectiveSanctionType === 'PERMANENT_BAN' || effectiveSanctionType.includes('BAN')) {
      const updatedAthlete: AthleteUser = {
        ...athlete,
        status: 'SUSPENDED',
      };
      if (onUpdateAthlete) {
        onUpdateAthlete(updatedAthlete);
      }
    }

    // Notifier via Push si configuré
    if (onSendPushNotification) {
      onSendPushNotification(
        '⚠️ Injonction de Modération Osirion',
        `Une décision disciplinaire (${effectiveSanctionType}) a été prise concernant votre compte @${athlete.username}.`
      );
    }

    setShowSanctionModal(false);
    setSanctionReason('');
    showToast(`Sanction ${effectiveSanctionType} infligée à @${athlete.username} (${nextWarningCount}/3) !`);
  };

  const handleRevokeSanction = (sanctionId: string) => {
    const target = sanctions.find((s) => s.id === sanctionId);
    setSanctions((prev) =>
      prev.map((s) => (s.id === sanctionId ? { ...s, isActive: false } : s))
    );

    // Si c'était un ban, réactiver le compte
    if (target) {
      const athlete = athletes.find((a) => a.id === target.athleteId);
      if (athlete && athlete.status === 'SUSPENDED') {
        const reactivated: AthleteUser = {
          ...athlete,
          status: 'ACTIVE',
        };
        if (onUpdateAthlete) onUpdateAthlete(reactivated);
      }
    }

    showToast('Sanction levée et compte réhabilité avec succès !');
  };

  const handleCreateEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceTitle.trim()) return;

    const newEvidence: ModerationEvidence = {
      id: `ev_${Date.now()}`,
      title: newEvidenceTitle.trim(),
      type: newEvidenceType,
      url: newEvidenceUrl || 'https://storage.osirion.app/evidence/manual_upload.png',
      description: newEvidenceDesc || 'Preuve archivée par l\'administration.',
      capturedAt: 'Aujourd’hui à ' + new Date().toLocaleTimeString().slice(0, 5),
      fileSizeBytes: 124000,
      hashChecksum: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
    };

    setEvidenceStore([newEvidence, ...evidenceStore]);
    setShowAddEvidenceModal(false);
    setNewEvidenceTitle('');
    setNewEvidenceDesc('');
    setNewEvidenceUrl('');
    showToast('Pièce à conviction enregistrée dans le coffre-fort des preuves !');
  };

  const handleSendAdminTransmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMsgTitle.trim() || !adminMsgBody.trim()) return;

    const newTrans: AdminTransmission = {
      id: `trans_${Date.now()}`,
      title: adminMsgTitle.trim(),
      body: adminMsgBody.trim(),
      targetAudience: adminMsgAudience,
      targetAthleteUsername: adminMsgTargetAthlete || undefined,
      priority: adminMsgPriority,
      sentBy: 'SuperAdmin Modération',
      sentAt: 'Aujourd’hui à ' + new Date().toLocaleTimeString().slice(0, 5),
      recipientsCount: adminMsgAudience === 'ALL_ATHLETES' ? athletes.length : 1,
      readCount: 0,
    };

    setAdminTransmissions([newTrans, ...adminTransmissions]);

    // Push général
    if (onSendPushNotification) {
      onSendPushNotification(newTrans.title, newTrans.body);
    }

    setShowAdminMessageModal(false);
    setAdminMsgTitle('');
    setAdminMsgBody('');
    showToast('Transmission officielle diffusée dans Alpha Connect !');
  };

  return (
    <div className="space-y-6">
      {/* BANNIÈRE DE GARANTIE DE CONFIDENTIALITÉ (ZERO-KNOWLEDGE / CHIFFREMENT E2EE) */}
      <div className="bg-emerald-950/80 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-white text-sm font-semibold">
                Architecture Zéro-Écoute & Confidentialité E2EE
              </strong>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                RGPD & Cryptage Certifié
              </span>
            </div>
            <p className="text-emerald-300/80 text-[11px] mt-0.5">
              Conformément à la confidentialité stricte des communications : l'administration n'a aucun accès aux messages privés ni aux chats de clans.
              Seuls les <strong>signalements formels accompagnés de preuves matérielles</strong> transmis par les membres sont instruits ici.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('privacy_audit')}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-200 text-xs font-semibold transition"
        >
          Voir le Protocole de Confidentialité
        </button>
      </div>

      {/* 1. GRAND BANDEAU DE MODÉRATION & ALPHA CONNECT */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/80 rounded-3xl border border-slate-800 shadow-xl p-6 sm:p-8 text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>CHAMBRE DE MODÉRATION BASÉE SUR PREUVES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Signalements, Preuves & Sanctions</span>
              {pendingReportsCount > 0 && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-rose-600 text-white animate-pulse">
                  {pendingReportsCount} Dossier{pendingReportsCount > 1 ? 's' : ''} à traiter
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Examinez les signalements reçus des athlètes avec preuves à l'appui (captures, anomalies télémétriques ML Kit, clips Alpha Cam), décidez de l'attribution d'un avertissement (Warning 1/3) ou d'un bannissement, et diffusez des messages administratifs officiels.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Signalements Actifs</span>
              <span className={`text-xl font-black font-mono mt-0.5 block ${pendingReportsCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {pendingReportsCount}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Avertissements (Warnings)</span>
              <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
                {warnedAthletesCount}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Comptes Bannis</span>
              <span className="text-xl font-black text-rose-500 font-mono mt-0.5 block">
                {activeBansCount}
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-xs">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Preuves Reçues</span>
              <span className="text-xl font-black text-sky-400 font-mono mt-0.5 block">
                {evidenceStore.length}
              </span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        {userRole === 'superadmin' && (
          <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAdminMessageModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-950/30 transition transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer Message Admin Système</span>
              </button>
              <button
                onClick={() => setShowSanctionModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Lancer un Avertissement / Sanction</span>
              </button>
              <button
                onClick={() => setShowAddEvidenceModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
              >
                <FileCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Archiver une Preuve au Dossier</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. NAVIGATION PAR ONGLETS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeTab === 'reports'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Signalements avec Preuves ({reports.length})</span>
          {pendingReportsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('sanctions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeTab === 'sanctions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserX className="w-4 h-4 text-amber-500" />
          <span>Avertissements (Warnings 1/3) & Bannissements ({sanctions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeTab === 'evidence'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4 text-sky-400" />
          <span>Coffre-Fort des Preuves ({evidenceStore.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admin_transmissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeTab === 'admin_transmissions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4 text-blue-500" />
          <span>Messages Admins & Transmissions Système ({adminTransmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy_audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeTab === 'privacy_audit'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-500" />
          <span>Protocole de Confidentialité E2EE</span>
        </button>
      </div>

      {/* 3. ONGLET 1 : DOSSIERS DE SIGNALEMENTS AVEC PREUVES À L'APPUI */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="PENDING">En attente (Non traité)</option>
                  <option value="INVESTIGATING">Enquête en cours</option>
                  <option value="RESOLVED_WARNING">Résolu (Avertissement donné)</option>
                  <option value="RESOLVED_BAN">Résolu (Bannissement prononcé)</option>
                  <option value="DISMISSED">Classé sans suite</option>
                </select>

                <select
                  value={reportSeverityFilter}
                  onChange={(e) => setReportSeverityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                >
                  <option value="ALL">Toutes les gravités</option>
                  <option value="CRITICAL">Critique (Triche/Piratage télémétrique)</option>
                  <option value="HIGH">Élevée</option>
                  <option value="MEDIUM">Moyenne (Comportement anti-sportif)</option>
                  <option value="LOW">Faible (Spam)</option>
                </select>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par athlète ou motif..."
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            {/* Liste des signalements */}
            <div className="space-y-3">
              {reports
                .filter((r) => {
                  const matchStatus = reportStatusFilter === 'ALL' || r.status === reportStatusFilter;
                  const matchSeverity = reportSeverityFilter === 'ALL' || r.severity === reportSeverityFilter;
                  const q = (reportSearchQuery || '').toLowerCase();
                  const matchSearch =
                    (r.reportedUsername || '').toLowerCase().includes(q) ||
                    (r.reporterUsername || '').toLowerCase().includes(q) ||
                    (r.description || '').toLowerCase().includes(q);
                  return matchStatus && matchSeverity && matchSearch;
                })
                .map((report) => (
                  <div
                    key={report.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition space-y-3.5 ${
                      report.status === 'PENDING'
                        ? 'bg-rose-50/20 border-rose-200 ring-2 ring-rose-400/20'
                        : report.status === 'INVESTIGATING'
                        ? 'bg-amber-50/20 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-500">#{report.id}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{report.reasonLabel}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            report.severity === 'CRITICAL'
                              ? 'bg-rose-600 text-white'
                              : report.severity === 'HIGH'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Gravité {report.severity}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            report.status === 'PENDING'
                              ? 'bg-rose-100 text-rose-800'
                              : report.status === 'INVESTIGATING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">{report.createdAt}</span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600">
                        <span>
                          Athlète mis en cause : <strong className="text-rose-700 font-mono">@{report.reportedUsername}</strong> ({report.reportedFullName})
                        </span>
                        <span>
                          Signalé par : <strong className="text-slate-800 font-mono">@{report.reporterUsername}</strong>
                        </span>
                        <span>Contexte : <strong>{report.contextChannel}</strong></span>
                      </div>

                      <p className="text-slate-800 leading-relaxed font-sans pt-1">
                        « {report.description} »
                      </p>
                    </div>

                    {/* Preuves jointes au signalement */}
                    {report.evidenceList && report.evidenceList.length > 0 && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                        <span className="text-slate-500 block text-[11px] font-bold flex items-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-sky-600" />
                          <span>Preuves matérielles à l'appui fournies par l'athlète ({report.evidenceList.length}) :</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {report.evidenceList.map((ev) => (
                            <div
                              key={ev.id}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <span className="font-bold text-slate-900 text-xs block truncate">{ev.title}</span>
                                <p className="text-[11px] text-slate-500 line-clamp-1">{ev.description}</p>
                                <span className="text-[10px] text-slate-400 font-mono block">Horodatage : {ev.capturedAt}</span>
                              </div>
                              <a
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 p-1"
                              >
                                <span>Voir</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions de décision : Lancer un Avertissement, Bannir, ou Classer sans suite */}
                    {userRole === 'superadmin' && report.status !== 'RESOLVED_BAN' && report.status !== 'RESOLVED_WARNING' && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-400 italic">
                          Décision disciplinaire requise par l'administrateur :
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(report.id, 'DISMISSED')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                          >
                            Classer sans suite (Preuve insuffisante)
                          </button>
                          <button
                            onClick={() => {
                              setTargetAthleteId(report.reportedUserId);
                              setSanctionType('WARNING');
                              setSanctionReason(`Avertissement disciplinaire suite au signalement #${report.id} : ${report.reasonLabel}.`);
                              setSanctionEvidenceId(report.evidenceList[0]?.id || evidenceStore[0]?.id || '');
                              setShowSanctionModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition flex items-center gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Lancer un Avertissement (Warning 1/3)</span>
                          </button>
                          <button
                            onClick={() => {
                              setTargetAthleteId(report.reportedUserId);
                              setSanctionType('PERMANENT_BAN');
                              setSanctionReason(`Bannissement permanent prononcé suite aux preuves matérielles du dossier #${report.id}.`);
                              setSanctionEvidenceId(report.evidenceList[0]?.id || evidenceStore[0]?.id || '');
                              setShowSanctionModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1.5"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Bannir Définitivement</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ONGLET 2 : AVERTISSEMENTS & BANNISSEMENTS */}
      {activeTab === 'sanctions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserX className="w-4 h-4 text-amber-600" />
                  <span>Registre des Sanctions & Graduation des Avertissements</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Système de graduation : Avertissement 1/3 → 2/3 → Bannissement permanent automatique à 3/3
                </p>
              </div>

              <button
                onClick={() => setShowSanctionModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lancer un Avertissement</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {sanctions.map((sanc) => (
                <div key={sanc.id} className="py-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                        {sanc.warningsCount}/3
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{sanc.athleteFullName}</h4>
                          <span className="text-blue-600 font-mono text-xs">@{sanc.athleteUsername}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              sanc.sanctionType === 'PERMANENT_BAN'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {sanc.sanctionType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Prononcé par : <strong>{sanc.issuedBy}</strong> le {sanc.issuedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sanc.isActive ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          ACTIF
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          LEVÉE
                        </span>
                      )}

                      {userRole === 'superadmin' && sanc.isActive && (
                        <button
                          onClick={() => handleRevokeSanction(sanc.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 font-semibold text-xs transition"
                        >
                          Lever la sanction
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <span className="text-slate-500 font-semibold block">Motif de la décision :</span>
                    <p className="text-slate-800 font-sans">{sanc.reason}</p>
                    {sanc.publicNotice && (
                      <p className="text-[11px] text-amber-800 italic pt-1">
                        Notice : {sanc.publicNotice}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. ONGLET 3 : COFFRE-FORT DES PREUVES (EVIDENCE VAULT) */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-sky-600" />
                  <span>Coffre-Fort des Preuves Numériques Stockées</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Preuves vérifiables (captures d'écrans, clips vidéo, analyses IA) associées aux dossiers disciplinaires
                </p>
              </div>

              <button
                onClick={() => setShowAddEvidenceModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Déposer une Preuve</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {evidenceStore.map((ev) => (
                <div key={ev.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                        ev.type === 'AI_POSE_ANOMALY'
                          ? 'bg-rose-100 text-rose-800'
                          : ev.type === 'VIDEO_CLIP'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {ev.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{ev.capturedAt}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs">{ev.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>

                  <div className="bg-white p-2 rounded-xl border border-slate-200 text-[10px] font-mono text-slate-500 truncate">
                    <span>Empreinte : {ev.hashChecksum}</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-mono">
                      {Math.round((ev.fileSizeBytes || 0) / 1024)} Ko
                    </span>
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Examiner le fichier</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. ONGLET 4 : MESSAGES ADMINS & TRANSMISSIONS SYSTÈME */}
      {activeTab === 'admin_transmissions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  <span>Transmissions Officielles « Système Osirion »</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Diffusions directes envoyées dans l'application mobile des athlètes (sans écoute des chats privés)
                </p>
              </div>

              <button
                onClick={() => setShowAdminMessageModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle Transmission Admin</span>
              </button>
            </div>

            <div className="space-y-3">
              {adminTransmissions.map((trans) => (
                <div key={trans.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          trans.priority === 'DISCIPLINARY'
                            ? 'bg-rose-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {trans.priority}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{trans.title}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{trans.sentAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                    {trans.body}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-mono">
                    <span>Cible : <strong>{trans.targetAudience}</strong> {trans.targetAthleteUsername && `(@${trans.targetAthleteUsername})`}</span>
                    <span>Destinataires : {trans.recipientsCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. ONGLET 5 : PROTOCOLE DE CONFIDENTIALITÉ & ZERO-KNOWLEDGE AUDIT */}
      {activeTab === 'privacy_audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Charte de Confidentialité & Secret des Correspondances</h3>
                <p className="text-xs text-slate-500">Garanties techniques de protection de la vie privée des utilisateurs d'Osirion</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Aucun Accès aux Chats Privés</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Les conversations 1-to-1 entre athlètes sont chiffrées de bout en bout. Aucun administrateur ne peut lire, écouter ou surveiller les échanges privés en temps réel.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Salons de Clans Fermés</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Les salons d'entraînement des clans sont réservés exclusivement à leurs membres légitimes. Seul un membre du clan peut soumettre un signalement avec capture en cas d'infraction.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Modération Réactive sur Preuve</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  L'action disciplinaire s'enclenche uniquement lorsqu'un utilisateur dépose un signalement circonstancié avec une preuve matérielle enregistrée et vérifiée.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-700 space-y-1 font-mono">
              <div className="font-bold text-slate-900">Processus d'Arbitrage Éthique :</div>
              <div>1. Réception du signalement chiffré avec preuve uploadée par la victime ou le témoin</div>
              <div>2. Examen de l'authenticité de la preuve dans le Coffre-Fort numérique</div>
              <div>3. Délibération de l'administrateur : Classement sans suite ou Lancement d'un avertissement (Warning 1/3)</div>
              <div>4. Si récidive (3/3) ou triche informatique avérée : Bannissement immédiat du profil</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1 : SANCTIONNER / AVERTIR UN COMPTE */}
      {showSanctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Lancer une Sanction / Avertissement</h3>
              </div>
              <button onClick={() => setShowSanctionModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySanction} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Athlète visé :</label>
                <select
                  value={targetAthleteId}
                  onChange={(e) => setTargetAthleteId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} (@{a.username}) — Statut : {a.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Décision Disciplinaire :</label>
                <select
                  value={sanctionType}
                  onChange={(e) => setSanctionType(e.target.value as SanctionType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                >
                  <option value="WARNING">Avertissement Formel (Warning 1/3 ou 2/3)</option>
                  <option value="TEMPORARY_BAN_7D">Exclusion Temporaire de 7 Jours</option>
                  <option value="TEMPORARY_BAN_30D">Exclusion Temporaire de 30 Jours</option>
                  <option value="PERMANENT_BAN">Bannissement Définitif du Compte (Exclusion Panthéon)</option>
                  <option value="MUTE_CHAT">Révocation des Droits d'Émission dans Connect</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Preuve rattachée à la décision :</label>
                <select
                  value={sanctionEvidenceId}
                  onChange={(e) => setSanctionEvidenceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  {evidenceStore.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      [{ev.type}] {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Motif formel notifié à l'athlète :</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex : Non-respect des règles de fair-play constatée sur le clip vidéo soumis."
                  value={sanctionReason}
                  onChange={(e) => setSanctionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSanctionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  Confirmer la Décision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : AJOUTER UNE PREUVE */}
      {showAddEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-base text-slate-900">Déposer une Preuve au Dossier</h3>
              </div>
              <button onClick={() => setShowAddEvidenceModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvidence} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Intitulé de la Preuve :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Capture d'écran du message injurieux"
                  value={newEvidenceTitle}
                  onChange={(e) => setNewEvidenceTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type de Média :</label>
                  <select
                    value={newEvidenceType}
                    onChange={(e) => setNewEvidenceType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="SCREENSHOT">Capture d'Écran</option>
                    <option value="VIDEO_CLIP">Clip Vidéo Alpha Cam</option>
                    <option value="AUDIO_RECORDING">Enregistrement Vocal</option>
                    <option value="AI_POSE_ANOMALY">Anomalie IA ML Kit</option>
                    <option value="CHAT_LOG">Journal de Chat</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Lien / URL de Stockage :</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newEvidenceUrl}
                    onChange={(e) => setNewEvidenceUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description circonstanciée :</label>
                <textarea
                  rows={2}
                  placeholder="Contexte de la capture, heure, faits constatés..."
                  value={newEvidenceDesc}
                  onChange={(e) => setNewEvidenceDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEvidenceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Enregistrer dans le Coffre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : ENVOYER TRANSMISSION ADMIN */}
      {showAdminMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Diffuser un Message Admin Système</h3>
              </div>
              <button onClick={() => setShowAdminMessageModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAdminTransmission} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Titre de l'Annonce :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : 🛡️ Mise au point sur le fair-play"
                  value={adminMsgTitle}
                  onChange={(e) => setAdminMsgTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Audience Ciblée :</label>
                  <select
                    value={adminMsgAudience}
                    onChange={(e) => setAdminMsgAudience(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="ALL_ATHLETES">Tous les Athlètes (Diffusion Globale)</option>
                    <option value="CLAN_LEADERS">Chefs de Factions / Clans Uniquement</option>
                    <option value="WARNED_ATHLETES">Athlètes sous Avertissement</option>
                    <option value="SPECIFIC_ATHLETE">Un Athlète en Particulier</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Niveau d'Urgence :</label>
                  <select
                    value={adminMsgPriority}
                    onChange={(e) => setAdminMsgPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold"
                  >
                    <option value="OFFICIAL">Officielle (Information générale)</option>
                    <option value="URGENT">Urgente</option>
                    <option value="DISCIPLINARY">Disciplinaire (Mise en demeure)</option>
                  </select>
                </div>
              </div>

              {adminMsgAudience === 'SPECIFIC_ATHLETE' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pseudo de l'athlète destinataire :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: alex_bot_reps"
                    value={adminMsgTargetAthlete}
                    onChange={(e) => setAdminMsgTargetAthlete(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contenu du Message :</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Texte du message officiel qui apparaîtra dans le canal Système Osirion de l'application..."
                  value={adminMsgBody}
                  onChange={(e) => setAdminMsgBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdminMessageModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Envoyer la Transmission
                </button>
              </div>
            </form>
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
