import React, { useState } from 'react';
import { Clan } from '../types/admin';
import {
  Users,
  Shield,
  Award,
  Crown,
  MapPin,
  TrendingUp,
  Search
} from 'lucide-react';

interface ClansManagerProps {
  clans: Clan[];
}

export const ClansManager: React.FC<ClansManagerProps> = ({ clans }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const q = (searchTerm || '').toLowerCase();
  const filteredClans = clans.filter((c) =>
    (c.name || '').toLowerCase().includes(q) ||
    (c.leaderPseudo || '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Ligues & Panthéon des Clans
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision des guildes d'athlètes, contrôle territorial et hiérarchie
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer les clans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Clan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClans.map((clan) => (
          <div
            key={clan.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-sm hover:shadow transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-base text-indigo-600">
                  #{clan.ranking}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>{clan.name}</span>
                    {clan.ranking === 1 && <Crown className="w-4 h-4 text-amber-500" />}
                  </h3>
                  <p className="text-xs text-slate-400">Fondé le {clan.createdAt}</p>
                </div>
              </div>

              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                {clan.membersCount} athlètes
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {clan.description}
            </p>

            <div className="grid grid-cols-3 gap-2.5 text-xs pt-1">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium">Chef de Clan</span>
                <span className="text-slate-900 font-semibold truncate block mt-0.5">{clan.leaderPseudo}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium">XP Collectif</span>
                <span className="text-blue-600 font-semibold block mt-0.5">{clan.totalXp.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium">Bastions H3</span>
                <span className="text-emerald-700 font-semibold block mt-0.5">{clan.territoriesHeld} contrôlés</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
