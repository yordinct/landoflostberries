import { Race, Class, Element, Rarity, Region, Beast, Character } from './types';
import { 
  Sword, Shield, Wand, Zap, Flame, Droplets, Wind, Mountain, 
  Moon, Sun, Ghost, Heart, Star, Sparkles, Brain, Compass, 
  Users, Castle, Gem, Hammer, Book, Scroll, Map as MapIcon, 
  Gamepad2, Skull, Trophy, Settings, Briefcase, ChevronRight, Target,
  Crosshair, LucideIcon, Snowflake, Leaf, Droplet, Clock, Orbit, MoveDown, Dog, History
} from 'lucide-react';

export const RACES: Race[] = ['Human', 'Elf', 'Dark Elf', 'Beastkin', 'Dragonborn', 'Fairy-blooded', 'Dwarf', 'Celestial', 'Demonkin', 'Ancient Bloodline'];
export const CLASSES: Class[] = ['Mage', 'Spellblade', 'Beast Tamer', 'Healer', 'Assassin', 'Knight', 'Summoner', 'Ranger', 'Alchemist', 'Necromancer', 'Royal Strategist'];
export const AFFINITIES: Element[] = ['Fire', 'Water', 'Wind', 'Earth', 'Lightning', 'Ice', 'Light', 'Shadow', 'Nature', 'Blood', 'Spirit', 'Time', 'Space', 'Gravity', 'Beast', 'Ancient'];

