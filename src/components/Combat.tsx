import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, Zap, Shield, Heart, Ghost, Target, AlertCircle, Crosshair, Skull, DoorOpen, Brain, Play, Pause, Trophy, Book } from 'lucide-react';
import { Character, Beast, Element, Skill } from '../types';
import { RACE_DATA, ELEMENTAL_CHART } from '../constants';
import CharacterAvatar from './CharacterAvatar';
import { sounds } from '../lib/sounds';

interface CombatProps {
  playerParty: (Character | Beast)[];
  enemyParty: (Character | Beast)[];
  allBeasts?: Beast[];
  rightHandManId?: string;
  onWin: (loot: any) => void;
  onLose: () => void;
  onEscape?: () => void;
  onCapture?: (beast: Beast) => void;
}

const getRarityVal = (rarity: string) => {
  switch (rarity) {
    case 'Uncommon': return 1;
    case 'Rare': return 2;
    case 'Epic': return 3;
    case 'Legendary': return 5;
    case 'Mythic': return 8;
    case 'Ancient': return 12;
    default: return 0;
  }
};

const calculatePassives = (party: (Character | Beast)[], rightHandManId?: string) => {
  let spiritVal = 0;
  let beastVal = 0;
  let skillVal = 0;
  let leaderBuff = 0;
  
  party.forEach(p => {
    if (rightHandManId && p.id === rightHandManId) {
      leaderBuff += 15;
    }
    if (!('class' in p)) {
      const beast = p as Beast;
      const rarityVal = getRarityVal(beast.rarity);
      if (beast.element === 'Spirit') {
        spiritVal += rarityVal;
      } else {
        beastVal += rarityVal;
      }
      if (beast.skills) {
        skillVal += beast.skills.length * 2;
      }
    }
  });
  return { spiritVal, beastVal, skillVal, leaderBuff };
};

