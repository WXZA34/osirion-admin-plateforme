import React, { useState, useEffect } from 'react';
import {
  Award,
  Zap,
  Shield,
  Plus,
  Trash2,
  X,
  Flame,
  Star,
  Crown,
  Gem,
  Swords,
  Snowflake,
  Edit2,
  Search
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

interface RelicItem {
  id: string;
  name: string;
  description: string;
  type: 'title' | 'halo' | 'boost';
  cost: number;
  rarity: 'Commune' | 'Rare' | 'Épique' | 'Légendaire';
  colorValue: number;
  requiredLevel?: number;
  iconName?: string;
}

interface ArsenalStoreManagerProps {
  userRole?: 'superadmin' | 'auditor';
}

const ICON_MAP: Record<string, any> = {
  'award': Award,
  'zap': Zap,
  'shield': Shield,
  'flame': Flame,
  'star': Star,
  'crown': Crown,
  'gem': Gem,
  'swords': Swords,
  'snowflake': Snowflake
};

const MobileRelicCardPreview = ({ name, type, cost, colorHex, iconName }: { name: string, type: string, cost: number, colorHex: string, iconName?: string }) => {
  const IconComponent = ICON_MAP[iconName || 'award'] || Award;
  
  return (
    <div 
      className="relative flex flex-col items-center justify-between p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-transform"
      style={{ 
        backgroundColor: '#0F172A', 
        borderColor: `${colorHex}33` 
      }}
    >
      <div 
        className="p-3.5 rounded-full mb-3"
        style={{ backgroundColor: `${colorHex}1A` }} 
      >
        <IconComponent className="w-7 h-7" style={{ color: colorHex }} />
      </div>
      <div className="text-center mb-5 w-full">
        <h4 className="text-white font-bold text-[13px] leading-snug line-clamp-2 min-h-[1.5rem]">{name || 'Nom de l\'objet'}</h4>
        <p className="text-[9px] font-bold tracking-[0.1em] mt-1.5" style={{ color: colorHex }}>
          {(type || 'titre').toUpperCase()}
        </p>
      </div>
      <div className="w-full">
        <button 
          className="w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm pointer-events-none"
          style={{ backgroundColor: '#F59E0B' }}
        >
          <Zap className="w-3.5 h-3.5 text-black" fill="currentColor" />
          <span className="text-black font-black text-xs">{cost || 0}</span>
        </button>
      </div>
    </div>
  );
};

export const ArsenalStoreManager: React.FC<ArsenalStoreManagerProps> = ({ userRole = 'superadmin' }) => {
  const [relics, setRelics] = useState<RelicItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'title' | 'halo' | 'boost'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RelicItem['type']>('title');
  const [rarity, setRarity] = useState<RelicItem['rarity']>('Rare');
  const [cost, setCost] = useState('500');
  const [colorHex, setColorHex] = useState('#FFD700');
  const [requiredLevel, setRequiredLevel] = useState('');
  const [iconName, setIconName] = useState('award');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'relics'), (snap) => {
      const items: RelicItem[] = [];
      snap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as RelicItem);
      });
      setRelics(items);
    });
    return () => unsub();
  }, []);

  const filteredRelics = relics.filter(r => 
    (filter === 'all' || r.type === filter) &&
    ((r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
     (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setType('title');
    setRarity('Rare');
    setCost('500');
    setColorHex('#FFD700');
    setRequiredLevel('');
    setIconName('award');
    setShowModal(true);
  };

  const openEditModal = (relic: RelicItem) => {
    setEditingId(relic.id);
    setName(relic.name);
    setDescription(relic.description);
    setType(relic.type || 'title');
    setRarity(relic.rarity || 'Rare');
    setCost((relic.cost || 0).toString());
    setColorHex('#' + ((relic.colorValue || 0) & 0xFFFFFF).toString(16).padStart(6, '0'));
    setRequiredLevel(relic.requiredLevel ? relic.requiredLevel.toString() : '');
    setIconName(relic.iconName || 'award');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || userRole !== 'superadmin') return;

    const hexColor = colorHex.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const colorInt = ((255 & 0xff) << 24) >>> 0 | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);

    const relicData: Partial<RelicItem> = {
      name,
      description,
      type,
      rarity,
      cost: parseInt(cost) || 0,
      colorValue: colorInt,
      iconName,
    };

    if (type === 'title' && requiredLevel) {
      relicData.requiredLevel = parseInt(requiredLevel);
    } else {
      relicData.requiredLevel = null as any; // to remove it
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'relics', editingId), relicData);
      } else {
        const newId = `relic_${Date.now()}`;
        await setDoc(doc(db, 'relics', newId), relicData);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving relic:', err);
      alert('Erreur de permissions ou base de données.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (userRole !== 'superadmin') return;
    if (window.confirm('Voulez-vous vraiment supprimer cet objet de l\'Arsenal ?')) {
      try {
        await deleteDoc(doc(db, 'relics', id));
      } catch (err) {
        console.error('Error deleting relic:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Arsenal & Boutique Cosmétique
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez les titres, halos et boosts avec un rendu visuel 1:1 de l'application mobile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['all', 'title', 'halo', 'boost'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  filter === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {cat === 'all' ? 'Tous' : cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une relique..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {userRole === 'superadmin' && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Créer</span>
            </button>
          )}
        </div>
      </div>

      {filteredRelics.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm border border-dashed rounded-2xl border-slate-300">
          Aucune relique ne correspond à ce filtre.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredRelics.map((relic) => {
            const hex = '#' + ((relic.colorValue || 0) & 0xFFFFFF).toString(16).padStart(6, '0');
            return (
              <div key={relic.id} className="relative group" onClick={() => userRole === 'superadmin' && openEditModal(relic)}>
                <MobileRelicCardPreview 
                  name={relic.name} 
                  type={relic.type} 
                  cost={relic.cost} 
                  colorHex={hex} 
                  iconName={relic.iconName}
                />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-2xl pointer-events-none transition-colors" />
                
                {userRole === 'superadmin' && (
                  <button
                    onClick={(e) => handleDelete(e, relic.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">
                {editingId ? 'Modifier la relique' : 'Déployer un objet dans l\'Arsenal'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-48 shrink-0 flex flex-col items-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Aperçu App Mobile</p>
                <div className="w-full max-w-[160px] shadow-2xl rounded-2xl overflow-hidden ring-4 ring-slate-900/5">
                  <MobileRelicCardPreview 
                    name={name} 
                    type={type} 
                    cost={parseInt(cost) || 0} 
                    colorHex={colorHex} 
                    iconName={iconName}
                  />
                </div>
              </div>
              
              <form onSubmit={handleSave} className="flex-1 space-y-4 text-xs w-full">
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
                    required
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
                      <option value="boost">Boost Consommable</option>
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

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 font-medium mb-1 block">Prix (Æ)</label>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium mb-1 block">Couleur</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="w-10 h-10 rounded-xl p-1 cursor-pointer bg-slate-50 border border-slate-200 shrink-0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium mb-1 block">Icône</label>
                    <select
                      value={iconName}
                      onChange={(e) => setIconName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="award">Médaille</option>
                      <option value="crown">Couronne</option>
                      <option value="star">Étoile</option>
                      <option value="zap">Éclair</option>
                      <option value="flame">Flamme</option>
                      <option value="snowflake">Flocon</option>
                      <option value="shield">Bouclier</option>
                      <option value="swords">Épées</option>
                      <option value="gem">Gemme</option>
                    </select>
                  </div>
                </div>
                
                {type === 'title' && (
                  <div>
                    <label className="text-slate-600 font-medium mb-1 block">Niveau Requis (Optionnel)</label>
                    <input
                      type="number"
                      placeholder="Laisser vide si dispo dans la boutique"
                      value={requiredLevel}
                      onChange={(e) => setRequiredLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
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
                    {editingId ? 'Enregistrer les modifications' : 'Déployer l\'objet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
