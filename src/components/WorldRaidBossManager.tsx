import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Swords,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  Shield,
  Film,
  Eye,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  RefreshCw,
  Plus,
  Trash2,
  Tv,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Users,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  X,
  FileUp,
  Pause,
  Volume2
} from 'lucide-react';
import { db, storage } from '../lib/firebase';
import {
  ref as storageRef,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import { uploadFileDirect, compressImage, UploadProgressInfo } from '../lib/storageUploader';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';

export interface WorldRaidBossModel {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  avatarUrl?: string;
  currentHp: number;
  maxHp: number;
  exerciseType: string;
  exerciseTitle: string;
  durationSeconds: number;
  cinematicVideoUrl: string;
  cinematicThumbnailUrl?: string;
  rewardRelic: string;
  rewardAether: number;
  rewardXp: number;
  rewardTitle: string;
  status: 'active' | 'upcoming' | 'defeated';
  participantsCount: number;
  updatedAt?: any;
}

const DEFAULT_BOSSES: WorldRaidBossModel[] = [
  {
    id: 'golem_obsidienne',
    name: "Golem d'Obsidienne",
    subtitle: "Colosse Titanesque des Forges",
    description:
      "Sculpté dans les entrailles volcaniques du Mont Osirion, le Golem d'Obsidienne absorbe les coups pour nourrir sa matrice de lave. Seule une cadence effrénée de répétitions collectives peut fracturer sa carapace avant l'éruption.",
    avatarUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    currentHp: 742500,
    maxHp: 1000000,
    exerciseType: 'pushups',
    exerciseTitle: 'Pompes Explosives',
    durationSeconds: 60,
    // Vidéo cinématique par défaut haute qualité au format MP4 direct
    cinematicVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fire-and-sparks-flying-in-the-dark-40019-large.mp4',
    cinematicThumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    rewardRelic: "Cœur de Lave",
    rewardAether: 250,
    rewardXp: 500,
    rewardTitle: "Fléau d'Obsidienne",
    status: 'active',
    participantsCount: 142,
  },
  {
    id: 'hydre_glaciale',
    name: "Hydre du Blizzard",
    subtitle: "Gardienne Éternelle des Cimes",
    description:
      "Chaque tête de cette bête mythologique gèle le souffle des assaillants. Vos quadriceps et votre équilibre seront mis à rude épreuve pour esquiver ses souffles de givre.",
    avatarUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    currentHp: 1000000,
    maxHp: 1000000,
    exerciseType: 'squats',
    exerciseTitle: 'Squats Profonds',
    durationSeconds: 60,
    cinematicVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-frozen-landscape-covered-with-snow-4085-large.mp4',
    cinematicThumbnailUrl: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&auto=format&fit=crop&q=80',
    rewardRelic: "Écaille de Givre Éternel",
    rewardAether: 300,
    rewardXp: 600,
    rewardTitle: "Briseur de Glace",
    status: 'upcoming',
    participantsCount: 0,
  }
];

export const WorldRaidBossManager: React.FC = () => {
  const [bosses, setBosses] = useState<WorldRaidBossModel[]>([]);
  const [selectedBossId, setSelectedBossId] = useState<string>('golem_obsidienne');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [editForm, setEditForm] = useState<WorldRaidBossModel | null>(null);
  const [previewVideoPlaying, setPreviewVideoPlaying] = useState<boolean>(false);

  // Upload States pour Vidéo Cinématique et Avatar
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [videoUploadStatus, setVideoUploadStatus] = useState<string | null>(null);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [lastVideoFile, setLastVideoFile] = useState<File | null>(null);
  const uploadTaskRef = useRef<any>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState<boolean>(false);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState<number>(0);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  // Écoute temps-réel de Firestore sur la collection 'world_events'
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'world_events'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: WorldRaidBossModel[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as WorldRaidBossModel);
          });
          setBosses(list);
          // Si rien de sélectionné, on prend le premier
          if (!list.find((b) => b.id === selectedBossId)) {
            setSelectedBossId(list[0].id);
          }
        } else {
          // Aucun boss en base -> initialiser avec le boss par défaut
          initDefaultBosses();
        }
        setLoading(false);
      },
      (err) => {
        console.warn("Échec écoute Firestore world_events (mode dégradé):", err);
        setBosses(DEFAULT_BOSSES);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const initDefaultBosses = async () => {
    try {
      for (const b of DEFAULT_BOSSES) {
        await setDoc(doc(db, 'world_events', b.id), {
          ...b,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.error("Erreur init default bosses:", e);
      setBosses(DEFAULT_BOSSES);
    }
  };

  // Synchronisation du formulaire quand le boss sélectionné change (avec protection pendant l'upload)
  useEffect(() => {
    if (isUploadingVideo || isUploadingAvatar) return;
    const current = bosses.find((b) => b.id === selectedBossId);
    if (current) {
      setEditForm({ ...current });
    } else if (bosses.length > 0) {
      setSelectedBossId(bosses[0].id);
      setEditForm({ ...bosses[0] });
    }
  }, [selectedBossId, bosses, isUploadingVideo, isUploadingAvatar]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Synchronisation immédiate et atomique d'un champ vers Firestore
  const syncBossFieldToFirestore = async (patch: Partial<WorldRaidBossModel>) => {
    if (!editForm) return;
    try {
      const bossDocRef = doc(db, 'world_events', editForm.id);
      await updateDoc(bossDocRef, {
        ...patch,
        updatedAt: serverTimestamp(),
      });
      setEditForm((prev) => (prev ? { ...prev, ...patch } : null));
    } catch (e) {
      await setDoc(
        doc(db, 'world_events', editForm.id),
        {
          ...editForm,
          ...patch,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setEditForm((prev) => (prev ? { ...prev, ...patch } : null));
    }
  };

  const handleSave = async () => {
    if (!editForm) return;
    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'world_events', editForm.id),
        {
          ...editForm,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      showToast(`Titan "${editForm.name}" synchronisé avec l'application mobile !`, 'success');
    } catch (err: any) {
      console.error("Erreur sauvegarde boss:", err);
      showToast("Erreur lors de la sauvegarde: " + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetHp = async () => {
    if (!editForm) return;
    try {
      await updateDoc(doc(db, 'world_events', editForm.id), {
        currentHp: editForm.maxHp,
        updatedAt: serverTimestamp(),
      });
      setEditForm((prev) => (prev ? { ...prev, currentHp: prev.maxHp } : null));
      showToast(`PV de ${editForm.name} réinitialisés à 100% (${editForm.maxHp.toLocaleString()} PV)`);
    } catch (err: any) {
      showToast("Erreur réinitialisation PV: " + err.message, 'error');
    }
  };

  const handleTestDamage = async (dmg: number) => {
    if (!editForm) return;
    try {
      await updateDoc(doc(db, 'world_events', editForm.id), {
        currentHp: increment(-dmg),
        participantsCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      setEditForm((prev) =>
        prev
          ? {
              ...prev,
              currentHp: Math.max(0, prev.currentHp - dmg),
              participantsCount: prev.participantsCount + 1,
            }
          : null
      );
      showToast(`Frappe test de -${dmg} PV infligée en direct !`);
    } catch (err: any) {
      showToast("Erreur frappe test: " + err.message, 'error');
    }
  };

  const handleAddNewBoss = () => {
    const newId = `boss_${Date.now()}`;
    const newBoss: WorldRaidBossModel = {
      id: newId,
      name: "Nouveau Titan Cosmique",
      subtitle: "Seigneur du Néant",
      description: "Description de l'histoire, des mécaniques et de la menace du raid...",
      currentHp: 1000000,
      maxHp: 1000000,
      exerciseType: 'pushups',
      exerciseTitle: 'Pompes Explosives',
      durationSeconds: 60,
      cinematicVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fire-and-sparks-flying-in-the-dark-40019-large.mp4',
      rewardRelic: "Fragment Cosmique",
      rewardAether: 200,
      rewardXp: 450,
      rewardTitle: "Conquérant des Étoiles",
      status: 'upcoming',
      participantsCount: 0,
    };
    setSelectedBossId(newId);
    setEditForm(newBoss);
  };

  const handleDeleteBoss = async (id: string) => {
    if (!confirm(`Supprimer définitivement le boss "${id}" de la base ?`)) return;
    try {
      await deleteDoc(doc(db, 'world_events', id));
      showToast(`Boss ${id} supprimé.`);
    } catch (e: any) {
      showToast("Erreur suppression: " + e.message, 'error');
    }
  };

  const abortUploadRef = useRef<{ cancel?: () => void }>({});

  const cancelVideoUpload = () => {
    if (abortUploadRef.current.cancel) {
      abortUploadRef.current.cancel();
    }
    if (uploadTaskRef.current) {
      try {
        uploadTaskRef.current.cancel();
      } catch (e) {
        console.warn("Erreur annulation tâche:", e);
      }
      uploadTaskRef.current = null;
    }
    setIsUploadingVideo(false);
    setVideoUploadStatus(null);
    setVideoUploadProgress(0);
    showToast("Téléversement annulé par l'utilisateur", "error");
  };

  const handleVideoFile = async (file: File) => {
    if (!editForm) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      showToast("Veuillez sélectionner un fichier vidéo valide (MP4, WebM, MOV)", "error");
      return;
    }

    setLastVideoFile(file);
    setVideoUploadError(null);
    setIsUploadingVideo(true);
    setVideoUploadProgress(1);
    setPreviewVideoPlaying(false);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setVideoUploadStatus(`Connexion directe ultra-rapide à Firebase Storage (${sizeMb} Mo)...`);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `raids/cinematics/${editForm.id}_${Date.now()}_${cleanName}`;

      // Mode 1 : Transfert direct haute performance (Single-Stream REST via XHR)
      const downloadUrl = await uploadFileDirect(
        storagePath,
        file,
        (info: UploadProgressInfo) => {
          setVideoUploadProgress(info.progress);
          setVideoUploadStatus(
            `Téléversement : ${info.transferredMb} Mo / ${info.totalMb} Mo (${info.progress}%) • ${info.speedMbPerSec} Mo/s`
          );
        },
        abortUploadRef.current
      );

      setVideoUploadStatus("Finalisation de l'enregistrement dans Firestore...");
      setVideoUploadProgress(100);
      await syncBossFieldToFirestore({ cinematicVideoUrl: downloadUrl });
      setEditForm((prev) => (prev ? { ...prev, cinematicVideoUrl: downloadUrl } : null));
      showToast(`🎉 Vidéo « ${file.name} » enregistrée avec succès dans Firestore !`, 'success');
      setIsUploadingVideo(false);
      setVideoUploadStatus(null);
      setVideoUploadError(null);
    } catch (err: any) {
      console.warn("Échec du flux direct, bascule en mode de secours résumable :", err);
      // Mode 2 : Fallback sur le SDK standard si XHR a été bloqué par un pare-feu
      try {
        setVideoUploadStatus("Bascule en transfert de secours...");
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileRef = storageRef(storage, `raids/cinematics/${editForm.id}_${Date.now()}_${cleanName}`);
        const metadata = { contentType: file.type || 'video/mp4' };

        await uploadBytes(fileRef, file, metadata);
        const downloadUrl = await getDownloadURL(fileRef);
        setVideoUploadProgress(100);
        await syncBossFieldToFirestore({ cinematicVideoUrl: downloadUrl });
        setEditForm((prev) => (prev ? { ...prev, cinematicVideoUrl: downloadUrl } : null));
        showToast(`🎉 Vidéo « ${file.name} » enregistrée dans Firestore (mode de secours) !`, 'success');
        setIsUploadingVideo(false);
        setVideoUploadStatus(null);
        setVideoUploadError(null);
      } catch (fallbackErr: any) {
        console.error("Échec total upload vidéo:", fallbackErr);
        const msg = fallbackErr?.message || err?.message || 'Erreur inconnue';
        setVideoUploadError(
          `Échec du téléversement (${msg}). Vous pouvez également coller directement l'URL de votre vidéo ci-dessous.`
        );
        setIsUploadingVideo(false);
        setVideoUploadStatus(null);
      }
    }
  };

  const handleAvatarFile = async (file: File) => {
    if (!editForm) return;
    if (!file.type.startsWith('image/')) {
      showToast("Veuillez sélectionner un fichier image valide (PNG, JPG, WebP)", "error");
      return;
    }
    try {
      setIsUploadingAvatar(true);
      setAvatarUploadProgress(15);

      // Optimisation & compression instantanée client-side (réduit les photos à ~150-250 Ko)
      const optimizedFile = await compressImage(file, 1024, 1024, 0.88);
      setAvatarUploadProgress(40);

      const cleanName = optimizedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `raids/avatars/${editForm.id}_${Date.now()}_${cleanName}`;

      const downloadUrl = await uploadFileDirect(storagePath, optimizedFile, (info) => {
        setAvatarUploadProgress(Math.max(40, info.progress));
      });

      setAvatarUploadProgress(100);
      await syncBossFieldToFirestore({ avatarUrl: downloadUrl });
      showToast(`🎉 Avatar du Titan sauvegardé avec succès !`, 'success');
    } catch (err: any) {
      console.error("Erreur avatar:", err);
      showToast("Erreur lors de l'envoi de l'avatar: " + err.message, "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const activeBoss = bosses.find((b) => b.id === selectedBossId) || editForm;
  const hpPercent = editForm
    ? Math.max(0, Math.min(100, Math.round((editForm.currentHp / editForm.maxHp) * 100)))
    : 0;

  return (
    <div className="space-y-6 text-white pb-16">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-900/30'
              : 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-900/30'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/50 via-slate-900/80 to-amber-950/40 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 animate-pulse text-red-400" />
              Instance Mondiale • Raid Boss & Cinématiques
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Gestionnaire du Raid Mondial
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervisez les Titans mondiaux d'Osirion. Configurez la cinématique obligatoire pour la 1ère incursion (avec option de skip dès la 2ème fois), synchronisez les PV mondiaux en temps réel et paramétrez les récompenses divines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddNewBoss}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-600/20 hover:bg-red-600/30 text-red-200 text-sm font-bold transition-all shadow-lg shadow-red-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouveau Boss
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !editForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-sm font-extrabold transition-all shadow-xl shadow-red-900/40 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Publier sur l'App
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Boss Tabs + Boss Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Boss List & Quick Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Boss enregistrés ({bosses.length})
              </span>
              <button
                onClick={initDefaultBosses}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
                title="Rétablir les boss par défaut"
              >
                <RotateCcw className="w-3 h-3" />
                Rétablir
              </button>
            </div>

            <div className="space-y-2.5">
              {bosses.map((boss) => {
                const isSelected = boss.id === selectedBossId;
                const percent = Math.round((boss.currentHp / boss.maxHp) * 100);

                return (
                  <div
                    key={boss.id}
                    onClick={() => setSelectedBossId(boss.id)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-red-500/60 bg-gradient-to-r from-red-950/40 to-slate-900 shadow-lg shadow-red-950/20'
                        : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-500/30 flex items-center justify-center text-xl shrink-0">
                          👹
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            {boss.name}
                            {boss.status === 'active' && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1">{boss.subtitle}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                          boss.status === 'active'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                            : boss.status === 'upcoming'
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                            : 'bg-slate-500/10 border-slate-500/40 text-slate-400'
                        }`}
                      >
                        {boss.status === 'active' ? 'Actif' : boss.status === 'upcoming' ? 'À venir' : 'Vaincu'}
                      </span>
                    </div>

                    {/* Mini HP bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>PV Restants</span>
                        <span className="font-mono font-bold text-red-400">
                          {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()} ({percent}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Panel: Telemetry & Live Attack Test */}
          {editForm && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Swords className="w-3.5 h-3.5 text-red-400" />
                Actions d'Administration Directe
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleResetHp}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  Rétablir 100% PV
                </button>
                <button
                  type="button"
                  onClick={() => handleTestDamage(1000)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 bg-red-950/40 hover:bg-red-900/40 text-xs font-bold text-red-300 transition-all cursor-pointer"
                >
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  -1 000 PV (Test)
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Participants engagés :</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-red-400" />
                    {editForm.participantsCount} athlètes
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Durée d'assaut / round :</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {editForm.durationSeconds}s
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Exercice requis :</span>
                  <span className="font-bold text-slate-200">{editForm.exerciseTitle}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Full Boss Editor & Video Cinematic Controls */}
        <div className="lg:col-span-8 space-y-6">
          {editForm ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 space-y-6">
              {/* Section 1 : Identité & Lore */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-400" />
                    Identité & Lore du Titan
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Statut :</label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value as any })
                      }
                      className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-white font-semibold cursor-pointer"
                    >
                      <option value="active">🟢 ACTIF (Visible & Jouable)</option>
                      <option value="upcoming">🟡 À VENIR (En préparation)</option>
                      <option value="defeated">🔴 VAINCU (Verrouillé)</option>
                    </select>
                  </div>
                </div>

                {/* Avatar du Boss & Téléversement */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-red-500/50 bg-slate-900 shrink-0 shadow-lg">
                    <img
                      src={editForm.avatarUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300'}
                      alt={editForm.name}
                      className="w-full h-full object-cover"
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-xs font-bold text-amber-400">
                        <Loader2 className="w-5 h-5 animate-spin mb-1" />
                        <span>{avatarUploadProgress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 block">Portrait / Avatar du Titan</span>
                      <span className="text-[10px] text-slate-400">Firebase Storage</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={avatarFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarFile(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        {isUploadingAvatar ? 'Téléversement...' : 'Téléverser image'}
                      </button>
                      <input
                        type="url"
                        value={editForm.avatarUrl || ''}
                        onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                        className="flex-1 min-w-[200px] bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-red-500 font-mono"
                        placeholder="https://.../avatar.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Nom du Boss
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                      placeholder="Ex: Golem d'Obsidienne"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Sous-titre / Épithète
                    </label>
                    <input
                      type="text"
                      value={editForm.subtitle}
                      onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                      placeholder="Ex: Colosse Titanesque des Forges"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Description & Histoire du Raid (Affichée dans le Briefing d'avant-combat)
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none resize-none"
                    placeholder="Racontez la légende du Boss et les consignes pour la communauté..."
                  />
                </div>
              </div>

              {/* Section 2 : Barre de Vie (PV) & Compte à Rebours */}
              <div className="space-y-4 border-t border-slate-800 pt-5">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Points de Vie (PV) & Chronomètre de Combat
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      PV Actuels
                    </label>
                    <input
                      type="number"
                      value={editForm.currentHp}
                      onChange={(e) =>
                        setEditForm({ ...editForm, currentHp: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      PV Maximums
                    </label>
                    <input
                      type="number"
                      value={editForm.maxHp}
                      onChange={(e) =>
                        setEditForm({ ...editForm, maxHp: parseInt(e.target.value) || 1000000 })
                      }
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Durée du Round (secondes)
                    </label>
                    <input
                      type="number"
                      value={editForm.durationSeconds}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          durationSeconds: parseInt(e.target.value) || 60,
                        })
                      }
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Preview Bar */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Jauge de Vie Mondiale :</span>
                    <span className="font-mono font-bold text-red-400">
                      {editForm.currentHp.toLocaleString()} / {editForm.maxHp.toLocaleString()} PV ({hpPercent}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 transition-all duration-300"
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3 : Vidéo & Cinématique (Obligatoire 1ère fois / Skip possible ensuite) */}
              <div className="space-y-4 border-t border-slate-800 pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    Cinématique d'Ouverture du Raid
                  </h3>
                  <span className="text-[11px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                    🎬 Règles de Skip Automatiques
                  </span>
                </div>

                {/* Explicative Banner for Skip vs First Time */}
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 leading-relaxed flex items-start gap-3">
                  <div className="p-1 rounded-md bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-purple-100">Logique d'affichage sur l'application :</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-purple-300/90">
                      <li><strong>1ère participation :</strong> L'athlète est <u>obligé de visionner l'intégralité</u> de cette cinématique pour s'imprégner de l'univers (aucun bouton skip).</li>
                      <li><strong>Participations suivantes :</strong> Un bouton <u>« PASSER LA CINÉMATIQUE ⏩ »</u> apparaît dès le début pour lancer le briefing immédiatement.</li>
                    </ul>
                  </div>
                </div>

                {/* ZONE DE TÉLÉVERSEMENT VIDÉO FIREBASE STORAGE (DRAG & DROP) */}
                <input
                  type="file"
                  ref={videoFileInputRef}
                  accept="video/mp4,video/webm,video/quicktime,video/mov"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoFile(file);
                  }}
                />

                {/* CARTE D'ERREUR PERSISTANTE EN CAS D'ÉCHEC DU TÉLÉVERSEMENT */}
                {videoUploadError && (
                  <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/60 text-xs text-red-200 space-y-3 shadow-lg">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="font-extrabold text-sm text-red-100 flex items-center justify-between">
                          <span>Téléversement interrompu</span>
                          <button
                            type="button"
                            onClick={() => setVideoUploadError(null)}
                            className="text-red-400 hover:text-white text-xs p-1"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-red-300 leading-relaxed font-mono text-[11px]">
                          {videoUploadError}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-500/30">
                      {lastVideoFile && (
                        <button
                          type="button"
                          onClick={() => handleVideoFile(lastVideoFile)}
                          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Réessayer « {lastVideoFile.name} »
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        Choisir un autre fichier
                      </button>
                    </div>
                  </div>
                )}

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingVideo(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDraggingVideo(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingVideo(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleVideoFile(file);
                  }}
                  className={`relative rounded-2xl border-2 border-dashed p-6 transition-all text-center flex flex-col items-center justify-center gap-3 cursor-pointer ${
                    isDraggingVideo
                      ? 'border-purple-400 bg-purple-950/40 ring-4 ring-purple-500/20 scale-[1.01]'
                      : 'border-purple-500/40 bg-purple-950/10 hover:bg-purple-950/25 hover:border-purple-400/80'
                  }`}
                  onClick={() => !isUploadingVideo && videoFileInputRef.current?.click()}
                >
                  {isUploadingVideo ? (
                    <div className="w-full max-w-md space-y-3 py-3">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                          <span>{videoUploadStatus || 'Téléversement en cours...'}</span>
                        </span>
                        <span className="font-mono text-purple-300 text-sm">{videoUploadProgress}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-900 border border-purple-500/40 overflow-hidden p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-400 transition-all duration-300"
                          style={{ width: `${videoUploadProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Flux continu vers Firebase Storage...</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelVideoUpload();
                          }}
                          className="text-red-400 hover:text-red-300 underline font-semibold"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-950/40">
                        <FileVideo className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white">
                          Téléverser la vidéo cinématique (MP4)
                        </h4>
                        <p className="text-xs text-slate-300">
                          Glissez-déposez votre vidéo ici, ou <span className="text-purple-400 underline font-semibold">cliquez pour choisir un fichier</span>
                        </p>
                        <span className="text-[11px] text-slate-400 block pt-1">
                          Formats supportés : MP4, WebM, MOV • Stockage direct sur Firebase Storage
                        </span>
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 flex items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          videoFileInputRef.current?.click();
                        }}
                      >
                        <FileUp className="w-4 h-4" />
                        Choisir une vidéo depuis l'ordinateur
                      </button>
                    </>
                  )}
                </div>

                {/* ÉTAT ACTUEL DE LA VIDÉO ET LECTEUR */}
                {editForm.cinematicVideoUrl && (
                  <div className="rounded-xl border border-purple-500/40 bg-slate-950/80 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-200 truncate">
                          Vidéo active : <span className="font-mono text-purple-300 font-normal">{editForm.cinematicVideoUrl.split('?')[0].split('/').pop()}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewVideoPlaying(!previewVideoPlaying)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          {previewVideoPlaying ? 'Masquer Lecteur' : 'Lire la Vidéo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, cinematicVideoUrl: '' })}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Effacer la vidéo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* LECTEUR VIDÉO INTÉGRÉ DIRECT */}
                    {previewVideoPlaying && (
                      <div className="rounded-xl overflow-hidden border-2 border-purple-500/60 bg-black aspect-video max-w-lg mx-auto shadow-2xl shadow-purple-950/60">
                        <video
                          key={editForm.cinematicVideoUrl}
                          src={editForm.cinematicVideoUrl}
                          controls
                          autoPlay
                          loop
                          className="w-full h-full object-cover"
                        >
                          Votre navigateur ne supporte pas la balise vidéo.
                        </video>
                      </div>
                    )}
                  </div>
                )}

                {/* OPTIONS AVANCÉES (URL MANUELLE & PRESETS) */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Options secondaires : Saisir manuellement une URL ou choisir un preset
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editForm.cinematicVideoUrl}
                      onChange={(e) =>
                        setEditForm({ ...editForm, cinematicVideoUrl: e.target.value })
                      }
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none font-mono"
                      placeholder="https://firebasestorage.googleapis.com/... ou URL MP4 externe"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!editForm.cinematicVideoUrl.trim()) {
                          showToast("Veuillez saisir une URL vidéo", "error");
                          return;
                        }
                        await syncBossFieldToFirestore({ cinematicVideoUrl: editForm.cinematicVideoUrl.trim() });
                        setPreviewVideoPlaying(true);
                        showToast("URL cinématique sauvegardée dans Firestore & active sur l'app !", "success");
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-300" />
                      Appliquer & Sauvegarder
                    </button>
                  </div>

                  {/* Preset Quick Selectors */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400">Modèles cinématiques rapides :</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const url = 'https://assets.mixkit.co/videos/preview/mixkit-fire-and-sparks-flying-in-the-dark-40019-large.mp4';
                        await syncBossFieldToFirestore({ cinematicVideoUrl: url });
                        setPreviewVideoPlaying(true);
                        showToast("Modèle « Flammes & Forges » appliqué et sauvegardé dans Firestore !", "success");
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-1"
                    >
                      🔥 Flammes & Forges
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const url = 'https://assets.mixkit.co/videos/preview/mixkit-frozen-landscape-covered-with-snow-4085-large.mp4';
                        await syncBossFieldToFirestore({ cinematicVideoUrl: url });
                        setPreviewVideoPlaying(true);
                        showToast("Modèle « Blizzard Arctique » appliqué et sauvegardé dans Firestore !", "success");
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-1"
                    >
                      ❄️ Blizzard Arctique
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const url = 'https://assets.mixkit.co/videos/preview/mixkit-dramatic-dark-clouds-in-the-sky-40026-large.mp4';
                        await syncBossFieldToFirestore({ cinematicVideoUrl: url });
                        setPreviewVideoPlaying(true);
                        showToast("Modèle « Orage & Tempête » appliqué et sauvegardé dans Firestore !", "success");
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-1"
                    >
                      ⚡ Orage & Tempête
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 4 : Exercice Biologique & Dojo ML Kit */}
              <div className="space-y-4 border-t border-slate-800 pt-5">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Swords className="w-4 h-4 text-emerald-400" />
                  Exercice Ciblé & Détection Caméra IA
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Type d'exercice (Moteur Biologique)
                    </label>
                    <select
                      value={editForm.exerciseType}
                      onChange={(e) => {
                        const val = e.target.value;
                        let title = 'Pompes Explosives';
                        if (val === 'squats') title = 'Squats Profonds';
                        if (val === 'situps') title = 'Abdominaux Sol';
                        if (val === 'pullups') title = 'Tractions Pronation';
                        if (val === 'burpees') title = 'Burpees Militaires';
                        setEditForm({ ...editForm, exerciseType: val, exerciseTitle: title });
                      }}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="pushups">Pompes (PushupCounter Dojo)</option>
                      <option value="squats">Squats (SquatCounter Dojo)</option>
                      <option value="situps">Abdominaux / Situps</option>
                      <option value="pullups">Tractions (PullupCounter)</option>
                      <option value="burpees">Burpees (Full Body)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Titre Affiché sur Mobile
                    </label>
                    <input
                      type="text"
                      value={editForm.exerciseTitle}
                      onChange={(e) =>
                        setEditForm({ ...editForm, exerciseTitle: e.target.value })
                      }
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5 : Récompenses Divines */}
              <div className="space-y-4 border-t border-slate-800 pt-5">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Récompenses de Victoire & Butin
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Relique Garantie
                    </label>
                    <input
                      type="text"
                      value={editForm.rewardRelic}
                      onChange={(e) => setEditForm({ ...editForm, rewardRelic: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      placeholder="Ex: Cœur de Lave"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Cristaux d'Aether 💎
                    </label>
                    <input
                      type="number"
                      value={editForm.rewardAether}
                      onChange={(e) =>
                        setEditForm({ ...editForm, rewardAether: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Points d'Expérience (XP)
                    </label>
                    <input
                      type="number"
                      value={editForm.rewardXp}
                      onChange={(e) =>
                        setEditForm({ ...editForm, rewardXp: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Titre Débloqué
                    </label>
                    <input
                      type="text"
                      value={editForm.rewardTitle}
                      onChange={(e) => setEditForm({ ...editForm, rewardTitle: e.target.value })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      placeholder="Ex: Fléau d'Obsidienne"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => handleDeleteBoss(editForm.id)}
                  className="px-4 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer ce Boss
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-sm font-extrabold transition-all shadow-lg shadow-red-950/40 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Enregistrer les Modifications
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
              Sélectionnez un boss à gauche pour modifier ses paramètres.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
