import React from 'react';
import { PlayerState, Character, Equipment } from '../types';
import { Shield, Sword, Heart, Brain, Zap, Wind, User, Diamond, Star } from 'lucide-react';
import { ITEMS_DATABASE } from '../items';

interface Props {
  player: PlayerState;
}

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: any }) => (
  <li className="flex justify-between items-center py-2 px-3 bg-slate-800 rounded-md">
    <div className="flex items-center">
      <Icon className="w-5 h-5 mr-3 text-slate-400" />
      <span className="text-slate-300 font-medium">{label}</span>
    </div>
    <span className="text-white font-bold">{value}</span>
  </li>
);

const EquippedItem = ({ slot, itemId }: { slot: string, itemId?: string }) => {
    const item = itemId ? ITEMS_DATABASE.find(i => i.id === itemId) : null;
    
    return (
        <div className="bg-slate-800 p-3 rounded-md">
            <p className="text-sm text-slate-500 capitalize">{slot}</p>
            {item ? (
                <p className="text-white font-semibold">{item.name}</p>
            ) : (
                <p className="text-slate-400 italic">Empty</p>
            )}
        </div>
    );
};

export const CharacterScreen: React.FC<Props> = ({ player }) => {
  const hero = player.player;

  return (
    <div className="p-6 animate-fade-in">
      <header className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-bold text-white">{hero.name}</h1>
            <p className="text-lg text-slate-400">{hero.race} {hero.class} - Level {hero.level}</p>
        </div>
        <div className="text-right">
            <p className="text-slate-400">XP: {hero.exp} / {hero.level * 100}</p>
            {/* XP Bar could go here */}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats */}
        <div className="lg:col-span-1 bg-slate-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Core Stats</h2>
            <ul className="space-y-2">
                <StatItem icon={Heart} label="Health" value={`${hero.stats.hp} / ${hero.stats.maxHp}`} />
                <StatItem icon={Zap} label="Mana" value={`${hero.stats.mp} / ${hero.stats.maxMp}`} />
                <StatItem icon={Sword} label="Strength (STR)" value={hero.stats.str} />
                <StatItem icon={Brain} label="Intelligence (INT)" value={hero.stats.int} />
                <StatItem icon={Shield} label="Defense (DEF)" value={hero.stats.def} />
                <StatItem icon={Wind} label="Speed (SPD)" value={hero.stats.spd} />
                <StatItem icon={User} label="Charisma (CHA)" value={hero.stats.cha} />
            </ul>
        </div>

        {/* Middle Column: Equipment */}
        <div className="lg:col-span-1 bg-slate-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Equipment</h2>
            <div className="space-y-4">
                <EquippedItem slot="Weapon" itemId={hero.equipment?.weapon} />
                <EquippedItem slot="Armor" itemId={hero.equipment?.armor} />
                <EquippedItem slot="Accessory" itemId={hero.equipment?.accessory} />
            </div>
        </div>

        {/* Right Column: Abilities & Details */}
        <div className="lg:col-span-1 bg-slate-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Details</h2>
            <ul className="space-y-2">
                <StatItem icon={Diamond} label="Affinity" value={hero.affinity} />
                <StatItem icon={Star} label="Loyalty" value={hero.loyalty || 'N/A'} />
                {/* Add more details as needed */}
            </ul>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Abilities</h3>
            <div className="text-slate-400 italic">
                {/* Abilities list will go here */}
                <p>Ability system not yet implemented.</p>
            </div>
        </div>
      </div>
    </div>
  );
};
