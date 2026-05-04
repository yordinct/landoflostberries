const fs = require('fs');
let data = fs.readFileSync('src/components/League.tsx', 'utf8');

data = data.replace(
  "import { getCharacterRank } from '../utils';",
  "import { getCharacterRank, getDivisionSynergy } from '../utils';"
);

// We need to update getDivisionPower, and also how it's calculated in the interval
// In the interval, line ~75
const intervalCalcRegex = /let power = \(captain\?\.level \|\| 1\) \* 10;[\s\n]*division\.subordinateIds\.forEach\(id => \{[\s\n]*const subHero = prev\.squad\.find\(s => s\.id === id\);[\s\n]*if \(subHero\) power \+= subHero\.level \* 5;[\s\n]*const subBeast = prev\.beasts\.find\(b => b\.id === id\);[\s\n]*if \(subBeast\) power \+= subBeast\.level \* 3;[\s\n]*\}\);/g;

data = data.replace(intervalCalcRegex, (match) => {
    return `let basePower = (captain?.level || 1) * 10;
                       let subHeroes: any[] = [];
                       let subBeasts: any[] = [];
                       division.subordinateIds.forEach(id => {
                          const subHero = prev.squad.find(s => s.id === id);
                          if (subHero) { basePower += subHero.level * 5; subHeroes.push(subHero); }
                          const subBeast = prev.beasts.find(b => b.id === id);
                          if (subBeast) { basePower += subBeast.level * 3; subBeasts.push(subBeast); }
                       });
                       const synergy = getDivisionSynergy(captain, subHeroes, subBeasts);
                       let power = Math.floor(basePower * synergy.bonus);`;
});

// Update getDivisionPower in rendering
const renderCalcRegex = /let power = \(captain\?\.level \|\| 1\) \* 10;[\s\n]*div\.subordinateIds\.forEach\(id => \{[\s\n]*const subHero = squad\.find\(s => s\.id === id\);[\s\n]*if \(subHero\) power \+= subHero\.level \* 5;[\s\n]*const subBeast = beasts\.find\(b => b\.id === id\);[\s\n]*if \(subBeast\) power \+= subBeast\.level \* 3;[\s\n]*\}\);[\s\n]*return power;/g;

data = data.replace(renderCalcRegex, (match) => {
    return `let basePower = (captain?.level || 1) * 10;
      let subHeroes: any[] = [];
      let subBeasts: any[] = [];
      div.subordinateIds.forEach(id => {
         const subHero = squad.find(s => s.id === id);
         if (subHero) { basePower += subHero.level * 5; subHeroes.push(subHero); }
         const subBeast = beasts.find(b => b.id === id);
         if (subBeast) { basePower += subBeast.level * 3; subBeasts.push(subBeast); }
      });
      const synergy = getDivisionSynergy(captain, subHeroes, subBeasts);
      return Math.floor(basePower * synergy.bonus);`;
});

// Now we want to display the synergy in the UI for the division
// `est. power` display is somewhere in the lines.
const estPowerRegex = /<div className="flex-1 w-full pl-2">/;

data = data.replace(estPowerRegex, (match) => {
    return `
      {(() => {
          let hList: any[] = [];
          let bList: any[] = [];
          div.subordinateIds.forEach(id => {
             const subH = squad.find(s => s.id === id);
             if (subH) hList.push(subH);
             const subB = beasts.find(b => b.id === id);
             if (subB) bList.push(subB);
          });
          const syn = getDivisionSynergy(captain, hList, bList);
          return (
             <div className="absolute top-4 right-20 text-right z-10 hidden md:block">
                <div className="text-[10px] font-black uppercase text-amber-500 tracking-widest">{syn.label}</div>
                <div className="text-[8px] text-slate-400 max-w-[120px] leading-tight">{syn.description}</div>
             </div>
          );
      })()}
      <div className="flex-1 w-full pl-2">`;
});

fs.writeFileSync('src/components/League.tsx', data);
console.log('Fixed league synergy feature');