export const RACE_VISUALS: Record<Race, { bg: string; color: string }> = {
  'Human': { bg: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop', color: 'bg-orange-500' },
  'Elf': { bg: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2694&auto=format&fit=crop', color: 'bg-emerald-500' },
  'Dark Elf': { bg: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2694&auto=format&fit=crop', color: 'bg-purple-600' },
  'Beastkin': { bg: 'https://images.unsplash.com/photo-1614027126214-e51f5c667086?q=80&w=2694&auto=format&fit=crop', color: 'bg-amber-600' },
  'Dragonborn': { bg: 'https://images.unsplash.com/photo-1542640244-7e672d6cef21?q=80&w=2694&auto=format&fit=crop', color: 'bg-red-600' },
  'Fairy-blooded': { bg: 'https://images.unsplash.com/photo-1447069387593-a5de0862081d?q=80&w=2694&auto=format&fit=crop', color: 'bg-pink-400' },
  'Dwarf': { bg: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2684&auto=format&fit=crop', color: 'bg-stone-500' },
  'Celestial': { bg: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=2694&auto=format&fit=crop', color: 'bg-sky-400' },
  'Demonkin': { bg: 'https://images.unsplash.com/photo-1517594422361-5eeb8ae275a9?q=80&w=2694&auto=format&fit=crop', color: 'bg-rose-900' },
  'Ancient Bloodline': { bg: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2694&auto=format&fit=crop', color: 'bg-indigo-900' }
};

export const CLASS_VISUALS: Record<Class, { icon: LucideIcon }> = {
  'Mage': { icon: Wand },
  'Spellblade': { icon: Sword },
  'Beast Tamer': { icon: Ghost },
  'Healer': { icon: Heart },
  'Assassin': { icon: Target },
  'Knight': { icon: Shield },
  'Summoner': { icon: Zap },
  'Ranger': { icon: Crosshair },
  'Alchemist': { icon: Sparkles },
  'Necromancer': { icon: Skull },
  'Royal Strategist': { icon: Brain }
};

export const ELEMENT_VISUALS: Record<Element, { icon: LucideIcon; color: string }> = {
  'Fire': { icon: Flame, color: 'text-orange-500' },
  'Water': { icon: Droplets, color: 'text-blue-500' },
  'Wind': { icon: Wind, color: 'text-emerald-400' },
  'Earth': { icon: Mountain, color: 'text-amber-800' },
  'Lightning': { icon: Zap, color: 'text-yellow-400' },
  'Ice': { icon: Snowflake, color: 'text-sky-300' },
  'Light': { icon: Sun, color: 'text-amber-200' },
  'Shadow': { icon: Moon, color: 'text-slate-900' },
  'Nature': { icon: Leaf, color: 'text-green-600' },
  'Blood': { icon: Droplet, color: 'text-red-700' },
  'Spirit': { icon: Sparkles, color: 'text-purple-400' },
  'Time': { icon: Clock, color: 'text-indigo-400' },
  'Space': { icon: Orbit, color: 'text-violet-500' },
  'Gravity': { icon: MoveDown, color: 'text-slate-700' },
  'Beast': { icon: Dog, color: 'text-orange-800' },
  'Ancient': { icon: History, color: 'text-stone-400' }
};

export const RACE_DATA: Record<Race, { ability: { name: string, description: string }, statBonus: Partial<Character['stats']> }> = {
  'Human': { 
    ability: { name: 'Versatility', description: 'Gains 15% more EXP and +10% Gold from quests.' }, 
    statBonus: { hp: 10, maxHp: 10, str: 2, int: 2, def: 2, spd: 2, cha: 5 } 
  },
  'Elf': { 
    ability: { name: 'Mana Attunement', description: 'Spells cost 30% less Mana and deal +15% damage.' }, 
    statBonus: { mp: 30, maxMp: 30, int: 8, spd: 4, def: -2, str: -2 } 
  },
  'Dark Elf': { 
    ability: { name: 'Shadow Stalker', description: 'Increases Evasion by 20% and Crit Rate by 10%.' }, 
    statBonus: { spd: 10, int: 4, str: 2, def: -4, hp: -10 } 
  },
  'Beastkin': { 
    ability: { name: 'Feral Might', description: 'Attack power increases by 1% for every 2% HP lost.' }, 
    statBonus: { hp: 30, maxHp: 30, str: 6, spd: 6, int: -4 } 
  },
  'Dragonborn': { 
    ability: { name: 'Ancient Scale', description: 'Reduces all incoming elemental damage by 15%.' }, 
    statBonus: { hp: 50, maxHp: 50, str: 8, def: 8, spd: -5, int: 2 } 
  },
  'Fairy-blooded': { 
    ability: { name: 'Ethereal Flight', description: 'immune to ground-based status effects and high evasion.' }, 
    statBonus: { mp: 40, maxMp: 40, spd: 12, int: 6, str: -6, def: -5 } 
  },
  'Dwarf': { 
    ability: { name: 'Stone Skin', description: 'Physical damage taken reduced by 20%.' }, 
    statBonus: { hp: 40, maxHp: 40, def: 12, str: 6, spd: -8, int: -2 } 
  },
  'Celestial': { 
    ability: { name: 'Luminance', description: 'Heals the party for 5% of damage dealt with spells.' }, 
    statBonus: { mp: 50, maxMp: 50, int: 10, cha: 10, str: -5, def: -2 } 
  },
  'Demonkin': { 
    ability: { name: 'Chaos Soul', description: 'Deals 25% extra damage but loses 2% HP every turn.' }, 
    statBonus: { str: 12, int: 8, spd: 4, def: -6, cha: -10 } 
  },
  'Ancient Bloodline': { 
    ability: { name: 'Timeless Wisdom', description: 'Stats grow faster and starts with advanced skills.' }, 
    statBonus: { hp: 10, str: 4, def: 4, int: 4, spd: 4, cha: 4 } 
  }
};

export const ELEMENTAL_CHART: Record<Element, { strongAgainst: Element[], weakAgainst: Element[] }> = {
  'Fire': { strongAgainst: ['Nature', 'Ice'], weakAgainst: ['Water', 'Earth'] },
  'Water': { strongAgainst: ['Fire', 'Earth'], weakAgainst: ['Lightning', 'Ice'] },
  'Wind': { strongAgainst: ['Earth', 'Lightning'], weakAgainst: ['Fire', 'Ice'] },
  'Earth': { strongAgainst: ['Lightning', 'Fire'], weakAgainst: ['Wind', 'Water'] },
  'Lightning': { strongAgainst: ['Water', 'Wind'], weakAgainst: ['Earth', 'Nature'] },
  'Ice': { strongAgainst: ['Wind', 'Water'], weakAgainst: ['Fire', 'Lightning'] },
  'Nature': { strongAgainst: ['Earth', 'Lightning'], weakAgainst: ['Fire', 'Ice'] },
  'Light': { strongAgainst: ['Shadow', 'Blood'], weakAgainst: ['Spirit', 'Ancient'] },
  'Shadow': { strongAgainst: ['Light', 'Spirit'], weakAgainst: ['Celestial' as any, 'Blood'] }, // Using as any for potential missing types
  'Blood': { strongAgainst: ['Nature', 'Human' as any], weakAgainst: ['Light', 'Fire'] },
  'Spirit': { strongAgainst: ['Shadow', 'Ancient'], weakAgainst: ['Light', 'Time'] },
  'Time': { strongAgainst: ['Space', 'Gravity'], weakAgainst: ['Ancient', 'Spirit'] },
  'Space': { strongAgainst: ['Gravity', 'Time'], weakAgainst: ['Ancient', 'Spirit'] },
  'Gravity': { strongAgainst: ['Space', 'Time'], weakAgainst: ['Ancient', 'Spirit'] },
  'Ancient': { strongAgainst: ['Light', 'Shadow', 'Time', 'Space', 'Gravity'], weakAgainst: [] },
  'Beast': { strongAgainst: ['Nature'], weakAgainst: ['Blood', 'Ancient'] }
};

export const REGIONS: Region[] = [
  { id: 'verdant', name: 'Verdant Kingdom', description: 'A lush green area where beginners start.', difficulty: 1, requiredLevel: 1, unlocked: true, enemies: ['Slime', 'Goblin'], resources: ['Wood', 'Food'], isConquered: true, status: 'Peace', visual: 'https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=2070&auto=format&fit=crop' },
  { id: 'ashen', name: 'Ashen Desert', description: 'Scorching sands filled with ancient mysteries.', difficulty: 5, requiredLevel: 5, unlocked: false, enemies: ['Sand Worm', 'Mummy'], resources: ['Stone', 'Gold'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1509316785289-025f54246b21?q=80&w=2670&auto=format&fit=crop' },
  { id: 'moonlit', name: 'Moonlit Forest', description: 'A mystical forest under perpetual moonlight.', difficulty: 10, requiredLevel: 12, unlocked: false, enemies: ['Shadow Panther', 'Will-o-Wisp'], resources: ['Mana Crystals', 'Wood'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop' },
  { id: 'crystal', name: 'Crystal Lake', description: 'Prismatic waters reflecting pure arcane energy.', difficulty: 15, requiredLevel: 20, unlocked: false, enemies: ['Water Sprite', 'Crystal Crab'], resources: ['Mana Crystals', 'Water'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2670&auto=format&fit=crop' },
  { id: 'frozen', name: 'Frozen North', description: 'Unforgiving cold and ancient frost beasts.', difficulty: 20, requiredLevel: 30, unlocked: false, enemies: ['Ice Golem', 'Frost Wolf'], resources: ['Ice Crystals', 'Iron'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1453396450673-3fe83d2db2c4?q=80&w=2574&auto=format&fit=crop' },
  { id: 'dragon', name: 'Dragon Peaks', description: 'Highest mountains where dragons dwell.', difficulty: 25, requiredLevel: 45, unlocked: false, enemies: ['Wyvern', 'Drake'], resources: ['Stone', 'Beast Essence'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1533167649158-6d508895b980?q=80&w=2232&auto=format&fit=crop' },
  { id: 'ruined', name: 'Ruined Empire', description: 'The remains of a forgotten civilization.', difficulty: 30, requiredLevel: 60, unlocked: false, enemies: ['Automaton', 'Ghost Knight'], resources: ['Old Relics', 'Arcane Dust'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2694&auto=format&fit=crop' },
  { id: 'floating', name: 'Floating Isles', description: 'Islands suspended in the sky by magic.', difficulty: 40, requiredLevel: 80, unlocked: false, enemies: ['Sky Ray', 'Harpy'], resources: ['Cloud Ore', 'Spirit Essence'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=2694&auto=format&fit=crop' }
  ,{ id: 'abyssal', name: 'Abyssal Trench', description: 'Deep underwater kingdom ruled by horrors.', difficulty: 35, requiredLevel: 50, unlocked: false, enemies: ['Kraken', 'Deep One'], resources: ['Abyssal Pearl', 'Water'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1518020353110-530467fb37cd?q=80&w=2670&auto=format&fit=crop' },
  { id: 'sunken', name: 'Sunken City', description: 'Ruins of a prosperous merchant city.', difficulty: 18, requiredLevel: 25, unlocked: false, enemies: ['Drowned', 'Siren'], resources: ['Gold', 'Ancient Relic'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=2670&auto=format&fit=crop' },
  { id: 'iron', name: 'Iron Citadel', description: 'A militaristic state built on perpetual war.', difficulty: 50, requiredLevel: 90, unlocked: false, enemies: ['Iron Golem', 'Steel Knight'], resources: ['Iron', 'Steel'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1533167649158-6d508895b980?q=80&w=2232&auto=format&fit=crop' },
  { id: 'silent', name: 'Silent Peaks', description: 'Monasteries abandoned by gods.', difficulty: 12, requiredLevel: 15, unlocked: false, enemies: ['Gargoyle', 'Cultist'], resources: ['Stone', 'Faith'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop' },
  { id: 'crimson', name: 'Crimson Plains', description: 'Fields stained by constant battles.', difficulty: 22, requiredLevel: 35, unlocked: false, enemies: ['Orc Warlord', 'Blood Mage'], resources: ['Food', 'Blood Stone'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1509316785289-025f54246b21?q=80&w=2670&auto=format&fit=crop' },
  { id: 'whispering', name: 'Whispering Woods', description: 'Forest that drives men mad.', difficulty: 28, requiredLevel: 40, unlocked: false, enemies: ['Treant', 'Banshee'], resources: ['Wood', 'Spirit Wood'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2670&auto=format&fit=crop' },
  { id: 'radiant', name: 'Radiant Spire', description: 'Seat of the divine order.', difficulty: 60, requiredLevel: 100, unlocked: false, enemies: ['Angel', 'Paladin'], resources: ['Light Crystal', 'Gold'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2694&auto=format&fit=crop' },
  { id: 'shadow', name: 'Shadow Realm', description: 'Where all light dies.', difficulty: 80, requiredLevel: 120, unlocked: false, enemies: ['Shadow Lord', 'Nightmare'], resources: ['Dark Matter', 'Void Core'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop' }
];

export const RECRUITABLE_CHARACTERS: Character[] = [
  { id: 'c1', name: 'Luna', race: 'Elf', class: 'Mage', affinity: 'Wind', level: 3, exp: 0, stats: { hp: 40, maxHp: 40, mp: 60, maxMp: 60, str: 5, int: 15, def: 5, spd: 10, cha: 8 }, personality: 'Reserved', backstory: 'A scholar searching for forbidden knowledge.', loyalty: 50, role: 'Unassigned' },
  { id: 'c2', name: 'Kael', race: 'Human', class: 'Knight', affinity: 'Earth', level: 4, exp: 0, stats: { hp: 80, maxHp: 80, mp: 20, maxMp: 20, str: 15, int: 5, def: 15, spd: 5, cha: 10 }, personality: 'Brave', backstory: 'A former soldier seeking a new purpose.', loyalty: 60, role: 'Unassigned' }
];

export const INITIAL_BEASTS: Beast[] = [
  { id: 'b1', name: 'Ignis', species: 'Fire Fox', element: 'Fire', rarity: 'Uncommon', level: 5, stats: { hp: 50, maxHp: 50, atk: 15, def: 5, spd: 12 }, skills: ['Ember', 'Quick Attack'], bond: 20 },
  { id: 'b2', name: 'Aqua', species: 'Water Serpent', element: 'Water', rarity: 'Rare', level: 8, stats: { hp: 80, maxHp: 80, atk: 12, def: 15, spd: 8 }, skills: ['Water Gun', 'Coil'], bond: 10 }
];
