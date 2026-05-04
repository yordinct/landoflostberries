import { 
  Sword, Shield, Wand, Zap, Flame, Droplets, Wind, Mountain, 
  Moon, Sun, Ghost, Heart, Star, Sparkles, Brain, Compass, 
  Users, Castle, Gem, Hammer, Book, Scroll, Map as MapIcon, 
  Gamepad2, Skull, Trophy, Settings, Briefcase, ChevronRight,
  Crosshair, LucideIcon
} from 'lucide-react';

export type Race = 'Human' | 'Elf' | 'Dark Elf' | 'Beastkin' | 'Dragonborn' | 'Fairy-blooded' | 'Dwarf' | 'Celestial' | 'Demonkin' | 'Ancient Bloodline';
export type Class = 'Mage' | 'Spellblade' | 'Beast Tamer' | 'Healer' | 'Assassin' | 'Knight' | 'Summoner' | 'Ranger' | 'Alchemist' | 'Necromancer' | 'Royal Strategist';
export type Element = 'Fire' | 'Water' | 'Wind' | 'Earth' | 'Lightning' | 'Ice' | 'Light' | 'Shadow' | 'Nature' | 'Blood' | 'Spirit' | 'Time' | 'Space' | 'Gravity' | 'Beast' | 'Ancient';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Ancient';

export type Screen = 'Menu' | 'Creation' | 'Map' | 'Base' | 'Squad' | 'Bestiary' | 'Quests' | 'Combat' | 'Diplomacy' | 'Settings' | 'Slots' | 'Character' | 'Missions' | 'Oracle' | 'Guide' | 'League' | 'Event';

export type CharacterRole = 'Worker' | 'Soldier' | 'Guard' | 'Scout' | 'Unassigned';

export interface Skill {
  name: string;
  description: string;
  power?: number;
  effect?: string;
  cost?: number;
  type: 'Active' | 'Passive';
}

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
  skills: Skill[];
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
  skills: string[];
  bond: number;
  isDeployed?: boolean;
}

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
  status: 'Peace' | 'War';
  visual?: string;
}

export interface PassiveMission {
  id: string;
  name: string;
  description: string;
  duration: number; // in milliseconds
  startTime: number;
  assignedCharacterIds: string[];
  type: 'Exploration' | 'resource_gathering' | 'training';
  reward: {
    exp: number;
    gold: number;
    resources?: Record<string, number>;
  };
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
    items?: string[];
  };
}

export type BuildingType = 'Barracks' | 'Market' | 'Ancient Shrine' | 'Laboratory' | 'Wall';

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  description: string;
  bonus: string;
}

export interface OracleAdvice {
  id: string;
  topic: string;
  content: string;
  timestamp: number;
}

export interface LeagueDivision {
  captainId: string;
  subordinateIds: string[]; // IDs of beasts or other characters
}

export interface LeagueCampaign {
  id: string;
  name: string;
  type: 'War' | 'Exploration' | 'Defense' | 'Subjugation';
  difficulty: number;
  duration: number;
  startTime: number;
  assignedCaptainId: string;
  assignedSubordinateIds: string[];
  status: 'Pending' | 'In Progress' | 'Success' | 'Failed';
  failReason?: string;
  logs: string[];
  reward: string;
}

export interface PlayerState {
  player: Character;
  rightHandManId?: string;
  rightHandManEvolved?: boolean;
  baseType: 'Guild' | 'Kingdom';
  baseLevel: number;
  resources: {
    gold: number;
    food: number;
    mana: number;
    wood: number;

    stone: number;
  };
  squad: Character[]; // Full character objects for persistence
  beasts: Beast[]; // Full beast objects for persistence
  unlockedRegions: string[];
  conqueredRegions: Record<string, number>; // Region ID to Development Level
  diplomacy?: Record<string, { status: 'War' | 'Peace' | 'Alliance', relation: number, intel: number }>;
  buildings: Building[];
  activeQuests: string[];
  completedQuests: string[];
  activeMissions: PassiveMission[];
  availableMissions?: PassiveMission[];
  missionsRefreshedAt?: number;
  luck: number;
  raceExperience: Record<string, { level: number, exp: number }>;
  updatedAt: number;
  leagueDivisions?: LeagueDivision[];
  leagueCampaigns?: LeagueCampaign[];
  leagueCaptainsLog?: Record<string, string[]>;
  leagueMerit?: Record<string, number>;
}

export interface SaveSlot {
  id: number;
  data: PlayerState | null;
}
