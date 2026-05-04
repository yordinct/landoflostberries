import { ExplorationEvent } from '../components/EventEncounter';
import { Skull, Users, Heart, Coins, Ghost, Shield } from 'lucide-react';
import { PlayerState } from '../types';

export function generateExplorationEvent(regionId: string, player: PlayerState): ExplorationEvent {
  const eventsByRegion: Record<string, typeof baseEvents> = {
    'verdant': baseEvents,
    'arid': aridEvents,
    'frozen': frozenEvents,
  };

  const pool = eventsByRegion[regionId] || baseEvents;
  const eventFactory = pool[Math.floor(Math.random() * pool.length)];
  return eventFactory(player);
}

const baseEvents = [
  (player?: PlayerState) => ({
    id: 'e1',
    type: 'combat',
    title: 'Bandits on the Old Road',
    description: 'A group of rugged bandits blocks your path. They demand your gold or your life. The local village will suffer if they are left unchecked.',
    icon: Skull,
    color: 'red-500',
    choices: [
      {
        id: 'c1',
        label: 'Fight the bandits',
        outcome: () => ({ text: 'You draw your weapons. The bandits sneer and charge at you.', action: 'combat' })
      },
      {
        id: 'c2',
        label: 'Intimidate them to leave',
        requirement: { type: 'stat', value: 20, desc: 'Requires 20+ Player Strength' },
        outcome: (p: PlayerState) => {
          if (p.player.stats.str >= 20) {
            return { text: 'You flare your aura. The bandits realize they are outmatched and scatter in terror.', action: 'flee_success', payload: { rep: 2, xp: 50 } };
          }
          return { text: 'They laugh at your attempt to intimidate them. "Get them!"', action: 'combat' };
        }
      },
      {
         id: 'c3',
         label: 'Pay the toll (100 Gold)',
         outcome: (p: PlayerState) => {
           if ((p.resources.gold || 0) >= 100) {
             return { text: 'You toss them a pouch of coins. They let you pass, but the villagers will hear of your cowardice.', action: 'pay_toll', payload: { cost: 100 } };
           }
           return { text: 'You do not have enough gold! The bandits attack!', action: 'combat' };
         }
      }
    ]
  } as ExplorationEvent),
  (player?: PlayerState) => ({
    id: 'e2',
    type: 'rescue',
    title: 'The Captured Traveler',
    description: 'You spot a makeshift cage guarded by a few goblin scavengers. Inside, a terrified traveler is begging for help.',
    icon: Heart,
    color: 'emerald-500',
    choices: [
      {
        id: 'c1',
        label: 'Ambush the goblins',
        outcome: () => ({ text: 'You strike from the shadows. The battle begins!', action: 'combat' })
      },
      {
        id: 'c2',
        label: 'Ignore and walk away',
        outcome: () => ({ text: 'You decide this is not your problem and step back into the woods. The traveler\'s cries fade away.', action: 'ignore' })
      }
    ]
  } as ExplorationEvent),
  (player?: PlayerState) => ({
    id: 'e3',
    type: 'pet',
    title: 'The Injured Ember Fox',
    description: 'You find a small fox with a coat of smoldering embers. It\'s caught in a hunter\'s snare, whining softly. Its flames are sputtering out.',
    icon: Ghost,
    color: 'amber-500',
    choices: [
      {
        id: 'c1',
        label: 'Carefully free and heal it',
        outcome: () => ({ text: 'You soothe the fox as you remove the snare and apply healing magic. It nuzzles your hand, forming a bond!', action: 'tame_pet', payload: { species: 'Ember Fox', rarity: 'Rare', element: 'Fire', skills: ['Ember Dash'] } })
      },
      {
        id: 'c2',
        label: 'Kill it for its pelt',
        outcome: () => ({ text: 'You brutally end its suffering. You gained some resources, but at what moral cost?', action: 'kill_pet', payload: { gold: 50, food: 100 } })
      }
    ]
  } as ExplorationEvent),
  (player?: PlayerState) => ({
    id: 'e4',
    type: 'spirit',
    title: 'The Forgotten Shrine',
    description: 'A moss-covered shrine pulses with ancient wind magic. A faint spectral figure, Vaelis the Wind Spirit, manifests before you.',
    icon: Shield,
    color: 'blue-500',
    choices: [
      {
        id: 'c1',
        label: 'Offer respect and form a contract',
        outcome: () => ({ text: 'Vaelis accepts your respectful approach. "I shall guide your path," the spirit whispers.', action: 'contract_spirit', payload: { name: 'Vaelis', rarity: 'Epic', element: 'Wind', skills: ['Gale Force (Passive)', 'Tailwind'] } })
      },
      {
        id: 'c2',
        label: 'Demand its power',
        outcome: () => ({ text: 'The spirit becomes enraged by your arrogance! It unleashes a violent storm!', action: 'combat' })
      }
    ]
  } as ExplorationEvent),
  (playerState?: PlayerState) => {
    let names = ['Thalor', 'Elara', 'Grimnir', 'Sylas', 'Lyra', 'Kaelen', 'Vanya', 'Darius', 'Maeve', 'Gideon', 'Rook', 'Isolde', 'Alden', 'Caelum', 'Seraphina', 'Theron', 'Eliana', 'Brakar', 'Soren', 'Valerius', 'Mira'];
    if (playerState?.squad) {
       const existingNames = playerState.squad.map(s => s.name);
       const filtered = names.filter(n => !existingNames.includes(n));
       if (filtered.length > 0) names = filtered;
    }

    const races = ['Human', 'Elf', 'Orc', 'Dwarf', 'Dragonkin'];
    const classes = ['Knight', 'Mage', 'Rogue', 'Cleric', 'Ranger'];
    const elements = ['Fire', 'Water', 'Wind', 'Earth', 'Light', 'Dark', 'Lightning', 'Normal'];
    
    const hName = names[Math.floor(Math.random() * names.length)];
    const hRace = races[Math.floor(Math.random() * races.length)];
    const hClass = classes[Math.floor(Math.random() * classes.length)];
    const hElement = elements[Math.floor(Math.random() * elements.length)];
    const rLevel = Math.floor(Math.random() * 5) + 1;

    return {
      id: 'e5',
      type: 'recruit',
      title: 'A Wandering Traveler',
      description: `You spot a weary ${hRace} ${hClass} setting up camp. They look exhausted from their travels, but their aura is undeniable.`,
      icon: Users,
      color: 'purple-500',
      choices: [
        {
          id: 'c1',
          label: 'Offer them food and a place in your order',
          outcome: (p: PlayerState) => {
             if ((p.resources.food || 0) >= 50) {
               return { text: `They gratefully accept the food and agree to join your journey. Welcome, ${hName}!`, action: 'recruit_character', payload: { name: hName, race: hRace, class: hClass, element: hElement, level: rLevel } };
             }
             return { text: 'You try to offer food, but realize your provisions are lacking. They sigh and ignore you.', action: 'flee_success' };
          }
        },
        {
          id: 'c2',
          label: 'Leave them alone',
          outcome: () => ({ text: 'You respect their privacy and move on. Perhaps you will meet again.', action: 'ignore' })
        }
      ]
    } as ExplorationEvent;
  },
  (player?: PlayerState) => ({
    id: 'e6',
    type: 'rescue',
    title: 'Village Under Siege',
    description: 'A dark plume of smoke rises above the treeline. You hear cries for help as corrupted wolves break through the village defenses.',
    icon: Shield,
    color: 'orange-500',
    choices: [
      {
        id: 'c1',
        label: 'Charge into battle to save the village',
        outcome: () => ({ text: 'You draw your weapons and charge down the hill, screaming a war cry!', action: 'combat' })
      },
      {
        id: 'c2',
        label: 'Observe and plot an ambush',
        requirement: { type: 'stat', value: 15, desc: 'Requires 15+ INT for Tactical Ambush' },
        outcome: (p: PlayerState) => {
           if (p.player.stats.int >= 15) {
             return { text: 'Your brilliant tactical ambush catches them off guard! (The villagers are so grateful they give you extra loot!)', action: 'combat' };
           }
           return { text: 'Your hesitation backfires. The wolves spot you first and attack!', action: 'combat' };
        }
      }
    ]
  } as ExplorationEvent)
];

const aridEvents = baseEvents; // Placeholder for now
const frozenEvents = baseEvents; // Placeholder for now
