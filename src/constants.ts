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

export const RACE_DATA: any = {
    'Human': { statBonus: { cha: 5, str: 2 }, ability: { name: 'Rally', description: 'Increases ally STR.'}},
    'Elf': { statBonus: { int: 5, spd: 2 }, ability: { name: 'Meditate', description: 'Restores mana.'}},
    // ... other races
};

export const REGIONS: Region[] = [
    {
        id: 'verdant',
        name: 'Verdant Valley',
        description: 'A lush valley teeming with life.',
        difficulty: 1,
        requiredLevel: 1,
        unlocked: true,
        enemies: ['Slime', 'Wild Wolf'],
        resources: ['Food', 'Wood'],
        isConquered: false,
        status: 'Neutral',
        visual: 'https://images.unsplash.com/photo-1444464666168-49d633b86797'
    },
    // ... other regions
];

export const RECRUITABLE_CHARACTERS: Character[] = [
    // ... characters available for recruitment
];

export const INITIAL_BEASTS: Beast[] = [
    // ... initial beasts
];
