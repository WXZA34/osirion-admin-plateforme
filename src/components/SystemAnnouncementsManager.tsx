import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Edit3,
  Trash2,
  Pin,
  PinOff,
  Rocket,
  Wrench,
  Trophy,
  Info,
  Clock,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
  X,
  AlertTriangle,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

export interface SystemAnnouncementSection {
  id: string;
  emoji: string;
  title: string;
  content: string;
}

export interface SystemAnnouncementItem {
  id: string;
  title: string;
  version?: string;
  category: 'UPDATE' | 'OFFICIAL' | 'EVENT' | 'MAINTENANCE';
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  isPinned?: boolean;
  intro: string;
  sections: SystemAnnouncementSection[];
  text: string;
  imageUrl?: string;
  timestamp: any;
  author?: string;
}

const EMOJI_OPTIONS = ['⚔️', '🔥', '✨', '💬', '📸', '🎥', '🚀', '🏆', '🛠️', '🛡️', '💎', '⚡', '🎯', '👑', '📜', '📱', '⚙️', '💪'];

export const SystemAnnouncementsManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<SystemAnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal d'édition / création
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formVersion, setFormVersion] = useState('');
  const [formCategory, setFormCategory] = useState<'UPDATE' | 'OFFICIAL' | 'EVENT' | 'MAINTENANCE'>('UPDATE');
  const [formPriority, setFormPriority] = useState<'NORMAL' | 'IMPORTANT' | 'URGENT'>('NORMAL');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIntro, setFormIntro] = useState('');
  const [formSections, setFormSections] = useState<SystemAnnouncementSection[]>([]);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Écoute temps réel de la collection Firestore 'system_announcements'
  useEffect(() => {
    const q = query(collection(db, 'system_announcements'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: SystemAnnouncementItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const rawText = (data.text || data['mise a jour'] || '').toString();

          // Support des champs structurés ou smart parsing de l'ancien format texte
          let sections: SystemAnnouncementSection[] = [];
          if (Array.isArray(data.sections) && data.sections.length > 0) {
            sections = data.sections;
          } else if (rawText) {
            // Parsing intelligent des sections si texte brut ancien
            const emojiRegex = /([\u{2694}\u{1F525}\u{2728}\u{1F4AC}\u{1F4F8}\u{1F3A5}\u{1F6E0}\u{1F680}\u{1F3C6}\u{1F48E}\u{26A1}\u{1F3AF}\u{1F451}\u{1F6E1}\u{1F4F1}\u{2699}\u{1F4CA}\u{1F514}])/u;
            const parts = rawText.split(emojiRegex);
            for (let i = 1; i < parts.length; i += 2) {
              const emoji = parts[i];
              const block = (parts[i + 1] || '').trim();
              if (block) {
                const paren = block.indexOf(')');
                const dot = block.indexOf('.');
                let sTitle = 'Nouveauté';
                let sContent = block;
                if (paren !== -1 && paren < 60) {
                  sTitle = block.substring(0, paren + 1).trim();
                  sContent = block.substring(paren + 1).trim();
                } else if (dot !== -1 && dot < 50) {
                  sTitle = block.substring(0, dot).trim();
                  sContent = block.substring(dot + 1).trim();
                }
                sections.push({
                  id: `sec_${i}`,
                  emoji,
                  title: sTitle,
                  content: sContent,
                });
              }
            }
          }

          // Détection version
          let version = data.version;
          if (!version) {
            const vMatch = rawText.match(/v\d+(\.\d+)*/i);
            if (vMatch) version = vMatch[0];
          }

          let category = data.category || 'OFFICIAL';
          if (!data.category && rawText.toLowerCase().includes('mise à jour')) {
            category = 'UPDATE';
          }

          return {
            id: docSnap.id,
            title: data.title || (version ? `Mise à jour Alpha ${version}` : 'Transmission Système'),
            version: version || undefined,
            category: category,
            priority: data.priority || 'NORMAL',
            isPinned: !!data.isPinned,
            intro: data.intro || (sections.length > 0 ? rawText.split(sections[0].emoji)[0].trim() : rawText),
            sections: sections,
            text: rawText,
            imageUrl: data.imageUrl || undefined,
            timestamp: data.timestamp || new Date(),
            author: data.author || 'Système Osirion',
          };
        });

        // Tri : Épinglés en premier, puis date décroissante
        items.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const aTime = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.timestamp).getTime() || 0;
          const bTime = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.timestamp).getTime() || 0;
          return bTime - aTime;
        });

        setAnnouncements(items);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching system announcements:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Formatage de date lisible
  const formatDate = (val: any) => {
    if (!val) return 'Récemment';
    let d: Date;
    if (val.seconds) d = new Date(val.seconds * 1000);
    else if (val instanceof Date) d = val;
    else d = new Date(val);

    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Actions
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormTitle('Mise à jour : ');
    setFormVersion('v2.5.0');
    setFormCategory('UPDATE');
    setFormPriority('NORMAL');
    setFormIsPinned(false);
    setFormImageUrl('');
    setFormIntro("Guerriers et Guerrières d'Osirion, une nouvelle version du Sanctuaire est disponible ! Voici les nouveautés :");
    setFormSections([
      {
        id: `sec_${Date.now()}_1`,
        emoji: '⚔️',
        title: "L'Arène & Les Territoires",
        content: 'Expéditions GPS actives : marchez vers vos objectifs physiques pour réclamer vos récompenses.\nCapture de bastions et envoi de rapports stratégiques.',
      },
      {
        id: `sec_${Date.now()}_2`,
        emoji: '🔥',
        title: "La Forge & L'Arsenal",
        content: "Nouveaux titres prestigieux ajoutés chez le Forgeron.\nOptimisation des halos et animations dynamiques.",
      },
    ]);
    setPreviewTab('edit');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: SystemAnnouncementItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormVersion(item.version || '');
    setFormCategory(item.category);
    setFormPriority(item.priority);
    setFormIsPinned(!!item.isPinned);
    setFormImageUrl(item.imageUrl || '');
    setFormIntro(item.intro);
    setFormSections(item.sections || []);
    setPreviewTab('edit');
    setIsModalOpen(true);
  };

  const handleAddSection = () => {
    setFormSections([
      ...formSections,
      {
        id: `sec_${Date.now()}`,
        emoji: '✨',
        title: 'Nouvelle Fonctionnalité',
        content: 'Décrivez les nouveautés ou améliorations apportées.',
      },
    ]);
  };

  const handleRemoveSection = (secId: string) => {
    setFormSections(formSections.filter((s) => s.id !== secId));
  };

  const handleUpdateSection = (secId: string, field: keyof SystemAnnouncementSection, val: string) => {
    setFormSections(
      formSections.map((s) => (s.id === secId ? { ...s, [field]: val } : s))
    );
  };

  // Templates rapides
  const handleApplyTemplate = (type: 'UPDATE' | 'MAINTENANCE' | 'EVENT') => {
    if (type === 'UPDATE') {
      setFormCategory('UPDATE');
      setFormTitle('Mise à Jour v2.5.0 : Déploiement Majeur');
      setFormVersion('v2.5.0');
      setFormIntro("Guerriers d'Osirion, le Sanctuaire évolue ! Cette version apporte de nouvelles fonctionnalités majeures :");
      setFormSections([
        { id: `sec_${Date.now()}_1`, emoji: '🚀', title: 'Nouvelles Fonctionnalités', content: 'Détails des ajouts dans l\'application.' },
        { id: `sec_${Date.now()}_2`, emoji: '✨', title: 'Améliorations Visuelles & Confort', content: 'Design plus épuré, navigation fluide et fluidité accrue.' },
        { id: `sec_${Date.now()}_3`, emoji: '🛠️', title: 'Optimisations & Correctifs', content: 'Correction des anomalies de saisie et stabilité du réseau.' }
      ]);
    } else if (type === 'MAINTENANCE') {
      setFormCategory('MAINTENANCE');
      setFormPriority('IMPORTANT');
      setFormTitle('Maintenance Programmée des Serveurs');
      setFormVersion('');
      setFormIntro("Une opération de maintenance technique aura lieu afin d'optimiser l'infrastructure du Sanctuaire.");
      setFormSections([
        { id: `sec_${Date.now()}_1`, emoji: '⏰', title: 'Créneau Prévu', content: 'Durée estimée : 30 minutes.\nAccès restreint pendant le déploiement.' },
        { id: `sec_${Date.now()}_2`, emoji: '🛡️', title: 'Sauvegarde des Données', content: 'Vos progrès, Aether et quêtes sont entièrement sécurisés.' }
      ]);
    } else if (type === 'EVENT') {
      setFormCategory('EVENT');
      setFormTitle('Tournoi Spécial : L\'Ascension des Clans');
      setFormVersion('Saison 2');
      setFormIntro("L'heure de la gloire a sonné ! Relevez le défi hebdomadaire et hissez votre Clan au sommet du Panthéon.");
      setFormSections([
        { id: `sec_${Date.now()}_1`, emoji: '🏆', title: 'Objectif du Défi', content: 'Cumuler un maximum d\'XP en équipe et valider vos Colosseum Runs.' },
        { id: `sec_${Date.now()}_2`, emoji: '💎', title: 'Récompenses Exclusives', content: 'Titres épiques et bonus d\'Aether pour les trois meilleurs clans.' }
      ]);
    }
  };

  // Sauvegarde dans Firestore
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    // Construction du texte agrégé pour rétrocompatibilité
    let aggregatedText = formIntro.trim() + '\n\n';
    formSections.forEach((sec) => {
      aggregatedText += `${sec.emoji} ${sec.title.toUpperCase()}\n${sec.content}\n\n`;
    });
    aggregatedText = aggregatedText.trim();

    const targetDocId = editingId || `sys_${Date.now()}`;
    const payload: any = {
      title: formTitle.trim(),
      version: formVersion.trim() || null,
      category: formCategory,
      priority: formPriority,
      isPinned: formIsPinned,
      intro: formIntro.trim(),
      sections: formSections,
      text: aggregatedText,
      imageUrl: formImageUrl.trim() || null,
      author: 'Système Osirion (Administration)',
      updatedAt: serverTimestamp(),
    };

    if (!editingId) {
      payload.timestamp = serverTimestamp();
    }

    try {
      await setDoc(doc(db, 'system_announcements', targetDocId), payload, { merge: true });
      setIsModalOpen(false);
      showToast(editingId ? 'Annonce mise à jour avec succès !' : 'Nouvelle annonce diffusée avec succès !');
    } catch (err: any) {
      console.error('Erreur sauvegarde announcement:', err);
      showToast("Erreur lors de l'enregistrement : " + err.message);
    }
  };

  // Toggle Épinglage
  const handleTogglePin = async (item: SystemAnnouncementItem) => {
    try {
      await setDoc(
        doc(db, 'system_announcements', item.id),
        { isPinned: !item.isPinned },
        { merge: true }
      );
      showToast(item.isPinned ? 'Annonce détachée' : 'Annonce épinglée en tête');
    } catch (err) {
      console.error(err);
    }
  };

  // Suppression
  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette annonce ? Elle disparaîtra de l'application mobile.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'system_announcements', id));
      showToast('Annonce supprimée avec succès.');
    } catch (err: any) {
      console.error(err);
      showToast("Erreur lors de la suppression : " + err.message);
    }
  };

  // Filtrage
  const filtered = announcements.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchText = (item.text || '').toLowerCase().includes(q);
      const matchVersion = (item.version || '').toLowerCase().includes(q);
      if (!matchTitle && !matchText && !matchVersion) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. HERO HEADER DU MODULE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5 text-red-600" />
              <span>Canal Connect • Système Osirion</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Gestionnaire du Système Osirion
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Publiez et organisez les annonces officielles, changelogs de mise à jour et messages système diffusés directement dans le premier canal de l'onglet <strong>Connect</strong> sur l'application mobile des athlètes.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Annonce / MÀJ</span>
          </button>
        </div>

        {/* STATS KPI STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Diffusions</span>
            <span className="text-xl font-black text-slate-900">{announcements.length}</span>
          </div>
          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Dernière Version</span>
            <span className="text-xl font-black text-indigo-600 font-mono">
              {announcements.find((a) => a.version)?.version || 'v2.4.0'}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Annonces Épinglées</span>
            <span className="text-xl font-black text-amber-600">
              {announcements.filter((a) => a.isPinned).length}
            </span>
          </div>
          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Canal Mobile</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-700">En direct (FCM Active)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRE D'OUTILS & FILTRES */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Catégories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'Toutes', icon: Layers },
            { id: 'UPDATE', label: 'Mises à jour (Changelog)', icon: Rocket },
            { id: 'OFFICIAL', label: 'Officielles', icon: Megaphone },
            { id: 'EVENT', label: 'Événements', icon: Trophy },
            { id: 'MAINTENANCE', label: 'Maintenance', icon: Wrench },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSel = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  isSel
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Recherche */}
        <div className="relative sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une annonce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </div>

      {/* 3. LISTE DES ANNONCES DIFFUSÉES */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Synchronisation des annonces Firestore en cours...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Aucune annonce trouvée</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `Aucun résultat pour la recherche "${searchQuery}".`
              : 'Commencez par diffuser votre première mise à jour ou annonce officielle pour les athlètes.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer une annonce</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((item) => {
            const isUpdate = item.category === 'UPDATE';
            const isMaintenance = item.category === 'MAINTENANCE';
            const isEvent = item.category === 'EVENT';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border transition shadow-sm hover:shadow-md p-5 sm:p-6 space-y-4 relative ${
                  item.isPinned
                    ? 'border-amber-300 bg-linear-to-r from-amber-50/20 to-white'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Header Carte */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Badge Catégorie */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                          isUpdate
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : isMaintenance
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isEvent
                            ? 'bg-pink-50 text-pink-700 border border-pink-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isUpdate && <Rocket className="w-3 h-3" />}
                        {isMaintenance && <Wrench className="w-3 h-3" />}
                        {isEvent && <Trophy className="w-3 h-3" />}
                        {!isUpdate && !isMaintenance && !isEvent && <Megaphone className="w-3 h-3" />}
                        <span>{item.category}</span>
                      </span>

                      {/* Tag Version */}
                      {item.version && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-mono font-bold">
                          {item.version}
                        </span>
                      )}

                      {/* Épinglé */}
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                          <span>Épinglé</span>
                        </span>
                      )}

                      {/* Priorité */}
                      {item.priority === 'URGENT' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                          Urgent
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Actions Rapides */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleTogglePin(item)}
                      title={item.isPinned ? 'Détacher' : 'Épingler en haut'}
                      className={`p-2 rounded-xl transition ${
                        item.isPinned
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(item)}
                      title="Modifier l'annonce"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Supprimer définitivement"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Introduction / Chapeau */}
                {item.intro && (
                  <p className="text-xs sm:text-sm text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 leading-relaxed font-sans">
                    {item.intro}
                  </p>
                )}

                {/* Sections / Modules avec Emojis */}
                {item.sections && item.sections.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {item.sections.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="bg-slate-50/50 rounded-2xl p-3 border border-slate-200/60 flex items-start gap-2.5"
                      >
                        <span className="text-lg shrink-0 p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          {sec.emoji}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {sec.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {sec.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Méta */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Diffusé le {formatDate(item.timestamp)}</span>
                  </div>
                  <span className="font-mono text-slate-500">ID: {item.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODALE DE CRÉATION & ÉDITION AVEC LIVE PREVIEW MOBILE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingId ? "Modifier l'Annonce Système" : 'Nouvelle Transmission Système'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Canal officiel « SYSTÈME OSIRION » visible par tous les athlètes
                  </p>
                </div>
              </div>

              {/* Bouton onglet sur mobile pour basculer preview */}
              <div className="flex items-center gap-2">
                <div className="lg:hidden flex items-center bg-slate-200 p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('edit')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      previewTab === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Formulaire
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('preview')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      previewTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Aperçu Mobile
                  </button>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body : Split View (Formulaire à gauche, Smartphone Simulator à droite) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Colonne Formulaire (7 cols) */}
              <form
                onSubmit={handleSaveAnnouncement}
                className={`lg:col-span-7 p-6 space-y-5 overflow-y-auto ${
                  previewTab === 'preview' ? 'hidden lg:block' : 'block'
                }`}
              >
                {/* Templates Rapides */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Générer rapidement avec un template :
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('UPDATE')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Template Mise à Jour</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('MAINTENANCE')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Template Maintenance</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('EVENT')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Template Événement Clan</span>
                    </button>
                  </div>
                </div>

                {/* Ligne 1 : Titre & Version */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Titre de l'annonce *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mise à jour v2.5 : L'Arène et le Monde Réel"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Version / Tag
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: v2.5.0"
                      value={formVersion}
                      onChange={(e) => setFormVersion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Ligne 2 : Catégorie & Priorité & Épinglé */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Catégorie</label>
                    <select
                      value={formCategory}
                      onChange={(e: any) => setFormCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="UPDATE">Mise à jour (Changelog)</option>
                      <option value="OFFICIAL">Annonce Officielle</option>
                      <option value="EVENT">Événement Spécial</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Priorité</label>
                    <select
                      value={formPriority}
                      onChange={(e: any) => setFormPriority(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="NORMAL">Standard</option>
                      <option value="IMPORTANT">Importante</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formIsPinned}
                        onChange={(e) => setFormIsPinned(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-700">Épingler en haut</span>
                    </label>
                  </div>
                </div>

                {/* Introduction / Chapeau */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Introduction / Message aux Guerriers
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Message d'accueil ou résumé introductif..."
                    value={formIntro}
                    onChange={(e) => setFormIntro(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                {/* SECTIONS / NOUVEAUTÉS DYNAMIQUES */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Sections & Nouveautés Détaillées ({formSections.length})
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Chaque point sera mis en valeur avec son icône dans l'application
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un point</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formSections.map((sec, index) => (
                      <div
                        key={sec.id}
                        className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5 relative group"
                      >
                        <div className="flex items-center gap-2">
                          {/* Choix Emoji */}
                          <select
                            value={sec.emoji}
                            onChange={(e) => handleUpdateSection(sec.id, 'emoji', e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-base"
                          >
                            {EMOJI_OPTIONS.map((em) => (
                              <option key={em} value={em}>
                                {em}
                              </option>
                            ))}
                          </select>

                          {/* Titre Section */}
                          <input
                            type="text"
                            placeholder="Titre de la nouveauté (ex: L'Arène et le Monde Réel)"
                            value={sec.title}
                            onChange={(e) => handleUpdateSection(sec.id, 'title', e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Supprimer ce point"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Contenu Section */}
                        <textarea
                          rows={2}
                          placeholder="Points détaillés (utilisez des retours à la ligne pour créer des sous-puces)..."
                          value={sec.content}
                          onChange={(e) => handleUpdateSection(sec.id, 'content', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 leading-relaxed font-sans"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image URL optionnelle */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Image / Bannière d'illustration (URL optionnelle)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                  />
                </div>

                {/* Footer Boutons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{editingId ? 'Mettre à jour' : 'Diffuser dans Connect'}</span>
                  </button>
                </div>
              </form>

              {/* Colonne Aperçu Mobile (Smartphone Live Simulator) (5 cols) */}
              <div
                className={`lg:col-span-5 p-6 bg-slate-900 flex flex-col items-center justify-start ${
                  previewTab === 'edit' ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <div className="w-full max-w-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                      <Smartphone className="w-3.5 h-3.5 text-red-500" />
                      Aperçu Mobile en direct
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Pixel-Perfect</span>
                  </div>

                  {/* FRAME SMARTPHONE */}
                  <div className="bg-[#0D0D12] rounded-[36px] p-3 border-4 border-slate-800 shadow-2xl space-y-3 relative overflow-hidden">
                    {/* Top Notch / Camera pill */}
                    <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />

                    {/* Header AppBar */}
                    <div className="px-2 py-1 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                          <Megaphone className="w-3 h-3 text-red-500" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white">SYSTÈME OSIRION</div>
                          <div className="text-[8px] font-bold text-red-400">TRANSMISSION DIRECTE</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>DIRECT</span>
                      </div>
                    </div>

                    {/* CARD ANNONCE MOBILE */}
                    <div className="bg-[#131826] rounded-2xl border border-white/10 p-3.5 space-y-3 text-white">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-md font-bold">
                          {formCategory}
                        </span>
                        {formVersion && (
                          <span className="bg-white/10 text-white font-mono font-bold px-1.5 py-0.5 rounded">
                            {formVersion}
                          </span>
                        )}
                        <span className="text-white/40">Aujourd'hui</span>
                      </div>

                      {/* Titre */}
                      <h4 className="text-sm font-black text-white leading-tight">
                        {formTitle || 'Titre de la mise à jour'}
                      </h4>

                      {/* Intro */}
                      {formIntro && (
                        <p className="text-[10px] text-white/80 bg-white/5 p-2 rounded-xl leading-relaxed">
                          {formIntro}
                        </p>
                      )}

                      {/* Sections */}
                      <div className="space-y-2 pt-1">
                        {formSections.map((sec, idx) => (
                          <div
                            key={idx}
                            className="bg-[#1A2234] p-2 rounded-xl border border-white/5 flex items-start gap-2 text-left"
                          >
                            <span className="text-sm">{sec.emoji}</span>
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold text-amber-300">
                                {sec.title || 'Nouveauté'}
                              </div>
                              <div className="text-[9px] text-white/70 line-clamp-3 leading-normal">
                                {sec.content || 'Détails de la fonctionnalité...'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Badge */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] text-white/40">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5 text-red-400" />
                          <span>CANAL OFFICIEL OSIRION</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
