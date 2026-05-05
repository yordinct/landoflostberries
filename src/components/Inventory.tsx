import React, { useState } from 'react';
import { PlayerState, Item, ItemType } from '../types';
import { ITEMS_DATABASE } from '../items';
import { Sword, Shield, Gem, Apple, FlaskConical, Scroll } from 'lucide-react';

interface Props {
  player: PlayerState;
  onEquip: (itemId: string) => void;
  onUse: (itemId: string) => void;
}

const ICONS: { [key in ItemType]: React.ElementType } = {
    Weapon: Sword,
    Armor: Shield,
    Accessory: Gem,
    Consumable: Apple,
    Material: FlaskConical,
    Quest: Scroll
};

export const Inventory: React.FC<Props> = ({ player, onEquip, onUse }) => {
  const [filter, setFilter] = useState<ItemType | 'All'>('All');

  const inventoryItems = player.inventory?.map(invItem => {
      // This check is important if inventory stores only IDs
      const itemDetails = ITEMS_DATABASE.find(dbItem => dbItem.id === (invItem as any).id);
      return itemDetails || invItem;
  }) || [];

  const filteredItems = filter === 'All' 
    ? inventoryItems 
    : inventoryItems.filter(item => item.type === filter);

  return (
    <div className="p-6 animate-fade-in">
        <header className="mb-6">
            <h1 className="text-4xl font-bold text-white">Armory & Inventory</h1>
            <p className="text-lg text-slate-400">Manage your items and equipment.</p>
        </header>

        <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
            <button onClick={() => setFilter('All')} className={`px-4 py-2 text-sm rounded-md ${filter === 'All' ? 'bg-blue-600 text-white' : 'bg-slate-700'}`}>All</button>
            {Object.keys(ICONS).map(type => (
                <button key={type} onClick={() => setFilter(type as ItemType)} className={`px-4 py-2 text-sm rounded-md ${filter === type ? 'bg-blue-600 text-white' : 'bg-slate-700'}`}>
                    {type}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.length > 0 ? filteredItems.map(item => {
                const Icon = ICONS[item.type];
                return (
                    <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col">
                        <div className="flex items-start mb-2">
                            <Icon className="w-6 h-6 mr-3 text-yellow-400" />
                            <div className="flex-1">
                                <h3 className="font-bold text-white">{item.name}</h3>
                                <p className="text-xs text-slate-400">{item.rarity} {item.type}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 flex-1 mb-3">{item.description}</p>
                        <div className="mt-auto">
                            {(item.type === 'Weapon' || item.type === 'Armor' || item.type === 'Accessory') && (
                                <button onClick={() => onEquip(item.id)} className="w-full px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                                    Equip
                                </button>
                            )}
                            {item.type === 'Consumable' && (
                                <button onClick={() => onUse(item.id)} className="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                                    Use
                                </button>
                            )}
                        </div>
                    </div>
                );
            }) : (
                <p className="text-slate-400 italic col-span-full">No items of this type in your inventory.</p>
            )}
        </div>
    </div>
  );
}
