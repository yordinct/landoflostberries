import React from 'react';
import { PlayerState } from '../types';
import { Coins, Utensils, Droplet, Trees, Mountain, Users, Swords, Package } from 'lucide-react';

interface Props {
  player: PlayerState;
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string | number, color: string }) => (
  <div className="bg-slate-800 p-4 rounded-lg flex items-center shadow-md border border-slate-700">
    <Icon className={`w-8 h-8 mr-4 ${color}`} />
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export const BaseScreen: React.FC<Props> = ({ player }) => {
  const { player: mainCharacter, resources, squad, inventory } = player;

  return (
    <div className="p-6 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">Welcome back, {mainCharacter.name}!</h1>
        <p className="text-lg text-slate-400">Your Kingdom Overview - Level {mainCharacter.level}</p>
      </header>

      {/* Resource Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Coins} label="Gold" value={resources.gold} color="text-yellow-400" />
        <StatCard icon={Utensils} label="Food" value={resources.food} color="text-orange-400" />
        <StatCard icon={Droplet} label="Mana" value={resources.mana} color="text-blue-400" />
        <StatCard icon={Trees} label="Wood" value={resources.wood} color="text-green-400" />
        <StatCard icon={Mountain} label="Stone" value={resources.stone} color="text-gray-400" />
      </div>

      {/* Kingdom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <StatCard icon={Users} label="Squad Members" value={`${squad.length} / 5`} color="text-indigo-400" />
         <StatCard icon={Swords} label="Active Quests" value={player.activeQuests.length} color="text-purple-400" />
         <StatCard icon={Package} label="Items in Armory" value={inventory?.length || 0} color="text-teal-400" />
      </div>
      
      {/* Placeholder for future features */}
      <div className="mt-8 bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Kingdom Actions</h2>
          <p className="text-slate-400">More buildings and actions will be available as your kingdom grows.</p>
      </div>
    </div>
  );
};
