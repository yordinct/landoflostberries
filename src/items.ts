import { Item } from './types';

export const ITEMS_DATABASE: Item[] = [
  // --- WEAPONS ---
  {
    id: 'weap_001',
    name: 'Rusty Sword',
    description: 'An old, worn sword. Better than nothing.',
    type: 'Weapon',
    slot: 'Weapon',
    rarity: 'Common',
    icon: 'Sword',
    stats: { str: 2, spd: -1 }
  },
  {
    id: 'weap_002',
    name: 'Apprentice Staff',
    description: 'A basic staff for channeling simple magic.',
    type: 'Weapon',
    slot: 'Weapon',
    rarity: 'Common',
    icon: 'Wand',
    stats: { int: 3 }
  },
  {
    id: 'weap_003',
    name: 'Iron Longsword',
    description: 'A sturdy and reliable longsword.',
    type: 'Weapon',
    slot: 'Weapon',
    rarity: 'Uncommon',
    icon: 'Sword',
    stats: { str: 5, def: 1 }
  },

  // --- ARMOR ---
  {
    id: 'arm_001',
    name: 'Leather Jerkin',
    description: 'Simple armor made from cured leather.',
    type: 'Armor',
    slot: 'Armor',
    rarity: 'Common',
    icon: 'Shirt',
    stats: { def: 3, spd: 1 }
  },
  {
    id: 'arm_002',
    name: 'Mage Robes',
    description: 'Robes that offer magical protection and enhance mana flow.',
    type: 'Armor',
    slot: 'Armor',
    rarity: 'Common',
    icon: 'Shirt',
    stats: { def: 1, int: 2, maxMp: 10 }
  },
  {
    id: 'arm_003',
    name: 'Iron Chainmail',
    description: 'Heavy chainmail that offers good protection.',
    type: 'Armor',
    slot: 'Armor',
    rarity: 'Uncommon',
    icon: 'Shirt',
    stats: { def: 6, spd: -2 }
  },

  // --- ACCESSORIES ---
  {
    id: 'acc_001',
    name: 'Minor Ring of Strength',
    description: 'A small ring that slightly boosts the wearer\'s strength.',
    type: 'Accessory',
    slot: 'Accessory',
    rarity: 'Uncommon',
    icon: 'Circle',
    stats: { str: 2 }
  },
  {
    id: 'acc_002',
    name: 'Pendant of Warding',
    description: 'A protective charm that slightly increases defense.',
    type: 'Accessory',
    slot: 'Accessory',
    rarity: 'Uncommon',
    icon: 'Shield',
    stats: { def: 2 }
  },
  
  // --- CONSUMABLES ---
  {
    id: 'cons_001',
    name: 'Minor Healing Potion',
    description: 'A common potion that restores a small amount of health.',
    type: 'Consumable',
    rarity: 'Common',
    icon: 'GlassWater',
    effect: { type: 'HealHP', value: 50 }
  },

  // --- MATERIALS ---
  {
    id: 'mat_001',
    name: 'Wolf Pelt',
    description: 'The pelt of a wild wolf, useful for crafting.',
    type: 'Material',
    rarity: 'Common',
    icon: 'Square',
  }
];
