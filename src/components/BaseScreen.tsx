import React from 'react';
import { PlayerState } from '../types';
import { 
  Coins, Wheat, Droplet, TreePine, Mountain, 
  Users, Swords, Box, Sun // Changed Cube to Box
} from 'lucide-react';

interface Props {
  player: PlayerState;
  onTriggerEvent: () => void;
}

const ResourceCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-slate-800 p-4 rounded-lg flex items-center">
    <Icon className={`w-8 h-8 mr-4 ${color}`} />
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-white font-bold text-xl">{value}</p>
    </div>
  </div>
);

const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="bg-slate-800 p-4 rounded-lg">
        <div className="flex items-center mb-2">
            <Icon className="w-6 h-6 mr-3 text-slate-400" />
            <p className="text-slate-300 font-medium">{label}</p>
        </div>
        <p className="text-white font-bold text-2xl">{value}</p>
    </div>
);

export const BaseScreen: React.FC<Props> = ({ player, onTriggerEvent }) => {
  const p = player.player;
  const r = player.resources;

  return (
    <div className="p-6 animate-fade-in">
        <header className="mb-8">
            <h1 className="text-4xl font-bold text-white">Welcome back, {p.name}!</h1>
            <p className="text-lg text-slate-400">Your Kingdom Overview - Level {player.baseLevel}</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <ResourceCard icon={Coins} label="Gold" value={r.gold} color="text-yellow-400" />
            <ResourceCard icon={Wheat} label="Food" value={r.food} color="text-orange-400" />
            <ResourceCard icon={Droplet} label="Mana" value={r.mana} color="text-blue-400" />
            <ResourceCard icon={TreePine} label="Wood" value={r.wood} color="text-green-400" />
            <ResourceCard icon={Mountain} label="Stone" value={r.stone} color="text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <InfoCard icon={Users} label="Squad Members" value={`${player.squad.length} / 5`} />
            <InfoCard icon={Swords} label="Active Quests" value={player.activeQuests.length} />
            <InfoCard icon={Box} label="Items in Armory" value={player.inventory.length} /> {/* Changed Cube to Box */}
        </div>

        <div className="bg-slate-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Kingdom Actions</h2>
            <p className="text-slate-400 mb-6">More buildings and actions will be available as your kingdom grows.</p>

            {/* Event Trigger Button */}
            <div className="flex justify-center">
                 <button 
                    onClick={onTriggerEvent}
                    className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-all shadow-lg flex items-center space-x-2 animate-pulse"
                >
                    <Sun className="w-5 h-5" />
                    <span>An Event is Occurring!</span>
                </button>
            </div>
        </div>
    </div>
  );
}
