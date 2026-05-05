import { Element } from './types';

export const ELEMENTAL_CHART: Record<Element, { strongAgainst: Element[], weakAgainst: Element[] }> = {
  'Fire': { strongAgainst: ['Nature', 'Ice'], weakAgainst: ['Water', 'Earth'] },
  'Water': { strongAgainst: ['Fire', 'Earth'], weakAgainst: ['Lightning', 'Ice'] },
  'Wind': { strongAgainst: ['Earth', 'Lightning'], weakAgainst: ['Fire', 'Ice'] },
  'Earth': { strongAgainst: ['Lightning', 'Fire'], weakAgainst: ['Wind', 'Water'] },
  'Lightning': { strongAgainst: ['Water', 'Wind'], weakAgainst: ['Earth', 'Nature'] },
  'Ice': { strongAgainst: ['Wind', 'Water'], weakAgainst: ['Fire', 'Lightning'] },
  'Nature': { strongAgainst: ['Earth', 'Lightning'], weakAgainst: ['Fire', 'Ice'] },
  'Light': { strongAgainst: ['Shadow', 'Blood'], weakAgainst: ['Spirit', 'Ancient'] },
  'Shadow': { strongAgainst: ['Light', 'Spirit'], weakAgainst: ['Celestial' as any, 'Blood'] },
  'Blood': { strongAgainst: ['Nature', 'Human' as any], weakAgainst: ['Light', 'Fire'] },
  'Spirit': { strongAgainst: ['Shadow', 'Ancient'], weakAgainst: ['Light', 'Time'] },
  'Time': { strongAgainst: ['Space', 'Gravity'], weakAgainst: ['Ancient', 'Spirit'] },
  'Space': { strongAgainst: ['Gravity', 'Time'], weakAgainst: ['Ancient', 'Spirit'] },
  'Gravity': { strongAgainst: ['Space', 'Time'], weakAgainst: ['Ancient', 'Spirit'] },
  'Ancient': { strongAgainst: ['Light', 'Shadow', 'Time', 'Space', 'Gravity'], weakAgainst: [] },
  'Beast': { strongAgainst: ['Nature'], weakAgainst: ['Blood', 'Ancient'] }
};
