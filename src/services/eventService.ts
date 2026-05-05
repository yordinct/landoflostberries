import { Users } from 'lucide-react';
import { GameEvent, Quest, Character } from '../types';

// This function will eventually generate random events.
// For now, it returns a specific, well-defined event for development.
export const getEvent = (playerLevel: number): GameEvent | null => {
  // For now, let's always trigger the Sir Kaelan event for testing.
  // In the future, we can add logic like: if (playerLevel > 3 && Math.random() < 0.1)
  
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
            reward: { gold: 500, exp: 200, items: [{itemId: 'arm_003', quantity: 1}] } // arm_003 is Iron Chainmail
          };
          return {
            text: 'Sir Kaelan nods. "If you are true to your word, find me when you have dealt with the bandit leader. I will be indebted to you."',
            action: 'add_quest',
            payload: newQuest
          };
        }
      },
      {
        id: 'c2',
        label: '"I have a place for a man of your talents. Name your price." (Hire)',
        outcome: (player) => {
          if (player.resources.gold >= 500) {
            return {
              text: '"For 500 gold, my sword is yours."',
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
          return { text: '"You do not have the coin to afford my services," he says, turning away.', action: 'ignore' };
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
        label: '"Good luck to you." (Leave)',
        outcome: () => ({
          text: 'The knight gives you a curt nod as you walk away.',
          action: 'ignore'
        })
      }
    ]
  };
};
