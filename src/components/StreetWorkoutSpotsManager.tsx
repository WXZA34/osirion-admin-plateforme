import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  Star,
  Camera,
  Navigation,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  X,
  Droplets,
  Sun,
  Umbrella
} from 'lucide-react';
import { StreetWorkoutSpot } from '../types/admin';

interface StreetWorkoutSpotsManagerProps {
  spots: StreetWorkoutSpot[];
  userRole: 'superadmin' | 'auditor';
  onAddSpot: (spot: StreetWorkoutSpot) => void;
  onDeleteSpot: (id: string) => void;
}

export const StreetWorkoutSpotsManager: React.FC<StreetWorkoutSpotsManagerProps> = ({
  spots,
  userRole,
  onAddSpot,
  onDeleteSpot,
}) => {
  const [searchCity, setSearchCity] = useState('');
  const [selectedGround, setSelectedGround] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Paris');
  const [postalCode, setPostalCode] = useState('75001');
  const [latitude, setLatitude] = useState(48.8566);
  const [longitude, setLongitude] = useState(2.3522);
  const [groundType, setGroundType] = useState<StreetWorkoutSpot['groundType']>('Tartan amortissant');
  const [equipmentInput, setEquipmentInput] = useState('Barres de traction, Dips, Monkey bar');
  const [hasWaterPoint, setHasWaterPoint] = useState(true);
  const [hasNightLighting, setHasNightLighting] = useState(true);

  const filteredSpots = spots.filter((s) => {
    const q = (searchCity || '').toLowerCase();
    const matchesSearch =
      (s.name || '').toLowerCase().includes(q) ||
      (s.city || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q);
    const matchesGround = selectedGround === 'ALL' || s.groundType === selectedGround;
    return matchesSearch && matchesGround;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSpot: StreetWorkoutSpot = {
      id: `spot_${Date.now()}`,
      name,
      address,
      city,
      postalCode,
      latitude,
      longitude,
      equipmentList: equipmentInput.split(',').map((e) => e.trim()).filter(Boolean),
      groundType,
      status: 'VERIFIED',
      rating: 5.0,
      reviewsCount: 1,
      photosCount: 2,
      contributedBy: 'admin_osirion',
      isCovered: false,
      hasWaterPoint,
      hasNightLighting,
    };

    onAddSpot(newSpot);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Cartographie des Parcs & Spots de Street Workout
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Répertoire géolocalisé des installations sportives extérieures validées par la communauté Osirion
          </p>
        </div>

        {userRole === 'superadmin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un spot</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par ville (Paris, Lyon, Marseille...) ou nom de spot..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none"
          />
        </div>

        <select
          value={selectedGround}
          onChange={(e) => setSelectedGround(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none w-full sm:w-auto"
        >
          <option value="ALL">Tous les types de sols</option>
          <option value="Tartan amortissant">Tartan amortissant</option>
          <option value="Sable fin">Sable fin</option>
          <option value="Pelouse naturelle">Pelouse naturelle</option>
          <option value="Béton / Bitume">Béton / Bitume</option>
        </select>
      </div>

      {/* Spots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSpots.map((spot) => (
          <div
            key={spot.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider block">
                    {spot.city} ({spot.postalCode})
                  </span>
                  <h3 className="font-semibold text-slate-900 text-sm mt-0.5">{spot.name}</h3>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700 font-bold text-xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{spot.rating}</span>
                  <span className="text-[10px] font-normal text-slate-400">({spot.reviewsCount})</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed flex items-start gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>{spot.address}</span>
              </p>

              {/* Equipment Tags */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Équipements répertoriés :
                </span>
                <div className="flex flex-wrap gap-1">
                  {spot.equipmentList.map((eq) => (
                    <span
                      key={eq}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Amenities & Ground */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Revêtement au sol</span>
                  <span className="font-semibold text-slate-800">{spot.groundType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Commodités</span>
                  <div className="flex items-center gap-2 mt-0.5 text-slate-700">
                    {spot.hasWaterPoint && <span title="Point d'eau potable">💧 Eau</span>}
                    {spot.hasNightLighting && <span title="Éclairage nocturne">💡 Éclairé</span>}
                    {spot.isCovered ? <span>☂️ Couvert</span> : <span>☀️ Plein air</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium text-[11px]"
              >
                <span>Ouvrir sur Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {userRole === 'superadmin' && (
                <button
                  onClick={() => onDeleteSpot(spot.id)}
                  className="text-slate-400 hover:text-rose-600 text-[11px] font-medium transition"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Spot */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Ajouter une aire de Street Workout
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Nom du spot :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Parc de Callisthénie des Berges"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Adresse complète :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 15 Quai de la Révolution"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Ville :</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Code postal :</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Latitude GPS :</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Longitude GPS :</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Revêtement au sol :</label>
                <select
                  value={groundType}
                  onChange={(e) => setGroundType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="Tartan amortissant">Tartan amortissant</option>
                  <option value="Sable fin">Sable fin</option>
                  <option value="Pelouse naturelle">Pelouse naturelle</option>
                  <option value="Béton / Bitume">Béton / Bitume</option>
                  <option value="Gravier">Gravier</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Équipements (séparés par des virgules) :
                </label>
                <input
                  type="text"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasWaterPoint}
                    onChange={(e) => setHasWaterPoint(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Point d'eau</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasNightLighting}
                    onChange={(e) => setHasNightLighting(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Éclairage de nuit</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Valider et enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