export default function Combat({ playerParty, enemyParty, allBeasts = [], rightHandManId, onWin, onLose, onEscape, onCapture }: CombatProps) {
  const [turn, setTurn] = useState(0); // 0 = Player Team, 1 = Enemy Team
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>(['Battle started!']);
  const [showSkills, setShowSkills] = useState(false);

  // Extract team passives from deployed units
  const pPassives = useMemo(() => calculatePassives(playerParty || [], rightHandManId), [playerParty, rightHandManId]);
  const ePassives = useMemo(() => calculatePassives(enemyParty || []), [enemyParty]);

  const getPassiveBonus = (unit: Character | Beast, isEnemy: boolean) => {
    const passives = isEnemy ? ePassives : pPassives;
    if ('class' in unit) {
      return passives.spiritVal + passives.skillVal + passives.leaderBuff;
    } else {
      return passives.beastVal + passives.skillVal + passives.leaderBuff;
    }
  };

  const [pHealth, setPHealth] = useState((playerParty || []).map(p => ('stats' in p ? p.stats.hp : 100)));
  const [pMana, setPMana] = useState((playerParty || []).map(p => ('stats' in p && 'mp' in p.stats ? p.stats.mp : 0)));
  const [pShields, setPShields] = useState<number[]>((playerParty || []).map(() => 0));
  const [eHealth, setEHealth] = useState((enemyParty || []).map(e => ('stats' in e ? e.stats.hp : 100)));
  const [eShields, setEShields] = useState<number[]>((enemyParty || []).map(() => 0));
  const [selectedTarget, setSelectedTarget] = useState(0);
  const [isAttacking, setIsAttacking] = useState<number | null>(null); // Index of attacker (0-9 for player, 100+ for enemy)
  const [shake, setShake] = useState<{ x: number, y: number } | null>(null);
  const [particles, setParticles] = useState<{ id: string, x: number, y: number, color: string, type: 'spark' | 'blast' | 'magic' }[]>([]);
  const [isEscaping, setIsEscaping] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [victoryLoot, setVictoryLoot] = useState<any>(null);

  const addParticles = (x: number, y: number, count: number, color: string, type: 'spark' | 'blast' | 'magic' = 'spark') => {
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: `p_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      color,
      type
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));

  const getLivingEnemies = (healths: number[]) => {
    return (healths || []).map((h, i) => h > 0 ? i : -1).filter(i => i !== -1);
  };

  // Auto-Targeting Logic
  useEffect(() => {
    const alive = getLivingEnemies(eHealth);
    if (eHealth[selectedTarget] <= 0 || selectedTarget >= eHealth.length) {
      if (alive.length > 0) {
        setSelectedTarget(alive[0]);
      }
    }
  }, [eHealth, selectedTarget]);

  // Unit validity guard
  useEffect(() => {
    if (!playerParty || playerParty.length === 0 || !enemyParty || enemyParty.length === 0) {
      addLog("Battle cannot proceed: Party missing.");
      const timer = setTimeout(() => onLose(), 1500);
      return () => clearTimeout(timer);
    }
  }, [playerParty, enemyParty]);

  const [floatingDamage, setFloatingDamage] = useState<{ id: string, value: number, x: number, y: number, isAlly: boolean, isHeal?: boolean, flavor?: string }[]>([]);

  const addFloatingValue = (value: number, isAlly: boolean, isHeal: boolean = false, flavor?: string) => {
    const id = `fd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setFloatingDamage(prev => [...prev, { id, value, x: Math.random() * 40 - 20, y: Math.random() * 20 - 10, isAlly, isHeal, flavor }]);
    setTimeout(() => {
      setFloatingDamage(prev => prev.filter(d => d.id !== id));
    }, 1000);
  };

  const getUnitElement = (unit: Character | Beast): Element => {
    return 'affinity' in unit ? unit.affinity : unit.element;
  };

  const getElementalMultiplier = (attackerElement: Element, defenderElement: Element) => {
    const chart = ELEMENTAL_CHART[attackerElement as any];
    if (chart?.strongAgainst?.includes(defenderElement as any)) return 1.5;
    if (chart?.weakAgainst?.includes(defenderElement as any)) return 0.5;
    return 1.0;
  };

  const triggerShake = (intensity: number = 5) => {
    // Add tiny random value so framer-motion detects state change and re-triggers
    const r = Math.random() * 0.1;
    setShake({ x: intensity + r, y: intensity + r });
    setTimeout(() => setShake(null), 200);
  };

  const nextActiveUnit = () => {
    const livingUnits = (pHealth || []).map((h, i) => h > 0 ? i : -1).filter(i => i !== -1);
    const currentPos = livingUnits.indexOf(activeUnitIndex);
    const nextIdx = livingUnits[currentPos + 1];
    
    if (nextIdx !== undefined) {
      setActiveUnitIndex(nextIdx);
    } else {
      setTurn(1); // End of player team turn
    }
  };

  // Squad AI / Auto-Combat Logic / Auto-Skip Dead
  useEffect(() => {
    if (turn === 0 && !isEscaping && isAttacking === null) {
      if (pHealth[activeUnitIndex] <= 0) {
        nextActiveUnit();
        return;
      }

      if (isAuto) {
        const currentUnit = playerParty[activeUnitIndex];
        if (!currentUnit) {
          nextActiveUnit();
          return;
        }
        
        const timer = setTimeout(() => {
          const aliveEnemies = getLivingEnemies(eHealth);
          if (aliveEnemies.length === 0) return;

          // Auto-Targeting: pick a target if current is dead or none selected
          let targetId = selectedTarget;
          if (targetId >= eHealth.length || eHealth[targetId] <= 0) {
            // Priority: Lowest HP enemy
            targetId = aliveEnemies.reduce((prev, curr) => 
              eHealth[curr] < eHealth[prev] ? curr : prev
            , aliveEnemies[0]);
            setSelectedTarget(targetId);
          }

          const canSpell = pMana[activeUnitIndex] >= 20;
          const lowHealthEnemy = eHealth[targetId] < 30;
          const hasBeast = ('equippedBeastId' in currentUnit) && Boolean(currentUnit.equippedBeastId);
          
          // Strategy: Use spell if available and random chance, or if it can finish enemy
          const r = Math.random();
          if (canSpell && (r > 0.8 || lowHealthEnemy)) {
            handleSpell(activeUnitIndex, targetId);
          } else if (hasBeast && r > 0.5) {
            handleBeastStrike(activeUnitIndex, targetId);
          } else {
            handleAttack(activeUnitIndex, targetId);
          }
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, [turn, activeUnitIndex, isAuto, isEscaping, isAttacking, pHealth, eHealth, selectedTarget]);

  const handleAttack = (attackerIndex: number, targetIndex: number) => {
    if (turn !== 0 || isAttacking !== null) return;
    const attacker = playerParty[attackerIndex];
    const defender = enemyParty[targetIndex];

    if (!attacker || !defender || eHealth[targetIndex] <= 0 || pHealth[attackerIndex] <= 0) {
      addLog("Invalid target or attacker for physical strike.");
      return;
    }
    
    setIsAttacking(attackerIndex);
    sounds.playAttack();
    
    setTimeout(() => {
      const attacker = playerParty[attackerIndex];
      const defender = enemyParty[targetIndex];
      
      const attackerElem = getUnitElement(attacker);
      const defenderElem = defender ? getUnitElement(defender) : 'Normal' as Element;
      const mult = getElementalMultiplier(attackerElem, defenderElem);
      
      // Calculate active strength
      const isChar = 'class' in attacker;
      let rawAtk = isChar ? (attacker.stats as any).str : (attacker.stats as any).atk;
      
      if ('equippedBeastId' in attacker && attacker.equippedBeastId) {
         const beast = allBeasts.find(b => b.id === attacker.equippedBeastId);
         if (beast) rawAtk += Math.floor(beast.stats.atk / 2);
      }
      rawAtk += getPassiveBonus(attacker, false);
      
      let rawDef = 'stats' in defender ? defender.stats.def : 5;
      if (defender && 'equippedBeastId' in defender && defender.equippedBeastId) {
         const dBeast = allBeasts.find(b => b.id === defender.equippedBeastId);
         if (dBeast) rawDef += Math.floor(dBeast.stats.def / 2);
      }
      if (defender) {
         rawDef += getPassiveBonus(defender, true);
      }
      
      // Basic damage formula: (Atk - Def/2) * multiplier
      const baseDamage = Math.max(1, (rawAtk - Math.floor(rawDef / 2)) * (0.8 + Math.random() * 0.4));
      let damage = Math.max(1, Math.floor(baseDamage * mult));
      
      const newEHealth = [...eHealth];
      const newEShields = [...eShields];
      if (newEShields[targetIndex] > 0) {
        if (damage >= newEShields[targetIndex]) {
           damage -= newEShields[targetIndex];
           newEShields[targetIndex] = 0;
        } else {
           newEShields[targetIndex] -= damage;
           damage = 0;
        }
      }
      
      newEHealth[targetIndex] = Math.max(0, newEHealth[targetIndex] - damage);
      setEShields(newEShields);
      setEHealth(newEHealth);
      
      triggerShake(damage > 25 ? 10 : 5);
      sounds.playHit();
      addParticles(75, 30 + targetIndex * 15, 8, 'bg-amber-400', 'spark');
      addFloatingValue(damage, false, false, mult > 1 ? "SUPER EFFECTIVE!" : mult < 1 ? "RESISTED" : undefined);
      addLog(`${attacker.name} strikes ${defender?.name} for ${damage}${mult > 1 ? '! Critical weakness exploited!' : ''}`);
      setIsAttacking(null);
      if (newEHealth.every(h => h === 0)) {
        checkWinCondition(newEHealth);
      } else {
        nextActiveUnit();
      }
    }, 400);
  };

  const handleBeastStrike = (attackerIndex: number, targetIndex: number) => {
    if (turn !== 0 || isAttacking !== null) return;
    const attacker = playerParty[attackerIndex];
    const defender = enemyParty[targetIndex];

    if (!attacker || !defender || eHealth[targetIndex] <= 0 || pHealth[attackerIndex] <= 0) return;
    if (!('equippedBeastId' in attacker) || !attacker.equippedBeastId) return;
    
    const beast = allBeasts.find(b => b.id === attacker.equippedBeastId);
    if (!beast) return;

    setIsAttacking(attackerIndex);
    sounds.playAttack();

    setTimeout(() => {
      const defender = enemyParty[targetIndex];
      const defenderElem = defender ? getUnitElement(defender) : 'Normal' as Element;
      const mult = getElementalMultiplier(beast.element, defenderElem);
      
      let rawAtk = beast.stats.atk + getPassiveBonus(attacker, false);
      let rawDef = 'stats' in defender ? defender.stats.def : 5;
      if (defender && 'equippedBeastId' in defender && defender.equippedBeastId) {
         const dBeast = allBeasts.find(b => b.id === defender.equippedBeastId);
         if (dBeast) rawDef += Math.floor(dBeast.stats.def / 2);
      }
      if (defender) {
         rawDef += getPassiveBonus(defender, true);
      }
      
      const baseDamage = Math.max(1, (rawAtk * 1.5 - Math.floor(rawDef / 2)) * (0.8 + Math.random() * 0.4));
      const damage = Math.max(1, Math.floor(baseDamage * mult));

      const newEHealth = [...eHealth];
      newEHealth[targetIndex] = Math.max(0, newEHealth[targetIndex] - damage);
      setEHealth(newEHealth);

      triggerShake(10);
      sounds.playHit();
      addParticles(100, 30 + targetIndex * 15, 12, 'bg-amber-500', 'spark');
      addFloatingValue(damage, false, true, "BEAST STRIKE!");
      addLog(`${beast.name} (Spirit) strikes ${defender?.name} for ${damage}${mult > 1 ? '! SUPER EFFECTIVE!' : ''}`);
      setIsAttacking(null);
      if (newEHealth.every(h => h === 0)) {
        checkWinCondition(newEHealth);
      } else {
        nextActiveUnit();
      }
    }, 400);
  };

  const handleSpell = (attackerIndex: number, targetIndex: number) => {
    if (turn !== 0 || isAttacking !== null) return;
    const attacker = playerParty[attackerIndex];
    const defender = enemyParty[targetIndex];

    if (!attacker || !defender || eHealth[targetIndex] <= 0 || pHealth[attackerIndex] <= 0) return;
    if (pMana[attackerIndex] < 20) {
      addLog("Not enough Mana!");
      return;
    }

    setIsAttacking(attackerIndex);
    sounds.playSpell();
    
    setTimeout(() => {
      const attacker = playerParty[attackerIndex];
      const defender = enemyParty[targetIndex];
      
      const attackerElem = getUnitElement(attacker);
      const defenderElem = defender ? getUnitElement(defender) : 'Normal' as Element;
      const mult = getElementalMultiplier(attackerElem, defenderElem);
      
      let rawInt = 'stats' in attacker && 'int' in attacker.stats ? attacker.stats.int : 15;
      rawInt += getPassiveBonus(attacker, false);

      let rawDef = 'stats' in defender ? defender.stats.def : 5;
      if (defender && 'equippedBeastId' in defender && defender.equippedBeastId) {
         const dBeast = allBeasts.find(b => b.id === defender.equippedBeastId);
         if (dBeast) rawDef += Math.floor(dBeast.stats.def / 2);
      }
      if (defender) {
         rawDef += getPassiveBonus(defender, true);
      }
      
      // Spell uses Int vs (Def/3)
      const baseDamage = Math.max(1, (rawInt * 1.5 - Math.floor(rawDef / 3)) * (0.8 + Math.random() * 0.4));
      const damage = Math.max(1, Math.floor(baseDamage * mult));
      
      const newEHealth = [...eHealth];
      newEHealth[targetIndex] = Math.max(0, newEHealth[targetIndex] - damage);
      setEHealth(newEHealth);
      
      const newPMana = [...pMana];
      newPMana[attackerIndex] -= 20;
      setPMana(newPMana);
      
      const elementalColors: Record<string, string> = {
        'Fire': 'bg-red-500',
        'Water': 'bg-blue-500',
        'Earth': 'bg-amber-800',
        'Wind': 'bg-emerald-400',
        'Light': 'bg-yellow-200',
        'Dark': 'bg-purple-600',
        'Void': 'bg-indigo-900',
        'Normal': 'bg-slate-400'
      };

      triggerShake(15);
      sounds.playHit();
      addParticles(75, 30 + targetIndex * 15, 15, elementalColors[attackerElem] || 'bg-blue-400', 'magic');
      addFloatingValue(damage, false, false, mult > 1 ? "ASCENDED POWER!" : mult < 1 ? "INEFFECTIVE" : undefined);
      addLog(`${attacker.name} casts ${attackerElem} burst on ${defender?.name} for ${damage} damage!`);
      setIsAttacking(null);
      if (newEHealth.every(h => h === 0)) {
        checkWinCondition(newEHealth);
      } else {
        nextActiveUnit();
      }
    }, 400);
  };
  
  const handleSkill = (attackerIndex: number, targetIndex: number, skill: Skill) => {
    if (turn !== 0 || isAttacking !== null) return;
    const attacker = playerParty[attackerIndex];
    const defender = enemyParty[targetIndex];

    if (!attacker || !defender || eHealth[targetIndex] <= 0 || pHealth[attackerIndex] <= 0) return;
    if (!('stats' in attacker) || !('mp' in attacker.stats)) return;

    const cost = skill.cost || 0;
    if (pMana[attackerIndex] < cost) {
      addLog("Not enough Mana!");
      return;
    }

    setIsAttacking(attackerIndex);
    sounds.playSpell();
    
    setTimeout(() => {
      const attacker = playerParty[attackerIndex] as Character;
      const defender = enemyParty[targetIndex];
      
      const attackerElem = getUnitElement(attacker);
      const defenderElem = defender ? getUnitElement(defender) : 'Normal' as Element;
      const mult = getElementalMultiplier(attackerElem, defenderElem);
      
      let rawInt = attacker.stats.int;
      rawInt += getPassiveBonus(attacker, false);

      let rawDef = 'stats' in defender ? defender.stats.def : 5;
      if (defender && 'equippedBeastId' in defender && defender.equippedBeastId) {
         const dBeast = allBeasts.find(b => b.id === defender.equippedBeastId);
         if (dBeast) rawDef += Math.floor(dBeast.stats.def / 2);
      }
      if (defender) {
         rawDef += getPassiveBonus(defender, true);
      }
      
      // Damage formula for skills
      const skillPower = skill.power || 10;
      const baseDamage = Math.max(1, (rawInt + skillPower - Math.floor(rawDef / 3)) * (0.8 + Math.random() * 0.4));
      const damage = Math.max(1, Math.floor(baseDamage * mult));
      
      const newEHealth = [...eHealth];
      newEHealth[targetIndex] = Math.max(0, newEHealth[targetIndex] - damage);
      setEHealth(newEHealth);
      
      const newPMana = [...pMana];
      newPMana[attackerIndex] -= cost;
      setPMana(newPMana);
      
      const elementalColors: Record<string, string> = {
        'Fire': 'bg-red-500',
        'Water': 'bg-blue-500',
        'Earth': 'bg-amber-800',
        'Wind': 'bg-emerald-400',
        'Light': 'bg-yellow-200',
        'Dark': 'bg-purple-600',
        'Void': 'bg-indigo-900',
        'Normal': 'bg-slate-400'
      };

      triggerShake(15);
      sounds.playHit();
      addParticles(75, 30 + targetIndex * 15, 15, elementalColors[attackerElem] || 'bg-blue-400', 'magic');
      addFloatingValue(damage, false, false, mult > 1 ? "SUPER EFFECTIVE!" : mult < 1 ? "RESISTED" : undefined);
      addLog(`${attacker.name} uses ${skill.name} on ${defender?.name} for ${damage} damage!`);
      setIsAttacking(null);
      setShowSkills(false);
      if (newEHealth.every(h => h === 0)) {
        checkWinCondition(newEHealth);
      } else {
        nextActiveUnit();
      }
    }, 400);
  };

  const handleCapture = (attackerIndex: number, targetIndex: number) => {
    if (turn !== 0 || isAttacking !== null) return;
    const target = enemyParty[targetIndex];
    if (!target || eHealth[targetIndex] <= 0) return;
    
    if (!('element' in target)) {
        addLog("Cannot capture heroes!");
        return;
    }

    addLog(`Attempting to capture ${target.name}...`);
    setIsAttacking(attackerIndex);
    sounds.playCapture();

    setTimeout(() => {
      const hpRatio = eHealth[targetIndex] / ('stats' in target ? target.stats.maxHp : 100);
      let successChance = 0.05 + (1 - hpRatio) * 0.25;

      // Geopolitical bosses and high-level beasts are very hard to capture
      if ('regionId' in target) {
        successChance = 0.01 + (1 - hpRatio) * 0.02; // Max 3% chance
      } else if ('level' in target && target.level > 5) {
        successChance = Math.max(0.01, successChance - (target.level * 0.02));
      }

      const roll = Math.random();

      if (roll < successChance) {
        addLog(`SUCCESS! ${target.name} has been captured!`);
        sounds.playHeal();
        
        let capturedBeast = target as any;
        if (!capturedBeast.rarity) {
           capturedBeast = { ...capturedBeast, rarity: 'Mythic', species: 'Territorial Guardian', bond: 10, skills: ['Earthquake'] };
        }
        
        onCapture?.(capturedBeast);
        const newEHealth = [...eHealth];
        newEHealth[targetIndex] = 0;
        setEHealth(newEHealth);
        setIsAttacking(null);
        if (newEHealth.every(h => h === 0)) {
          checkWinCondition(newEHealth);
        } else {
          nextActiveUnit();
        }
      } else {
        addLog(`Capture failed! ${target.name} broke free!`);
        setIsAttacking(null);
        nextActiveUnit();
      }
    }, 600);
  };

  const handleEscape = () => {
    if (turn !== 0 || isAttacking !== null) return;
    addLog("Attempting to escape...");
    setIsEscaping(true);

    setTimeout(() => {
      if (Math.random() > 0.3) {
        addLog("Escaped safely!");
        setTimeout(() => onEscape?.(), 500);
      } else {
        addLog("Couldn't get away!");
        setIsEscaping(false);
        setTurn(1);
      }
    }, 800);
  };

  const checkWinCondition = (currentEHealth: number[]) => {
    if (currentEHealth.every(h => h === 0)) {
      sounds.playVictory();
      
      // Calculate dynamic rewards based on enemy host
      let totalGold = 0;
      let totalExp = 0;
      let totalLuck = 0;
      const lootResources: Record<string, number> = {};

      enemyParty.forEach(enemy => {
        const lv = 'level' in enemy ? enemy.level : 1;
        totalGold += lv * 25 + Math.floor(Math.random() * 20);
        totalExp += lv * 40;
        
        // Chance for extra resources
        if (Math.random() > 0.7) {
          const res = ['food', 'wood', 'stone', 'mana'][Math.floor(Math.random() * 4)];
          lootResources[res] = (lootResources[res] || 0) + lv * 2;
        }
      });

      // Bonus if it's a boss/guardian
      const isBoss = enemyParty.some(e => e.name.includes("Guardian") || e.name.includes("Dragon"));
      if (isBoss) {
        totalGold *= 2;
        totalExp *= 1.5;
        totalLuck = 5;
      } else {
        totalLuck = 1;
      }

      const loot = {
        gold: Math.floor(totalGold),
        exp: Math.floor(totalExp),
        luck: totalLuck,
        resources: lootResources
      };

      setTimeout(() => setVictoryLoot(loot), 800);
    }
  };

  useEffect(() => {
    if (turn === 1) {
      if (eHealth.length === 0 || eHealth.every(h => h === 0)) {
        setTurn(0);
        return;
      }
      const timer = setTimeout(() => {
        const aliveTargets = (pHealth || []).map((h, i) => h > 0 ? i : -1).filter(i => i !== -1);
        const aliveEnemies = (eHealth || []).map((h, i) => h > 0 ? i : -1).filter(i => i !== -1);
        
        if (aliveTargets.length === 0) {
           sounds.playDefeat();
           onLose();
           return;
        }
        if (aliveEnemies.length === 0) {
           setTurn(0);
           return;
        }
        
        const attackerIdx = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        const attacker = enemyParty[attackerIdx];
        
        if (!attacker || aliveTargets.length === 0) {
          setTurn(0);
          return;
        }

        const isChar = 'class' in attacker;
        const rawAtkStart = isChar ? (attacker.stats as any).str : (attacker.stats as any).atk;
        const rawAtk = rawAtkStart + getPassiveBonus(attacker, true);

        // Enemy Action Decision
        const randAction = Math.random();
        
        let actionParam = { type: 'attack', target: aliveTargets[Math.floor(Math.random() * aliveTargets.length)] };
        
        if (randAction < 0.2 && aliveEnemies.some(idx => eHealth[idx] < 50)) {
           // Heal low HP ally
           const lowAlly = aliveEnemies.find(idx => eHealth[idx] < 50)!;
           actionParam = { type: 'heal', target: lowAlly };
        } else if (randAction < 0.35 && eHealth[attackerIdx] > 0) {
           // Shield self or ally
           actionParam = { type: 'shield', target: aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)] };
        } else if (randAction < 0.5 && aliveTargets.length > 1) {
           // AoE Attack
           actionParam = { type: 'aoe', target: -1 };
        }

        setIsAttacking(100 + attackerIdx);
        if (actionParam.type === 'attack' || actionParam.type === 'aoe') {
           sounds.playAttack();
        }

        setTimeout(() => {
          let newPHealth = [...pHealth];
          let newPShields = [...pShields];
          let newEHealth = [...eHealth];
          let newEShields = [...eShields];
          
          if (actionParam.type === 'heal') {
             const healAmt = rawAtk * 2;
             newEHealth[actionParam.target] += healAmt;
             addParticles(75, 30 + actionParam.target * 15, 6, 'bg-emerald-400', 'magic');
             addFloatingValue(healAmt, false, true, "HEAL!");
             addLog(`${attacker.name} casts Heal on ${enemyParty[actionParam.target].name} for ${healAmt} HP!`);
             setEHealth(newEHealth);
          } else if (actionParam.type === 'shield') {
             const shieldAmt = rawAtk * 3;
             newEShields[actionParam.target] += shieldAmt;
             addParticles(75, 30 + actionParam.target * 15, 6, 'bg-blue-400', 'magic');
             addFloatingValue(shieldAmt, false, true, "SHIELD");
             addLog(`${attacker.name} casts Shield on ${enemyParty[actionParam.target].name} (+${shieldAmt})!`);
             setEShields(newEShields);
          } else if (actionParam.type === 'aoe') {
             let totalDamage = 0;
             const attackerElem = getUnitElement(attacker);
             aliveTargets.forEach(tIdx => {
                const target = playerParty[tIdx];
                const targetElem = getUnitElement(target);
                const mult = getElementalMultiplier(attackerElem, targetElem);
                
                let rawDef = 'stats' in target ? target.stats.def : 5;
                if ('equippedBeastId' in target && target.equippedBeastId) {
                   const beast = allBeasts.find(b => b.id === target.equippedBeastId);
                   if (beast) rawDef += Math.floor(beast.stats.def / 2);
                }
                rawDef += getPassiveBonus(target, false);
                
                const baseDamage = Math.max(1, ((rawAtk * 0.7) - Math.floor(rawDef / 2)) * (0.8 + Math.random() * 0.4));
                let damage = Math.max(1, Math.floor(baseDamage * mult));
                
                if (newPShields[tIdx] > 0) {
                   if (damage >= newPShields[tIdx]) {
                      damage -= newPShields[tIdx];
                      newPShields[tIdx] = 0;
                   } else {
                      newPShields[tIdx] -= damage;
                      damage = 0;
                   }
                }
                
                newPHealth[tIdx] = Math.max(0, newPHealth[tIdx] - damage);
                totalDamage += damage;
             });
             
             triggerShake(8);
             sounds.playHit();
             addLog(`${attacker.name} unleashes an AoE blast, dealing a total of ${totalDamage} damage!`);
             setPHealth(newPHealth);
             setPShields(newPShields);
          } else {
             // Single Attack
             const target = playerParty[actionParam.target];
             const attackerElem = getUnitElement(attacker);
             const targetElem = getUnitElement(target);
             const mult = getElementalMultiplier(attackerElem, targetElem);
             
             let rawDef = 'stats' in target ? target.stats.def : 5;
             if ('equippedBeastId' in target && target.equippedBeastId) {
                const beast = allBeasts.find(b => b.id === target.equippedBeastId);
                if (beast) rawDef += Math.floor(beast.stats.def / 2);
             }
             rawDef += getPassiveBonus(target, false);
             
             const baseDamage = Math.max(1, (rawAtk - Math.floor(rawDef / 2)) * (0.8 + Math.random() * 0.4));
             let damage = Math.max(1, Math.floor(baseDamage * mult));
             
             if (newPShields[actionParam.target] > 0) {
                if (damage >= newPShields[actionParam.target]) {
                   damage -= newPShields[actionParam.target];
                   newPShields[actionParam.target] = 0;
                } else {
                   newPShields[actionParam.target] -= damage;
                   damage = 0;
                }
             }
             
             newPHealth[actionParam.target] = Math.max(0, newPHealth[actionParam.target] - damage);
             setPHealth(newPHealth);
             setPShields(newPShields);
             
             triggerShake(damage > 15 ? 8 : 4);
             sounds.playHit();
             addParticles(25, 30 + actionParam.target * 15, 6, 'bg-red-400', 'spark');
             addFloatingValue(damage, true);
             addLog(`${attacker.name} strikes ${target.name} for ${damage} damage!`);
          }
          
          setIsAttacking(null);
          
          if (newPHealth.every(h => h === 0)) {
              sounds.playDefeat();
              onLose();
          } else {
              setTurn(0); // Player Turn
              const firstAlive = newPHealth.findIndex(h => h > 0);
              setActiveUnitIndex(firstAlive === -1 ? 0 : firstAlive);
          }
        }, 600);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [turn, pHealth, eHealth]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={shake ? { 
        opacity: 1,
        x: [-shake.x, shake.x, -shake.x, shake.x, 0],
        y: [-shake.y, shake.y, -shake.y, shake.y, 0]
      } : { opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full flex flex-col relative overflow-hidden bg-slate-950"
    >
      <header className="shrink-0 flex items-center justify-between border-b border-white/5 p-6 bg-slate-900/50 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/20">
            <Sword className="text-red-500" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic uppercase italic tracking-tighter text-white">Active Engagement</h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${turn === 0 ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {turn === 0 ? 'Strategic Phase: Allied Initiative' : 'Strategic Phase: Hostile Retaliation'}
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 py-2 bg-slate-900 border border-white/5 rounded-full text-xs font-black text-amber-500 uppercase tracking-widest">
           Round Progression: High Alert
        </div>
      </header>
      <AnimatePresence>
        {(particles || []).map(p => (
          <motion.div
            key={p.id}
            initial={{ 
              opacity: 1, 
              scale: 0,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{ 
              opacity: 0, 
              scale: p.type === 'magic' ? 4 : 1.5,
              left: `${p.x + (Math.random() * 20 - 10)}%`,
              top: `${p.y + (Math.random() * 20 - 10)}%`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            exit={{ opacity: 0 }}
            className={`absolute w-3 h-3 rounded-full z-40 blur-[1px] ${p.color}`}
          />
        ))}
        {(floatingDamage || []).map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0.5, left: d.isAlly ? '25%' : '75%', top: '50%' }}
            animate={{ opacity: 1, scale: d.flavor ? 2.5 : 1.5, top: '30%' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            exit={{ opacity: 0, scale: 3 }}
            className={`absolute z-50 flex flex-col items-center pointer-events-none drop-shadow-2xl -translate-x-1/2 -translate-y-1/2`}
          >
            {d.flavor && (
              <div className="text-[10px] font-black uppercase text-white bg-black/50 px-2 py-0.5 rounded-full mb-1">
                {d.flavor}
              </div>
            )}
            <div className={`text-5xl font-black ${d.isHeal ? 'text-green-500' : d.isAlly ? 'text-red-500' : 'text-amber-400'}`} style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {d.isHeal ? `+${d.value}` : d.value}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex-1 flex flex-col justify-between py-6 relative z-10 w-full max-w-5xl mx-auto overflow-y-auto overflow-x-hidden scrollbar-hide">
        
        {/* Enemy Team Row (Top) */}
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors ${turn === 1 ? 'border-red-500 bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110' : 'border-white/5 bg-slate-900/50 text-slate-500'}`}>
              Hostile Entities
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {(enemyParty || []).map((e, i) => (
              <UnitCard 
                key={`${e.id}_${i}`} 
                unit={e} 
                hp={eHealth[i]} 
                maxHp={'stats' in e ? e.stats.maxHp : 100} 
                shield={eShields[i]}
                onClick={() => setSelectedTarget(i)}
                isSelected={selectedTarget === i}
                isAttacking={isAttacking === 100 + i}
                allBeasts={allBeasts}
                layoutId={`enemy-${i}`}
                passiveBonus={getPassiveBonus(e, true)}
              />
            ))}
          </div>
        </div>

        {/* Center Arena Space */}
        <div className="flex-1 min-h-[40px] flex items-center justify-center relative my-2 overflow-hidden rounded-3xl mx-6 border-y border-white/5 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent">
           <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.05, 1] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none" 
           />
           <div className="text-4xl font-black italic text-white/5 uppercase tracking-[0.5em] mix-blend-overlay z-10">BATTLEFIELD</div>
        </div>

        {/* Player Team Row (Bottom) */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors ${turn === 0 ? 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110' : 'border-white/5 bg-slate-900/50 text-slate-500'}`}>
              Your Vanguard
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {(playerParty || []).map((p, i) => (
              <UnitCard 
                key={`${p.id}_${i}`} 
                unit={p} 
                hp={pHealth[i]} 
                maxHp={'stats' in p ? p.stats.maxHp : 100} 
                mp={pMana[i]}
                maxMp={'stats' in p && 'maxMp' in p.stats ? p.stats.maxMp : 0}
                shield={pShields[i]}
                isAlly={true} 
                isActive={turn === 0 && activeUnitIndex === i}
                isAttacking={isAttacking === i}
                allBeasts={allBeasts}
                layoutId={`player-${i}`}
                passiveBonus={getPassiveBonus(p, false)}
              />
            ))}
          </div>
        </div>

      </div>

      <footer className="shrink-0 bg-slate-900/90 border-t border-white/10 p-3 md:p-4 flex flex-col md:flex-row gap-4 md:gap-6 backdrop-blur-md relative z-20 transition-all">
        <div className="md:w-1/4 h-20 flex flex-col justify-end gap-1 overflow-y-auto pr-4 scrollbar-hide border-r border-white/5">
          {logs.map((log, i) => (
            <div key={i} className={`text-[10px] font-bold leading-relaxed tracking-wide uppercase ${i === 0 ? 'text-amber-400 drop-shadow-md' : 'text-slate-500 opacity-60'}`}>
              {i === 0 && <span className="mr-2">▶</span>}
              {log}
            </div>
          ))}
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-4 w-full">
            
            {turn === 0 ? (
              <div className="flex flex-col gap-6 w-full max-w-3xl">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative flex rounded-xl bg-slate-950 p-2 shadow-inner border border-white/5">
                     <div className="px-4 py-2 text-[10px] font-black mr-2 uppercase text-blue-400 tracking-[0.3em] flex items-center border-r border-white/10">
                        {playerParty[activeUnitIndex]?.name || 'Unknown'}
                     </div>
                     <button 
                        onClick={() => {
                          sounds.playHeal();
                          setIsAuto(!isAuto);
                        }}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg border transition-all active:scale-95 ${isAuto ? 'bg-amber-500/20 text-amber-500 border-amber-500/50 hover:bg-amber-500/30' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                      >
                        {isAuto ? <Pause size={14} /> : <Play size={14} />}
                        {isAuto ? 'AI Active' : 'Manual'}
                      </button>
                  </div>
                </div>

                <div className={`flex flex-wrap items-center justify-center gap-4 transition-all duration-700 ${isAuto ? 'opacity-30 grayscale pointer-events-none scale-95 blur-[2px]' : 'opacity-100 scale-100'}`}>
                  {playerParty[activeUnitIndex] && !showSkills && (
                    <div className="flex flex-wrap justify-center gap-3">
                      <ActionButton icon={Sword} label="Strike" color="bg-gradient-to-br from-red-500 to-red-600 shadow-red-900/40" onClick={() => handleAttack(activeUnitIndex, selectedTarget)} />
                      <ActionButton icon={Book} label="Skills" color="bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-900/40" onClick={() => setShowSkills(true)} />
                      {('equippedBeastId' in playerParty[activeUnitIndex]) && (playerParty[activeUnitIndex] as any).equippedBeastId && (
                        <ActionButton icon={Ghost} label="Soul Link" color="bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-900/40" onClick={() => handleBeastStrike(activeUnitIndex, selectedTarget)} />
                      )}
                      <ActionButton icon={Crosshair} label="Capture" color="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-900/40" onClick={() => handleCapture(activeUnitIndex, selectedTarget)} />
                    </div>
                  )}
                  {showSkills && (
                    <div className="flex flex-col items-center gap-2">
                       <button onClick={() => setShowSkills(false)} className="text-xs text-slate-400 mb-2">Back</button>
                       <div className="flex flex-wrap justify-center gap-3">
                        {(playerParty[activeUnitIndex] as Character).skills?.filter(s => s.type === 'Active').map(skill => (
                          <ActionButton 
                            key={skill.name} 
                            icon={Zap} 
                            label={`${skill.name} (${skill.cost} MP)`} 
                            color="bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-900/40" 
                            onClick={() => handleSkill(activeUnitIndex, selectedTarget, skill)} 
                            disabled={pMana[activeUnitIndex] < (skill.cost || 0)}
                          />
                        ))}
                       </div>
                    </div>
                  )}
                  <div className="hidden sm:block w-[1px] h-10 bg-white/10 mx-2" />
                  <div className="flex gap-3">
                    <ActionButton icon={Shield} label="Defend" color="bg-gradient-to-br from-slate-700 to-slate-800 shadow-black/40" onClick={nextActiveUnit} />
                    <ActionButton icon={DoorOpen} label="Retreat" color="bg-gradient-to-br from-orange-600 to-orange-700 shadow-orange-900/40" onClick={handleEscape} disabled={isEscaping} />
                  </div>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 text-red-500 font-extrabold uppercase tracking-[0.4em] text-sm py-8"
              >
                <div className="w-12 h-[2px] bg-red-500/30 animate-pulse" />
                <AlertCircle size={28} className="animate-bounce drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" /> 
                <span className="drop-shadow-md">Hostile Strategic Phase...</span>
                <div className="w-12 h-[2px] bg-red-500/30 animate-pulse" />
              </motion.div>
            )}
          </div>
        </div>
      </footer>

      {/* VICTORY MODAL */}
      <AnimatePresence>
        {victoryLoot && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6"
          >
            <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/20 to-transparent" />
               <Trophy size={64} className="mx-auto text-amber-500 mb-6 relative z-10" />
               <h2 className="text-3xl font-black italic text-white mb-2 relative z-10">VICTORY</h2>
               <p className="text-slate-400 text-sm font-medium mb-8 relative z-10">The battle is won. Spoils have been secured.</p>
               
               <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                 <div className="bg-slate-950/50 p-4 border border-white/5 rounded-2xl flex flex-col items-center">
                    <span className="text-amber-400 font-bold text-xl">{victoryLoot.gold}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Gold</span>
                 </div>
                 <div className="bg-slate-950/50 p-4 border border-white/5 rounded-2xl flex flex-col items-center">
                    <span className="text-blue-400 font-bold text-xl">{victoryLoot.exp}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">EXP</span>
                 </div>
                 {victoryLoot.luck > 0 && (
                   <div className="bg-slate-950/50 p-4 border border-white/5 rounded-2xl flex flex-col items-center">
                      <span className="text-orange-400 font-bold text-xl">+{victoryLoot.luck}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Luck</span>
                   </div>
                 )}
                 {Object.entries(victoryLoot.resources || {}).map(([res, val]) => (
                   <div key={res} className="bg-slate-950/50 p-4 border border-white/5 rounded-2xl flex flex-col items-center">
                      <span className="text-emerald-400 font-bold text-xl">+{String(val)}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{res}</span>
                   </div>
                 ))}
               </div>

               <button 
                 onClick={() => {
                   onWin(victoryLoot);
                   setVictoryLoot(null);
                 }}
                 className="relative z-10 w-full py-4 bg-amber-500 text-slate-950 font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 active:scale-95 transition-all text-sm shadow-xl shadow-amber-500/20"
               >
                 Accept Rewards
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UnitCard({ unit, hp, maxHp, mp, maxMp, shield = 0, isAlly, onClick, isSelected, isAttacking, isActive, allBeasts = [], layoutId, passiveBonus = 0 }: any) {
  const hpPercent = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  const mpPercent = maxMp > 0 ? (mp / maxMp) * 100 : 0;

  const equippedBeast = 'equippedBeastId' in unit && unit.equippedBeastId 
    ? allBeasts.find((b: any) => b.id === unit.equippedBeastId) 
    : null;

  const bonusStr = equippedBeast ? Math.floor((equippedBeast.stats.atk || 0) / 2) : 0;
  const bonusDef = equippedBeast ? Math.floor((equippedBeast.stats.def || 0) / 2) : 0;
  const bonusSpd = equippedBeast ? Math.floor((equippedBeast.stats.spd || 0) / 2) : 0;

  return (
    <motion.div 
      layoutId={layoutId}
      onClick={onClick}
      animate={isAttacking ? { 
        y: isAlly ? -60 : 60, 
        scale: 1.15,
        zIndex: 50
      } : { 
        y: 0, 
        scale: 1,
        zIndex: isActive ? 10 : 1
      }}
      transition={{ 
        type: 'spring', 
        stiffness: isAttacking ? 500 : 300, 
        damping: isAttacking ? 15 : 25 
      }}
      className={`min-w-[260px] max-w-[300px] w-full bg-slate-900/90 backdrop-blur-sm border ${isActive ? 'border-blue-400 ring-2 ring-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : isSelected ? 'border-amber-500 ring-4 ring-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-white/10'} rounded-2xl p-4 flex items-center gap-4 cursor-pointer relative ${hp === 0 ? 'opacity-40 grayscale scale-95' : 'hover:-translate-y-1 transition-transform'}`}
    >
      <div className="shrink-0 relative">
        {'race' in unit ? (
            <div className={`relative transition-all duration-500 ${isActive ? 'scale-125' : 'scale-100'}`}>
              <CharacterAvatar race={unit.race} characterClass={unit.class} affinity={unit.affinity} size="sm" />
              {isActive && (
                <motion.div 
                  layoutId="active-highlight"
                  className="absolute -inset-1 border-2 border-blue-500 rounded-xl animate-pulse"
                />
              )}
            </div>
        ) : (
            <div className={`w-12 h-12 rounded-lg ${isAlly ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'} flex items-center justify-center relative overflow-hidden transition-all ${isActive ? 'scale-125' : ''}`}>
                {hp > 0 ? <Ghost size={24} /> : <Skull size={24} />}
                {isSelected && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-red-500/10 border-2 border-red-500 rounded-lg pointer-events-none"
                  />
                )}
            </div>
        )}
        {isSelected && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 z-20">
            <Target size={14} />
          </div>
        )}
        {equippedBeast && hp > 0 && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 shadow-lg ring-1 ring-amber-400">
            <Ghost size={12} />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-end mb-1">
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white">{unit.name}</span>
            <div className="flex flex-wrap gap-1 mt-1">
               {shield > 0 && (
                 <span className="bg-blue-500/20 text-blue-400 text-[6px] font-black uppercase px-1 rounded border border-blue-500/20">Shield {shield}</span>
               )}
               {hp > 0 && hp < maxHp * 0.3 && (
                 <span className="bg-red-500/20 text-red-400 text-[6px] font-black uppercase px-1 rounded border border-red-500/20">Wounded</span>
               )}
               {isAlly && isActive && (
                 <span className="bg-blue-500/20 text-blue-400 text-[6px] font-black uppercase px-1 rounded border border-blue-500/20">Acting</span>
               )}
               {equippedBeast && (
                 <span className="bg-amber-500/10 text-amber-500 text-[6px] font-black uppercase px-1 rounded border border-amber-500/20">Soul Link</span>
               )}
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase">Lv {unit.level}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${hpPercent}%` }}
            className={`h-full ${hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
          />
        </div>
        {maxMp > 0 && (
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${mpPercent}%` }}
              className="h-full bg-blue-500"
            />
          </div>
        )}
        {'exp' in unit && (
           <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${(unit.exp / (unit.level * 150)) * 100}%` }}
               className="h-full bg-amber-400"
             />
           </div>
        )}
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <Sword size={8} className="text-red-400" />
            <span className="text-[8px] font-black text-slate-400">
              {'stats' in unit ? (unit.stats.str ?? unit.stats.atk ?? 0) + (bonusStr || 0) : 0}
              {bonusStr > 0 && <span className="text-amber-500 ml-0.5">+{bonusStr}</span>}
              {passiveBonus > 0 && <span className="text-amber-400 ml-0.5" title="Passive Bonus">+{passiveBonus}</span>}
            </span>
          </div>
          {('stats' in unit && 'int' in unit.stats) && (
            <div className="flex items-center gap-1">
              <Brain size={8} className="text-purple-400" />
              <span className="text-[8px] font-black text-slate-400">
                {unit.stats.int}
                {passiveBonus > 0 && <span className="text-amber-400 ml-0.5" title="Passive Bonus">+{passiveBonus}</span>}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Shield size={8} className="text-emerald-400" />
            <span className="text-[8px] font-black text-slate-400">
              {'stats' in unit ? (unit.stats.def || 0) + (bonusDef || 0) : 0}
              {bonusDef > 0 && <span className="text-amber-500 ml-0.5">+{bonusDef}</span>}
              {passiveBonus > 0 && <span className="text-amber-400 ml-0.5" title="Passive Bonus">+{passiveBonus}</span>}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={8} className="text-amber-400" />
            <span className="text-[8px] font-black text-slate-400">
              {'stats' in unit ? (unit.stats.spd || 0) + (bonusSpd || 0) : 0}
              {bonusSpd > 0 && <span className="text-amber-500 ml-0.5">+{bonusSpd}</span>}
              {passiveBonus > 0 && <span className="text-amber-400 ml-0.5" title="Passive Bonus">+{passiveBonus}</span>}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, label, color, onClick, disabled }: any) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`${color} hover:brightness-110 px-6 py-3 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 shadow-lg min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Icon size={20} className="text-white" />
      <span className="text-[10px] font-black uppercase tracking-wider text-white/90">{label}</span>
    </button>
  );
}
