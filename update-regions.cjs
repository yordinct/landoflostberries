import { Region } from './types';

// Let's add extra regions to constants
const fs = require('fs');
let data = fs.readFileSync('src/constants.ts', 'utf8');

const additionalRegions = `
  { id: 'abyssal', name: 'Abyssal Trench', description: 'Deep underwater kingdom ruled by horrors.', difficulty: 35, requiredLevel: 50, unlocked: false, enemies: ['Kraken', 'Deep One'], resources: ['Abyssal Pearl', 'Water'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1518020353110-530467fb37cd?q=80&w=2670&auto=format&fit=crop' },
  { id: 'sunken', name: 'Sunken City', description: 'Ruins of a prosperous merchant city.', difficulty: 18, requiredLevel: 25, unlocked: false, enemies: ['Drowned', 'Siren'], resources: ['Gold', 'Ancient Relic'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=2670&auto=format&fit=crop' },
  { id: 'iron', name: 'Iron Citadel', description: 'A militaristic state built on perpetual war.', difficulty: 50, requiredLevel: 90, unlocked: false, enemies: ['Iron Golem', 'Steel Knight'], resources: ['Iron', 'Steel'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1533167649158-6d508895b980?q=80&w=2232&auto=format&fit=crop' },
  { id: 'silent', name: 'Silent Peaks', description: 'Monasteries abandoned by gods.', difficulty: 12, requiredLevel: 15, unlocked: false, enemies: ['Gargoyle', 'Cultist'], resources: ['Stone', 'Faith'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop' },
  { id: 'crimson', name: 'Crimson Plains', description: 'Fields stained by constant battles.', difficulty: 22, requiredLevel: 35, unlocked: false, enemies: ['Orc Warlord', 'Blood Mage'], resources: ['Food', 'Blood Stone'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1509316785289-025f54246b21?q=80&w=2670&auto=format&fit=crop' },
  { id: 'whispering', name: 'Whispering Woods', description: 'Forest that drives men mad.', difficulty: 28, requiredLevel: 40, unlocked: false, enemies: ['Treant', 'Banshee'], resources: ['Wood', 'Spirit Wood'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2670&auto=format&fit=crop' },
  { id: 'radiant', name: 'Radiant Spire', description: 'Seat of the divine order.', difficulty: 60, requiredLevel: 100, unlocked: false, enemies: ['Angel', 'Paladin'], resources: ['Light Crystal', 'Gold'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2694&auto=format&fit=crop' },
  { id: 'shadow', name: 'Shadow Realm', description: 'Where all light dies.', difficulty: 80, requiredLevel: 120, unlocked: false, enemies: ['Shadow Lord', 'Nightmare'], resources: ['Dark Matter', 'Void Core'], isConquered: false, status: 'War', visual: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop' }
];`;

data = data.replace("];\n\nexport const RECRUITABLE_CHARACTERS", ",\n" + additionalRegions + "\n\nexport const RECRUITABLE_CHARACTERS");

fs.writeFileSync('src/constants.ts', data);
console.log('Added 8 more regions');
