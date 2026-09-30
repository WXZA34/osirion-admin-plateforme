import React, { useState, useEffect } from 'react';
import {
  FIRESTORE_RUBRIQUES,
  FirestoreRubriqueInfo,
  RubriqueSyncStatus,
  getRubriquesSyncStatus,
  seedRubrique,
  seedAllFirestoreData,
} from '../services/firestoreSync';
import {
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  UploadCloud,
  Sparkles,
  ArrowRight,
  Code2,
  Shield,
  Layers,
  FileCode,
  HardDrive,
  Info,
  ExternalLink,
  Search,
  Check,
  X,
  AlertTriangle,
  FolderSync,
  Cpu,
} from 'lucide-react';

interface FirestoreConnectionHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

export const FirestoreConnectionHubModal: React.FC<FirestoreConnectionHubModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [statuses, setStatuses] = useState<Record<string, RubriqueSyncStatus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingAll, setIsSeedingAll] = useState(false);
  const [seedingRubriqueId, setSeedingRubriqueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rubriques' | 'architecture' | 'flutter_code'>('rubriques');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Charger les compteurs au montage ou à l'ouverture
  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await getRubriquesSyncStatus();
      setStatuses(res);
    } catch (e: any) {
      console.warn('Sync status load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedSingle = async (rub: FirestoreRubriqueInfo) => {
    setSeedingRubriqueId(rub.id);
    const result = await seedRubrique(rub.id);
    setSeedingRubriqueId(null);

    if (result.success) {
      showToast(`« ${rub.name} » synchronisé ! ${result.count} documents déployés.`);
      loadStats();
      onSyncComplete?.();
    } else {
      showToast(`Erreur : ${result.error}`);
    }
  };

  const handleSeedAll = async () => {
    setIsSeedingAll(true);
    const result = await seedAllFirestoreData();
    setIsSeedingAll(false);

    if (result.success) {
      showToast(`Base Firestore amorcée avec succès ! ${result.totalUploaded} documents synchronisés sur 16 rubriques.`);
      loadStats();
      onSyncComplete?.();
    } else {
      showToast(`Amorçage partiel : ${result.totalUploaded} documents téléversés. (${result.errors.length} alertes)`);
      loadStats();
    }
  };

  if (!isOpen) return null;

  const categories = ['ALL', 'Supervision & Revenus', 'Contenu & Entraînement', 'Communauté & Géolocalisation', 'Système & Technique'];

  const filteredRubriques = FIRESTORE_RUBRIQUES.filter((r) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (r.name || '').toLowerCase().includes(q) ||
      (r.firestorePath || '').toLowerCase().includes(q) ||
      (r.mobileMapping || '').toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalConnected = Object.values(statuses).filter((s) => s.status === 'CONNECTED').length;
  const totalItemsCount = Object.values(statuses).reduce((acc, curr) => acc + (curr.documentCount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Hub de Synchronisation Firestore & Données Réelles
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  valerion-55414
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Passerelle bidirectionnelle en direct entre l'application mobile Flutter Osirion et la console d'administration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Summary Bar */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">Projet Cloud Firestore</div>
            <div className="text-sm font-bold text-white mt-0.5">valerion-55414</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Google Cloud Europe (eur3)</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">Rubriques Répertoriées</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">16 Sections Officielles</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{totalConnected} synchronisées en direct</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-[11px]">Documents Détectés</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {isLoading ? 'Calcul...' : `${totalItemsCount} documents`}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Données réelles & templates</div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px]">Amorçage Complet (1-Clic)</div>
            <button
              onClick={handleSeedAll}
              disabled={isSeedingAll}
              className="mt-1 w-full py-1 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/10 disabled:opacity-50"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isSeedingAll ? 'animate-bounce' : ''}`} />
              <span>{isSeedingAll ? 'Amorçage...' : 'Amorcer Toute la Base'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('rubriques')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'rubriques'
                  ? 'border-amber-400 text-amber-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Les 16 Rubriques & Collections</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'border-amber-400 text-amber-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Architecture Flutter & Sécurité</span>
            </button>
            <button
              onClick={() => setActiveTab('flutter_code')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'flutter_code'
                  ? 'border-amber-400 text-amber-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Exemples de Code Dart (Flutter)</span>
            </button>
          </div>

          <button
            onClick={loadStats}
            disabled={isLoading}
            className="p-1.5 text-xs text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Rafraîchir les compteurs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TOAST MESSAGE */}
          {toastMessage && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {activeTab === 'rubriques' && (
            <>
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer par nom de rubrique, collection ou fichier Flutter..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat === 'ALL' ? 'Toutes (16)' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rubriques Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredRubriques.map((rub) => {
                  const stat = statuses[rub.id];
                  const isSeeding = seedingRubriqueId === rub.id;
                  const docCount = stat?.documentCount ?? rub.sampleItemCount;
                  const isConnected = stat?.status === 'CONNECTED';

                  return (
                    <div
                      key={rub.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              {rub.category}
                            </span>
                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                              <span>{rub.name}</span>
                            </h3>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                              isConnected
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                              }`}
                            />
                            {isConnected ? 'Connecté' : 'Mode Local'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                          {rub.description}
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="text-slate-500 flex items-center gap-1">
                              <HardDrive className="w-3 h-3" /> Cible Firestore :
                            </span>
                            <code className="text-amber-300/90 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {rub.firestorePath}
                            </code>
                          </div>

                          <div className="flex items-center justify-between text-slate-400">
                            <span className="text-slate-500 flex items-center gap-1">
                              <Code2 className="w-3 h-3" /> Mapper Flutter :
                            </span>
                            <span className="text-slate-300 font-mono text-[10px] truncate max-w-[210px]" title={rub.mobileMapping}>
                              {rub.mobileMapping}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <div className="text-xs">
                          <span className="font-bold text-white">{docCount}</span>{' '}
                          <span className="text-slate-500 text-[11px]">
                            {rub.type === 'COLLECTION' ? 'documents' : 'config doc'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleSeedSingle(rub)}
                          disabled={isSeeding || isSeedingAll}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <UploadCloud className={`w-3 h-3 ${isSeeding ? 'animate-bounce' : ''}`} />
                          <span>{isSeeding ? 'Envoi...' : 'Amorcer / Synchroniser'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Comment fonctionne la connexion entre l'application mobile et l'admin ?
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  L'application mobile Flutter (<code className="text-amber-300 font-mono">osirion-</code>) et le site d'administration (<code className="text-amber-300 font-mono">osirion-admin-plateforme</code>) partagent la <strong>même instance Firebase Firestore</strong> (<code className="text-amber-300 font-mono">valerion-55414</code>).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <div className="font-bold text-white text-xs mb-1">1. Flux Écriture Mobile</div>
                    <p className="text-slate-400 text-[11px]">
                      Lorsqu'un athlète effectue une séance Dojo, bat un record de traction ou vote au sondage, l'application Flutter écrit dans les collections Firestore (<code className="text-amber-300">users</code>, <code className="text-amber-300">pantheon_records</code>, <code className="text-amber-300">daily_transmissions</code>).
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <div className="font-bold text-white text-xs mb-1">2. Écouteurs Admin (Snapshot)</div>
                    <p className="text-slate-400 text-[11px]">
                      Le site d'administration utilise des listeners <code className="text-amber-300">onSnapshot()</code> en temps réel. Dès qu'une modification survient dans Firestore, l'interface admin s'actualise sans aucun rechargement.
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <div className="font-bold text-white text-xs mb-1">3. Télécommande Admin</div>
                    <p className="text-slate-400 text-[11px]">
                      Lorsque vous publiez la Transmission du Jour, créez un exercice Dojo ou répondez à un commentaire, les modifications sont écrites directement dans Firestore et l'application mobile de tous les athlètes se met à jour immédiatement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Rules overview */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Règles de Sécurité & Modération E2EE
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Pour garantir la stricte confidentialité des athlètes tout en permettant l'administration centralisée :
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-[11px]">
                  <li><strong className="text-white">Transmissions & Dojo :</strong> Lecture publique (<code className="text-amber-300">allow read: if true</code>), écriture réservée aux administrateurs.</li>
                  <li><strong className="text-white">Profils Athlètes :</strong> Chaque athlète ne peut modifier que son propre profil (<code className="text-amber-300">request.auth.uid == userId</code>), les administrateurs ont les droits de supervision.</li>
                  <li><strong className="text-white">Confidentialité E2EE :</strong> Les canaux de discussion privés et de clans sont chiffrés de bout en bout. Seuls les signalements formels déposés via le bouton de plainte créent des rapports lisibles dans la chambre de modération.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'flutter_code' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Exemple d'intégration dans l'application mobile Flutter
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Voici comment l'application Flutter se connecte directement aux données définies par l'admin pour la Transmission du Jour et les Exercices du Dojo :
                </p>

                <div className="mt-3 bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-slate-300">
                  <pre>{`// lib/features/home/services/daily_video_service.dart
import 'package:cloud_firestore/cloud_firestore.dart';

class DailyTransmissionService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Écoute en direct la transmission du jour configurée par l'admin
  Stream<DocumentSnapshot> streamDailyTransmission() {
    return _firestore
        .collection('global_config')
        .doc('daily_content')
        .snapshots();
  }

  // Voter au sondage de la vidéo du jour
  Future<void> submitPollVote(String optionId, String userId) async {
    await _firestore.collection('global_config').doc('daily_content').update({
      'pollOptions': FieldValue.arrayUnion([
        {'optionId': optionId, 'voterId': userId}
      ])
    });
  }
}`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Chaque mise à jour sur le site admin est répercutée en direct sur l'application mobile.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
