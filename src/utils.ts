export const getCharacterRank = (level: number) => {
  if (level < 10) return 'F';
  if (level < 20) return 'E';
  if (level < 40) return 'D';
  if (level < 70) return 'C';
  if (level < 100) return 'B';
  if (level < 150) return 'A';
  if (level < 200) return 'S';
  if (level < 300) return 'SS';
  return 'SSS';
};

export const getDivisionSynergy = (captain: any, subordinates: any[], beasts: any[]) => {
  if (!captain) return { label: 'None', bonus: 0, description: 'No synergy.' };
  
  const allSubHeroes = subordinates.filter(s => s && s.race);
  if (allSubHeroes.length === 0 && beasts.length === 0) return { label: 'Lone Wolf', bonus: 1.1, description: 'Fights alone. +10% Power.' };

  const races = [captain.race, ...allSubHeroes.map(s => s.race)];
  const classes = [captain.class, ...allSubHeroes.map(s => s.class)];
  const elements = [captain.affinity, ...allSubHeroes.map(s => s.affinity), ...beasts.map(b => b.element)];
  
  const raceCounts = races.reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc; }, {} as Record<string, number>);
  const uniqueRaces = Object.keys(raceCounts).length;
  
  if (uniqueRaces === 1 && races.length >= 3) {
      return { label: 'Racial Purity', bonus: 1.25, description: 'All members share the same race. +25% Power.' };
  }
  
  if (uniqueRaces >= 4) {
      return { label: 'Diverse Alliance', bonus: 1.2, description: 'Four or more unique races. +20% Power.' };
  }
  
  const beastCount = beasts.length;
  const tamerCount = classes.filter(c => c === 'Beast Tamer').length;
  if (beastCount > 0 && tamerCount > 0) {
      return { label: 'Beast Mastery', bonus: 1.3, description: 'Beast Tamer leading beasts. +30% Power.' };
  }
  
  if (beasts.length >= 2) {
      return { label: 'Wild Pack', bonus: 1.15, description: 'Multiple beasts in division. +15% Power.' };
  }

  const elementCounts = elements.reduce((acc, e) => { acc[e] = (acc[e] || 0) + 1; return acc; }, {} as Record<string, number>);
  if (Object.values(elementCounts).some((c: any) => c >= 3)) {
      return { label: 'Elemental Resonance', bonus: 1.2, description: 'Three or more of the same element. +20% Power.' };
  }

  return { label: 'Basic Formation', bonus: 1.05, description: 'Standard squad. +5% Power.' };
};
