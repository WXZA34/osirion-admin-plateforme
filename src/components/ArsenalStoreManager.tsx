import React, { useState } from 'react';
import {
  Award,
  Zap,
  Shield,
  Plus,
  Trash2,
  X
} from 'lucide-react';

interface RelicItem {
  id: string;
  name: string;
  description: string;
  type: 'title' | 'halo' | 'badge';
  costAether: number;
  rarity: 'Commune' | 'Rare' | 'Épique' | 'Légendaire';
}

const INITIAL_RELICS: RelicItem[] = [
  {
    id: 'title_perseverant',
    name: 'Le Persévérant',
    description: 'Prouve votre détermination continue.',
    type: 'title',
    costAether: 100,
    rarity: 'Commune',
  },
  {
    id: 'title_eveille',
    name: "L'Éveillé",
    description: 'Titre spirituel pour un esprit clair.',
    type: 'title',
    costAether: 300,
    rarity: 'Rare',
  },
  {
    id: 'title_titan',
    name: 'Titan de Fer',
    description: 'Réservé aux machines inarrêtables.',
    type: 'title',
    costAether: 1000,
    rarity: 'Épique',
  },
  {
    id: 'title_intouchable',
    name: "L'Intouchable",
    description: 'Aucune excuse ne peut vous atteindre.',
    type: 'title',
    costAether: 1500,
    rarity: 'Légendaire',
  },
  {
    id: 'halo_foudre',
    name: 'Foudre Céleste',
    description: 'Aura crépitante entourant l’avatar du guerrier.',
    type: 'halo',
    costAether: 2500,
    rarity: 'Légendaire',
  },
];

interface ArsenalStoreManagerProps {
  userRole?: 'superadmin' | 'auditor';
}

export const ArsenalStoreManager: React.FC<ArsenalStoreManagerProps> = ({ userRole = 'superadmin' }) => {
  const [relics, setRelics] = useState<RelicItem[]>(INITIAL_RELICS);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RelicItem['type']>('title');
  const [rarity, setRarity] = useState<RelicItem['rarity']>('Rare');
  const [costAether, setCostAether] = useState('500');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRelic: RelicItem = {
      id: `relic_${Date.now()}`,
      name,
      description,
      type,
      rarity,
      costAether: parseInt(costAether) || 500,
    };

    setRelics([...relics, newRelic]);
    setName('');
    setDescription('');
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (userRole !== 'superadmin') return;
    setRelics(relics.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Arsenal & Boutique Cosmétique (`default_relics.dart`)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion des titres honorifiques, halos d’avatar et tarification en devises Aether (Æ)
          </p>
        </div>

        {userRole === 'superadmin' && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une relique</span>
          </button>
        )}
      </div>

      {/* Relics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relics.map((relic) => (
          <div
            key={relic.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-sm hover:shadow transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md uppercase ${
                    relic.rarity === 'Légendaire'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      : relic.rarity === 'Épique'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                      : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  }`}
                >
                  {relic.rarity} • {relic.type}
                </span>
                <h4 className="text-sm font-semibold text-slate-900 mt-1.5">{relic.name}</h4>
              </div>

              {userRole === 'superadmin' && (
                <button
                  onClick={() => handleDelete(relic.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Supprimer la relique"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{relic.description}</p>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 font-medium">
              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>{relic.costAether.toLocaleString()} Æ</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{relic.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Relic Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">
                Déployer un titre ou halo cosmétique
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 font-medium mb-1 block">Nom de l'objet</label>
                <input
                  type="text"
                  required
                  placeholder="ex: L'Ombre Implacable"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium mb-1 block">Description</label>
                <input
                  type="text"
                  placeholder="Débloqué après 50 victoires consécutives"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 font-medium mb-1 block">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="title">Titre honorifique</option>
                    <option value="halo">Halo cosmétique</option>
                    <option value="badge">Insigne de clan</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-medium mb-1 block">Rareté</label>
                  <select
                    value={rarity}
                    onChange={(e) => setRarity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Commune">Commune</option>
                    <option value="Rare">Rare</option>
                    <option value="Épique">Épique</option>
                    <option value="Légendaire">Légendaire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium mb-1 block">Prix en Aether (Æ)</label>
                <input
                  type="number"
                  value={costAether}
                  onChange={(e) => setCostAether(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition"
                >
                  Ajouter à la boutique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
