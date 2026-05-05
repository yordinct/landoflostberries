import { 
  Sword, Shield, Wand, Zap, Flame, Droplets, Wind, Mountain, 
  Moon, Sun, Ghost, Heart, Star, Sparkles, Brain, Compass, 
  Users, Castle, Gem, Hammer, Book, Scroll, Map as MapIcon, 
  Gamepad2, Skull, Trophy, Settings, Briefcase, ChevronRight,
  Crosshair, LucideIcon
} from 'lucide-react';

// --- CORE ENUMS ---
export type Race = 'Human' | 'Elf' | 'Dark Elf' | 'Beastkin' | 'Dragonborn' | 'Fairy-blooded' | 'Dwarf' | 'Celestial' | 'Demonkin' | 'Ancient Bloodline';
export type Class = 'Mage' | 'Spellblade' | 'Beast Tamer' | 'Healer' | 'Assassin' | 'Knight' | 'Summoner' | 'Ranger' | 'Alchemist' | 'Necromancer' | 'Royal Strategist';
export type Element = 'Fire' | 'Water' | 'Wind' | 'Earth' | 'Lightning' | 'Ice' | 'Light' | 'Shadow' | 'Nature' | 'Blood' | 'Spirit' | 'Time' | 'Space' | 'Gravity' | 'Beast' | 'Ancient';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Ancient';
export type Screen = 'Menu' | 'Creation' | 'Map' | 'Base' | 'Squad' | 'Bestiary' | 'Quests' | 'Combat' | 'Diplomacy' | 'Settings' | 'Slots' | 'Character' | 'Missions' | 'Oracle' | 'Guide' | 'League' | 'Event' | 'Inventory';
export type CharacterRole = 'Worker' | 'Soldier' | 'Guard' | 'Scout' | 'Unassigned';

// --- COMBAT & SKILLS ---
export interface StatusEffect {
  type: 'Poison' | 'Stun' | 'ArmorBreak' | 'AttackUp' | 'DefenseUp' | 'EvasionUp';
  duration: number;
  value?: number;
}

export interface Skill {
  name: string;
  description: string;
  manaCost: number;
  effect: {
    type: 'Damage' | 'Heal' | 'Buff' | 'Debuff' | 'Stun' | 'Summon';
    value?: number;
    stat?: 'str' | 'def' | 'int' | 'spd' | 'cha';
    duration?: number;
    target: 'Self' | 'Enemy' | 'AllAllies' | 'AllEnemies' | 'Ally';
  };
}

// --- INVENTORY & ITEMS (NEW) ---
export type ItemType = 'Weapon' | 'Armor' | 'Accessory' | 'Consumable' | 'Material' | 'Quest';
export type EquipmentSlot = 'Weapon' | 'Armor' | 'Accessory';

interface BaseItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: Rarity;
  icon?: string; // e.g., name of a Lucide icon
}

export interface Equipment extends BaseItem {
  type: 'Weapon' | 'Armor' | 'Accessory';
  slot: EquipmentSlot;
  stats: Partial<Character['stats']>;
}

export interface Consumable extends BaseItem {
  type: 'Consumable';
  effect: {
    type: 'HealHP' | 'HealMP' | 'CureStatus';
    value?: number;
  };
}

export interface Material extends BaseItem {
  type: 'Material';
}

export interface QuestItem extends BaseItem {
  type: 'Quest';
}

export type Item = Equipment | Consumable | Material | QuestItem;

// --- CHARACTERS & FACTION ---
export interface Character {
  id: string;
  name: string;
  race: Race;
  class: Class;
  affinity: Element;
  level: number;
  exp: number;
  unspentStatPoints?: number;
  isHeroEvolved?: boolean;
  stats: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    str: number;
    int: number;
    def: number;
    spd: number;
    cha: number;
  };
  equipment?: {
    weapon?: string; // Item ID
    armor?: string; // Item ID
    accessory?: string; // Item ID
  };
  effects?: StatusEffect[];
  personality: string;
  backstory: string;
  loyalty: number;
  role: CharacterRole;
  isAssignedToMission?: boolean;
  equippedBeastId?: string;
}

export interface Beast {
  id: string;
  name: string;
  species: string;
  element: Element;
  rarity: Rarity;
  level: number;
  exp?: number;
  stats: {
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    spd: number;
  };
  skills: Skill[];
  bond: number;
  isDeployed?: boolean;
  effects?: StatusEffect[];
}

// --- WORLD & PROGRESSION ---
export interface Region {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  requiredLevel: number;
  unlocked: boolean;
  enemies: string[];
  resources: string[];
  isConquered: boolean;
  status: 'Peace' | 'War' | 'Neutral' | 'Ally';
  visual?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'Main' | 'Side' | 'Hunt' | 'Recruit';
  status: 'Available' | 'Active' | 'Completed';
  reward: {
    gold: number;
    exp: number;
    items?: (Item | { itemId: string, quantity: number })[]; // Can be full items or references
  };
}

export type BuildingType = 'Barracks' | 'Market' | 'Ancient Shrine' | 'Laboratory' | 'Wall' | 'Tavern' | 'Blacksmith' | 'Academy';

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  description: string;
  bonus: string;
}

// --- PLAYER STATE ---
export interface PlayerState {
  player: Character;
  rightHandManId?: string;
  baseType: 'Guild' | 'Kingdom' | 'Order' | 'Clan';
  baseLevel: number;
  resources: {
    gold: number;
    food: number;
    mana: number;
    wood: number;
    stone: number;
  };
  inventory?: Item[]; // NEW
  squad: Character[];
  beasts: Beast[];
  unlockedRegions: string[];
  conqueredRegions: Record<string, number>;
  diplomacy?: Record<string, { status: 'War' | 'Peace' | 'Alliance', relation: number, intel: number }>;
  buildings: Building[];
  activeQuests: string[];
  completedQuests: string[];
  activeMissions: any[]; // Define properly if needed
  luck: number;
  raceExperience: Record<string, { level: number, exp: number }>;
  updatedAt: number;
  leagueDivisions?: any[]; // Define properly if needed
}

export interface SaveSlot {
  id: number;
  data: PlayerState | null;
}
