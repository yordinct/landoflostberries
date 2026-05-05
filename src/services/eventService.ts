import { ExplorationEvent } from '../components/EventEncounter';
import { Skull, Users, Heart, Coins, Ghost, Shield, Swords } from 'lucide-react';
import { PlayerState, Quest } from '../types';

export function generateExplorationEvent(regionId: string, player: PlayerState): ExplorationEvent {
  const eventsByRegion: Record<string, typeof baseEvents> = {
    'verdant': baseEvents,
    // ... other regions
  };

  const pool = eventsByRegion[regionId] || baseEvents;
  const eventFactory = pool[Math.floor(Math.random() * pool.length)];
  return eventFactory(player);
}

const baseEvents = [
  // ... existing events (bandits, rescue, etc.)

  // REPLACEMENT FOR GENERIC RECRUIT EVENT
  (player?: PlayerState) => {
    const alreadyRecruited = player?.squad.some(c => c.id === 'unique_kaelan');
    if (alreadyRecruited) {
      // If Kaelan is already in the squad, generate a simple combat event instead.
      return {
        id: 'e_fallback_combat',
        type: 'combat',
        title: 'Wild Beast Sighting',
        description: 'A monstrous beast appears from the thicket, its eyes glowing with fury.',
        icon: Skull,
        color: 'red-500',
        choices: [
          { id: 'c1', label: 'Engage the beast', outcome: () => ({ text: 'You prepare for a tough fight.', action: 'combat' }) }
        ]
      }
    }

    return {
      id: 'e_recruit_kaelan',
      type: 'recruit',
      title: 'The Disgraced Knight',
      description: 'You come across a lone knight practicing his sword forms. His armor is battered, but his technique is flawless. He introduces himself as Sir Kaelan, a man seeking to restore his honor.',
      icon: Users,
      color: 'purple-500',
      choices: [
        {
          id: 'c1',
          label: '"Let me help you restore your honor." (Start Quest)',
          outcome: () => {
            const newQuest: Quest = {
              id: 'quest_kaelan_honor',
              title: 'The Path of Honor',
              description: 'Sir Kaelan has asked for your help to defeat a notorious bandit leader who plagues the Verdant Valley, the one who originally framed him for treason.',
              type: 'Hunt',
              status: 'Active',
              reward: { gold: 500, exp: 200, items: [{itemId: 'arm_rare_chainmail', quantity: 1}] }
            };
            return { 
              text: `"Your words give me hope," Sir Kaelan says. "Defeat the bandit leader, Groknar, in this valley, and my sword is yours." A new quest has been added.`, 
              action: 'start_quest', 
              payload: { quest: newQuest } 
            };
          }
        },
        {
          id: 'c2',
          label: '"Forget honor. Fight for me." (Requires 25 Charisma)',
          requirement: { type: 'stat', value: 25, desc: 'Requires 25+ Charisma' },
          outcome: (p: PlayerState) => {
            if ((p.player.stats.cha || 0) >= 25 && (p.resources.gold || 0) >= 500) {
              return { 
                text: `Sir Kaelan considers your offer. "You have a commanding presence. Very well, I will join you, for now."`, 
                action: 'recruit_character', 
                payload: { 
                  character: { 
                    id: 'unique_kaelan', name: 'Sir Kaelan', race: 'Human', class: 'Knight', affinity: 'Light', level: 5, exp: 0, 
                    stats: { hp: 150, maxHp: 150, mp: 50, maxMp: 50, str: 15, int: 8, def: 12, spd: 10, cha: 12 }, 
                    personality: 'Honorable', backstory: 'A disgraced knight seeking redemption.', loyalty: 40, role: 'Unassigned'
                  },
                  cost: 500
                }
              };
            }
            return { text: `"My honor is not for sale, and you lack the presence to command me," he scoffs.`, action: 'ignore' };
          }
        },
        {
          id: 'c3',
          label: '"Prove your worth in a duel!" (Combat)',
          outcome: () => ({
            text: 'Sir Kaelan smiles grimly. "A duel? An honorable request. Draw your sword!"',
            action: 'combat',
            payload: {
              enemies: [{
                id: 'unique_kaelan_duel', name: 'Sir Kaelan', level: 5, stats: { hp: 150, maxHp: 150, mp: 50, maxMp: 50, str: 15, int: 8, def: 12, spd: 10 },
                // On win, this payload is used to recruit him
                win_payload: {
                  action: 'recruit_character', 
                  payload: { 
                    character: { 
                      id: 'unique_kaelan', name: 'Sir Kaelan', race: 'Human', class: 'Knight', affinity: 'Light', level: 5, exp: 0, 
                      stats: { hp: 150, maxHp: 150, mp: 50, maxMp: 50, str: 15, int: 8, def: 12, spd: 10, cha: 12 },
                      personality: 'Honorable', backstory: 'A disgraced knight seeking redemption.', loyalty: 70, role: 'Unassigned'
                    }
                  }
                }
              }],
              is_duel: true // Special flag for combat system
            }
          })
        },
        {
          id: 'c4',
          label: 'Leave him to his training.',
          outcome: () => ({ text: 'You give the knight a nod of respect and continue on your way.', action: 'ignore' })
        }
      ]
    } as ExplorationEvent;
  }
];
