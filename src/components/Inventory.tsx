
import React, { useState } from 'react';
import { Character, Item, Equipment, EquipmentSlot } from '../types';
import { Gem, Shield, Sword } from 'lucide-react';

interface InventoryProps {
  squad: Character[];
  inventory: Item[];
  onEquipItem: (characterId: string, itemId: string) => void;
  onUnequipItem: (characterId: string, slot: EquipmentSlot) => void;
}

const RarityColor: Record<string, string> = {
  Common: 'text-slate-400',
  Uncommon: 'text-green-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-500',
  Legendary: 'text-amber-500',
  Mythic: 'text-red-600',
  Ancient: 'text-yellow-300',
};

export default function Inventory({ squad, inventory, onEquipItem, onUnequipItem }: InventoryProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleEquip = () => {
    if (selectedCharacter && selectedItem && selectedItem.type.endsWith('Weapon') || selectedItem.type.endsWith('Armor') || selectedItem.type.endsWith('Accessory')) {
      onEquipItem(selectedCharacter.id, selectedItem.id);
      setSelectedItem(null);
    }
  };

  const getEquippedItem = (character: Character, slot: EquipmentSlot): Item | undefined => {
      const itemId = character.equipment?.[slot.toLowerCase() as 'weapon' | 'armor' | 'accessory'];
      if (!itemId) return undefined;
      return inventory.find(item => item.id === itemId);
  }

  return (
    <div className="h-full w-full flex flex-col p-6 bg-slate-950 text-white font-mono">
      <header className="flex items-center justify-between pb-4 border-b border-white/10">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Armory & Inventory</h1>
      </header>

      <div className="flex-1 flex gap-6 mt-6 overflow-hidden">
        {/* Squad & Equipment Panel */}
        <div className="w-1/2 flex flex-col gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
          <h2 className="text-lg font-bold uppercase tracking-wider text-amber-400">Your Squad</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {squad.map(char => (
              <div 
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedCharacter?.id === char.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'}`}>
                <p className="font-bold text-lg">{char.name} <span className="text-xs text-slate-400">Lvl {char.level} {char.class}</span></p>
                <div className="flex gap-4 mt-2 text-xs">
                  {['Weapon', 'Armor', 'Accessory'].map(slot => {
                      const equipped = getEquippedItem(char, slot as EquipmentSlot);
                      return (
                        <div key={slot} className="flex-1 bg-slate-800/70 p-2 rounded-md flex items-center gap-2">
                            {slot === 'Weapon' && <Sword size={16} className="text-slate-400"/>}
                            {slot === 'Armor' && <Shield size={16} className="text-slate-400"/>}
                            {slot === 'Accessory' && <Gem size={16} className="text-slate-400"/>}
                            <div>
                                <p className="font-bold text-slate-400">{slot}</p>
                                {equipped ? 
                                  <p className={`font-semibold ${RarityColor[equipped.rarity]}`}>{equipped.name}</p> : 
                                  <p className="text-slate-500">- Empty -</p>}
                            </div>
                        </div>
                      );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Items Panel */}
        <div className="w-1/2 flex flex-col gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
          <h2 className="text-lg font-bold uppercase tracking-wider text-amber-400">Inventory</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {inventory.length > 0 ? inventory.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-2 rounded-lg border-2 flex justify-between items-center transition-all cursor-pointer ${selectedItem?.id === item.id ? 'border-green-500 bg-green-500/10' : 'border-slate-800 hover:border-slate-600'}`}>
                <div>
                  <p className={`font-bold ${RarityColor[item.rarity]}`}>{item.name}</p>
                  <p className="text-xs text-slate-400">{item.type} - {item.rarity}</p>
                </div>
              </div>
            )) : <p className="text-center text-slate-500 pt-10">Your inventory is empty.</p>}
          </div>
           {selectedCharacter && selectedItem && (
            <div className="mt-auto pt-4 border-t border-white/5">
              <p className="text-center text-sm mb-2">Assign <span className={`font-bold ${RarityColor[selectedItem.rarity]}`}>{selectedItem.name}</span> to <span className="font-bold text-blue-400">{selectedCharacter.name}</span>?</p>
              <button 
                onClick={handleEquip}
                disabled={!selectedCharacter || !selectedItem || !('slot' in selectedItem)}
                className="w-full py-3 bg-green-600 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 transition-all">
                Equip Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
