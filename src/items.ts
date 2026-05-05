import { Item } from './types';

export const ITEMS_DATABASE: Record<string, Item> = {
  // Weapons
  'wpn_common_sword': {
    id: 'wpn_common_sword',
    name: 'Rusted Sword',
    description: 'An old, chipped sword. Better than nothing.',
    type: 'Weapon',
    slot: 'Weapon',
    rarity: 'Common',
    icon: 'Sword',
    stats: { str: 2, spd: -1 }
  },
  'wpn_uncommon_bow': {
    id: 'wpn_uncommon_bow',
    name: 'Elven Shortbow',
    description: 'A light and accurate bow.',
    type: 'Weapon',
    slot: 'Weapon',
    rarity: 'Uncommon',
    icon: 'Crosshair',
    stats: { spd: 3, str: 3 }
  },
  'wpn_rare_staff': {
    id: 'wpn_rare_staff',
    name: 'Acolyte\'s Staff',
    description: 'A staff imbued with a faint magical essence.',
    type: 'Weapon',
    slot: 'Weapon',
    rarity: 'Rare',
    icon: 'Wand',
    stats: { int: 8, maxMp: 15 }
  },

  // Armors
  'arm_common_leather': {
    id: 'arm_common_leather',
    name: 'Leather Tunic',
    description: 'Simple leather armor.',
    type: 'Armor',
    slot: 'Armor',
    rarity: 'Common',
    icon: 'Shirt',
    stats: { def: 3, maxHp: 5 }
  },
  'arm_rare_chainmail': {
    id: 'arm_rare_chainmail',
    name: 'Knight\'s Chainmail',
    description: 'Sturdy chainmail providing excellent protection.',
    type: 'Armor',
    slot: 'Armor',
    rarity: 'Rare',
    icon: 'Shirt',
    stats: { def: 10, maxHp: 20, spd: -2 }
  },

  // Accessories
  'acc_uncommon_ring': {
    id: 'acc_uncommon_ring',
    name: 'Ring of Vitality',
    description: 'A small ring that boosts the wearer\'s life force.',
    type: 'Accessory',
    slot: 'Accessory',
    rarity: 'Uncommon',
    icon: 'Gem',
    stats: { maxHp: 25 }
  },
  'acc_epic_amulet': {
    id: 'acc_epic_amulet',
    name: 'Amulet of the Magi',
    description: 'A powerful amulet that greatly enhances magical power.',
    type: 'Accessory',
    slot: 'Accessory',
    rarity: 'Epic',
    icon: 'Gem',
    stats: { int: 15, maxMp: 30 }
  }
};
