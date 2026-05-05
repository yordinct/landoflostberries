import React, { useState, useEffect } from 'react';
import { 
  Sword, Shield, Wand, Zap, Flame, Droplets, Wind, Mountain, 
  Moon, Sun, Ghost, Heart, Star, Sparkles, Brain, Compass, 
  Users, Castle, Gem, Hammer, Book, Scroll, Map as MapIcon, 
  Gamepad2, Skull, Trophy, Settings, Briefcase, ChevronRight,
  Crosshair, LucideIcon, Menu, X, Plus, Info, Zap as ManaIcon,
  ShoppingBag, Target, UserPlus, AlertCircle, ArrowLeft, Globe, Flag, Activity,
  User as UserIcon, DoorOpen, TrendingUp, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerState, Character, Race, Class, Element, Beast, SaveSlot, Screen, CharacterRole, PassiveMission } from './types';
import { RACES, CLASSES, AFFINITIES, REGIONS, INITIAL_BEASTS, RECRUITABLE_CHARACTERS, RACE_DATA } from './constants';
import Combat from './components/Combat';
import CharacterAvatar from './components/CharacterAvatar';
import Diplomacy from './components/Diplomacy';
import MissionsView from './components/Missions';
import UserGuide from './components/UserGuide';
import League from './components/League';
import EventEncounter, { ExplorationEvent } from './components/EventEncounter';
import { generateExplorationEvent } from './services/eventService';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { saveGame as dbSave, loadGame as dbLoad, getAllSaves, deleteSave as dbDeleteSave } from './services/dbService';
import { getCharacterRank } from './utils';
import { GoogleGenAI } from "@google/genai";

export default function App() {
  const [screen, setScreen] = useState<Screen>('Menu');
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [logs, setLogs] = useState<string[]>(['Welcome to Land of Lost Berries.']);
  const [activeEnemy, setActiveEnemy] = useState<any[]>([]);
  const [saveSlot, setSaveSlot] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [incomeTimer, setIncomeTimer] = useState(60); // Seconds until next passive income
  const [showChronicle, setShowChronicle] = useState(true);
  const [invocationResult, setInvocationResult] = useState<Beast | null>(null);
  const [isInvoking, setIsInvoking] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<ExplorationEvent | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));

  const activateLegacy = () => {
    if (!player || (player.luck || 0) < 30) return;
    setPlayer(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        luck: prev.luck - 30,
        resources: {
          ...prev.resources,
          gold: (Number(prev.resources.gold) || 0) + 1000,
          food: (Number(prev.resources.food) || 0) + 1000,
        }
      };
    });
    addLog("You activated Bloodline Legacy! Gathered immense resources at the cost of 30 Luck.");
  };

  const changeScreen = (newScreen: Screen) => {
    if (screen !== 'Combat') {
       setPrevScreen(screen);
    }
    setScreen(newScreen);
  };

  const goBack = () => {
    if (prevScreen) {
      setScreen(prevScreen);
      setPrevScreen(null);
    } else {
      setScreen('Base');
    }
  };

  const saveGameData = async (state: PlayerState, slot: number) => {
    const updatedState = { ...state, updatedAt: Date.now() };
    if (user) {
      await dbSave(slot, updatedState);
    } else {
      localStorage.setItem(`koa_save_slot_${slot}`, JSON.stringify(updatedState));
    }
    return updatedState;
  };

  useEffect(() => {
    if (player && saveSlot !== null) {
      const interval = setInterval(() => {
        saveGameData(player, saveSlot);
        addLog("Autosaving progress...");
      }, 30000); // Auto-save every 30 seconds
      return () => clearInterval(interval);
    }
  }, [player, saveSlot, user]);

  const loadSlot = async (slot: number) => {
    try {
      let savedData: PlayerState | null = null;
      if (user) {
        try {
          savedData = await dbLoad(slot);
        } catch (e) {
          console.error("dbLoad failed", e);
          savedData = null;
        }
      } 
      
      if (!savedData) {
        const saved = localStorage.getItem(`koa_save_slot_${slot}`);
        if (saved) {
          try {
            savedData = JSON.parse(saved);
          } catch (e) {
            console.error("Local save parse failed", e);
            savedData = null;
          }
        }
      }

      if (savedData) {
        const sanitizedData: PlayerState = {
          ...savedData,
          resources: {
            gold: 0, food: 0, mana: 0, wood: 0, stone: 0,
            ...(savedData.resources || {})
          },
          squad: savedData.squad || [],
          beasts: savedData.beasts || [],
          unlockedRegions: savedData.unlockedRegions || ['verdant'],
          conqueredRegions: savedData.conqueredRegions || {},
          buildings: savedData.buildings || [],
          activeQuests: savedData.activeQuests || [],
          completedQuests: savedData.completedQuests || [],
          activeMissions: savedData.activeMissions || [],
          luck: savedData.luck !== undefined ? savedData.luck : 10,
          raceExperience: savedData.raceExperience || {},
          updatedAt: savedData.updatedAt || Date.now()
        };
        setPlayer(sanitizedData);
        setSaveSlot(slot);
        setScreen('Base');
        addLog(`Loaded save from Slot ${slot}.`);
      } else {
        setSaveSlot(slot);
        setScreen('Creation');
      }
    } catch (error) {
      console.error("Critical failure during loadSlot", error);
      addLog("Error loading game. Starting new character creation.");
      setSaveSlot(slot);
      setScreen('Creation');
    }
  };

  const initializePlayer = async (data: Partial<Character>) => {
    if (saveSlot === null) return;
    const raceData = RACE_DATA[data.race as Race];
    const raceBonus = raceData?.statBonus || { hp: 0, mp: 0, str: 0, int: 0, def: 0, spd: 0, cha: 0 };
    const newPlayer: PlayerState = {
      player: {
        id: 'player',
        name: data.name || 'Hero',
        race: data.race as Race || 'Human',
        class: data.class as Class || 'Knight',
        affinity: data.affinity as Element || 'Fire',
        level: 1,
        exp: 0,
        stats: {
          hp: 100 + (raceBonus.hp || 0), 
          maxHp: 100 + (raceBonus.hp || 0), 
          mp: 50 + (raceBonus.mp || (raceBonus.int ? raceBonus.int * 5 : 0)), 
          maxMp: 50 + (raceBonus.mp || (raceBonus.int ? raceBonus.int * 5 : 0)),
          str: 10 + (raceBonus.str || 0), 
          int: 10 + (raceBonus.int || 0), 
          def: 10 + (raceBonus.def || 0), 
          spd: 10 + (raceBonus.spd || 0), 
          cha: 10 + (raceBonus.cha || 0)
        },
        personality: 'Determined',
        backstory: 'A mysterious wanderer with a destiny to fulfill.',
        loyalty: 100,
        role: 'Unassigned'
      },
      baseType: 'Guild',
      baseLevel: 1,
      resources: { gold: 1000, food: 100, mana: 50, wood: 200, stone: 100 },
      squad: [],
      beasts: [],
      unlockedRegions: ['verdant'],
      conqueredRegions: { 'verdant': 1 },
      buildings: [
        { id: 'b1', type: 'Barracks', level: 1, description: 'Increases squad capacity and training efficiency.', bonus: 'Max Squad: 2' },
        { id: 'b2', type: 'Market', level: 0, description: 'Generates passive gold and improves trade rates.', bonus: 'Gold +5/min' },
        { id: 'b3', type: 'Ancient Shrine', level: 1, description: 'Connects to the Ancestors for divine guidance.', bonus: 'Unlocks Oracle & Invocations' },
      ],
      activeQuests: [],
      completedQuests: [],
      activeMissions: [],
      luck: 10,
      raceExperience: {},
      updatedAt: Date.now()
    };
    const savedPlayer = await saveGameData(newPlayer, saveSlot);
    setPlayer(savedPlayer);
    setScreen('Base');
    addLog(`Character ${newPlayer.player.name} created and saved in Slot ${saveSlot}!`);
  };

  const startExploration = (regionId: string, isEvent: boolean = false) => {
    if (!player) return;
    setActiveRegion(regionId);
    setPrevScreen(screen);
    
    if (isEvent) {
       const event = generateExplorationEvent(regionId, player);
       setCurrentEvent(event);
       setScreen('Event');
       addLog(`Exploring ${regionId}... You encountered a rare event: ${event.title}`);
    } else {
       triggerCombat(regionId);
       addLog(`Exploring ${regionId}... Entering combat zone!`);
    }
  };

  const handleEventOutcome = (outcome: { text: string, action?: string, payload?: any }) => {
    if (!player) return;
    addLog(`Event Result: ${outcome.text}`);
    
    setTimeout(() => {
      if (outcome.action === 'combat') {
         triggerCombat(activeRegion);
      } else if (outcome.action === 'tame_pet') {
         const newBeast: Beast = {
           id: 'pet_' + Date.now(),
           name: outcome.payload.species,
           species: outcome.payload.species,
           element: outcome.payload.element,
           rarity: outcome.payload.rarity,
           level: 1,
           stats: { hp: 50, maxHp: 50, atk: 10, def: 5, spd: 10 },
           skills: outcome.payload.skills,
           bond: 10
         };
         setPlayer({ ...player, beasts: [...(player.beasts || []), newBeast] });
         addLog(`You tamed a ${newBeast.name}!`);
         setScreen('Map');
      } else if (outcome.action === 'contract_spirit') {
         const newBeast: Beast = {
           id: 'spirit_' + Date.now(),
           name: outcome.payload.name,
           species: 'Divine Manifestation',
           element: outcome.payload.element,
           rarity: outcome.payload.rarity,
           level: 1,
           stats: { hp: 100, maxHp: 100, atk: 20, def: 10, spd: 15 },
           skills: outcome.payload.skills,
           bond: 50
         };
         setPlayer({ ...player, beasts: [...(player.beasts || []), newBeast] });
         addLog(`You contracted the Spirit ${newBeast.name}!`);
         setScreen('Map');
      } else if (outcome.action === 'recruit_character') {
         const newChar: Character = {
           id: 'rec_' + Date.now(),
           name: outcome.payload.name || 'Wandering Mercenary',
           race: outcome.payload.race || 'Human',
           class: outcome.payload.class || 'Knight',
           affinity: outcome.payload.element || 'Normal',
           level: outcome.payload.level || 1,
           exp: 0,
           stats: outcome.payload.stats || { hp: 100, maxHp: 100, mp: 50, maxMp: 50, str: 10, int: 5, def: 10, spd: 10, cha: 10 },
           personality: 'Determined',
           backstory: 'Joined your cause along the journey.',
           loyalty: 50,
           role: 'Unassigned'
         };
         setPlayer({ ...player, squad: [...(player.squad || []), newChar] });
         addLog(`${newChar.name} decided to join your cause!`);
         setScreen('Map');
      } else if (outcome.action === 'pay_toll') {
         setPlayer({ 
           ...player, 
           resources: { ...player.resources, gold: Math.max(0, player.resources.gold - outcome.payload.cost) } 
         });
         setScreen('Map');
      } else if (outcome.action === 'flee_success' || outcome.action === 'ignore') {
         if (outcome.payload?.xp) {
            setPlayer(p => p ? {
              ...p,
              player: processCharacterExp(p.player, outcome.payload.xp)
            } : p);
         }
         setScreen('Map');
      } else {
         setScreen('Map');
      }
    }, 1500);
  };

  const triggerCombat = (regionId: string) => {
    const region = REGIONS.find(r => r.id === regionId);
    if (!region) return;

    const squad = player?.squad || [];
    const avgPlayerLevel = Math.max(1, Math.floor(((player?.player.level || 1) + squad.reduce((acc, s) => acc + (s.level || 1), 0)) / (1 + squad.length)));
    
    let multiplier = 1;
    if (region.difficulty > avgPlayerLevel) {
       multiplier = Math.max(1, Math.floor(region.difficulty / avgPlayerLevel));
    }

    const enemies = (region.enemies || []).map(name => ({
      id: 'enemy_' + Math.random(),
      name: multiplier > 1 ? `Enhanced ${name} LV${region.difficulty * multiplier}` : name,
      level: (region.difficulty + Math.floor(Math.random() * 2)) * multiplier,
      stats: { 
        hp: (50 + region.difficulty * 10) * multiplier, 
        maxHp: (50 + region.difficulty * 10) * multiplier,
        atk: (10 + region.difficulty * 3) * multiplier,
        def: (5 + region.difficulty * 1) * multiplier,
        spd: (5 + region.difficulty * 1) * multiplier,
        mp: 30 * multiplier,
        maxMp: 30 * multiplier
      },
      element: name.includes('Wolf') ? 'Wind' : name.includes('Slime') ? 'Water' : (name.includes('Dragon') ? 'Fire' : 'Earth')
    }));

    const squadParty = (player?.squad || []);
    const deployedBeasts = (player?.beasts || []).filter(b => b.isDeployed);
    const fullParty = [player!.player, ...squadParty, ...deployedBeasts];
    
    setActiveEnemy(enemies);
    setScreen('Combat');
    addLog(`BATTLE IN ${region.name.toUpperCase()}! Your party of ${fullParty.length} engages the enemy legion. ${multiplier > 1 ? `[WARNING: Enemy Power Multiplied x${multiplier}]` : ''}`);
  };

  const processCharacterExp = (char: Character, expGain: number): Character => {
    let newExp = char.exp + expGain;
    let newLevel = char.level;
    const newStats = { ...char.stats };
    let unspent = char.unspentStatPoints || 0;
    
    while (true) {
      const levelUpExp = newLevel * 100 * 1.5;
      if (newExp >= levelUpExp) {
        newExp -= levelUpExp;
        newLevel += 1;
        unspent += 3;
        newStats.maxHp += 15;
        newStats.hp = newStats.maxHp;
        newStats.maxMp += 5;
        newStats.mp = newStats.maxMp;
        newStats.str += 1;
        newStats.def += 1;
        newStats.spd += 1;
        newStats.int += 1;
        newStats.cha += 1;
      } else {
        break;
      }
    }
    
    return { ...char, exp: newExp, level: newLevel, stats: newStats, unspentStatPoints: unspent };
  };

  const processBeastExp = (beast: Beast, expGain: number): Beast => {
    let newExp = (beast.exp || 0) + expGain;
    let newLevel = beast.level;
    const newStats = { ...beast.stats };
    
    while (true) {
      const levelUpExp = newLevel * 80 * 1.2;
      if (newExp >= levelUpExp) {
        newExp -= levelUpExp;
        newLevel += 1;
        newStats.maxHp += 10;
        newStats.hp = newStats.maxHp;
        newStats.atk += 2;
        newStats.def += 1;
        newStats.spd += 1;
      } else {
        break;
      }
    }

    return { ...beast, exp: newExp, level: newLevel, stats: newStats };
  };

  const allocateStat = (charId: string, statLabel: string) => {
    if (!player) return;
    
    const updateChar = (c: Character) => {
       if (c.id !== charId) return c;
       if (!c.unspentStatPoints || c.unspentStatPoints <= 0) return c;
       const statKeyMap: Record<string, keyof Character['stats']> = {
          'Strength': 'str',
          'Intelligence': 'int',
          'Defense': 'def',
          'Speed': 'spd',
          'Charisma': 'cha'
       };
       const st = statKeyMap[statLabel];
       if (!st) return c;
       return {
          ...c,
          unspentStatPoints: c.unspentStatPoints - 1,
          stats: {
             ...c.stats,
             [st]: (c.stats[st] || 0) + 1
          }
       };
    };

    setPlayer({
       ...player,
       player: updateChar(player.player),
       squad: player.squad.map(updateChar)
    });
  };

  const handleWin = (loot: any) => {
    if (!player) return;
    
    setPlayer(prev => {
      if (!prev) return prev;
      const currentGold = Number(prev.resources.gold) || 0;
      const updatedResources = { ...prev.resources, gold: currentGold + (Number(loot.gold) || 0) };
      
      if (loot.resources) {
        Object.entries(loot.resources).forEach(([key, val]) => {
          if (key in updatedResources) {
            (updatedResources as any)[key] = (Number((updatedResources as any)[key]) || 0) + (Number(val) || 0);
          }
        });
      }

      const regionalEnemy = activeEnemy.find(e => e.regionId);
      let newConquered = { ...prev.conqueredRegions };
      if (regionalEnemy && regionalEnemy.regionId) {
        newConquered[regionalEnemy.regionId] = Math.max(newConquered[regionalEnemy.regionId] || 0, 1);
      }

      const deployedBeastsCount = (prev.beasts || []).filter(b => b.isDeployed).length;
      const totalParticipants = 1 + (prev.squad?.length || 0) + deployedBeastsCount;
      const expShare = Math.floor((Number(loot.exp) || 0) / totalParticipants);
      
      const updatedSquad = (prev.squad || []).map(m => processCharacterExp(m, expShare));
      const updatedHero = processCharacterExp(prev.player, expShare);
      const updatedBeasts = (prev.beasts || []).map(b => b.isDeployed ? processBeastExp(b, expShare) : b);

      const newUnlockedRegions = [...prev.unlockedRegions];
      REGIONS.forEach(region => {
        if (updatedHero.level >= region.requiredLevel && !newUnlockedRegions.includes(region.id)) {
          newUnlockedRegions.push(region.id);
        }
      });

      return {
        ...prev,
        resources: updatedResources,
        player: updatedHero,
        squad: updatedSquad,
        beasts: updatedBeasts,
        unlockedRegions: newUnlockedRegions,
        luck: (prev.luck || 0) + (Number(loot.luck) || 0),
        conqueredRegions: newConquered
      };
    });

    changeScreen('Map');
    addLog(`Victory! Gained ${loot.gold} Gold, ${loot.exp} EXP and ${loot.luck} Luck.`);
  };

  const upgradeBuilding = (buildingId: string) => {
    if (!player) return;
    const building = player.buildings.find(b => b.id === buildingId);
    if (!building) return;

    let cost = (building.level + 1) * 350;
    let woodCost = (building.level + 1) * 100;
    let stoneCost = (building.level + 1) * 50;
    let reqLevel = 1;

    if (building.type === 'Barracks') {
        cost = Math.floor(Math.pow(10, building.level) * 100000);
        woodCost = Math.floor(Math.pow(8, building.level) * 50000);
        stoneCost = Math.floor(Math.pow(8, building.level) * 50000);
        reqLevel = (building.level * 20) + 10;
        
        if (player.player.level < reqLevel) {
            addLog(`Barracks upgrade requires Player Level ${reqLevel}.`);
            return;
        }
    }
    
    if ((Number(player.resources.gold) || 0) < cost || (Number(player.resources.wood) || 0) < woodCost || (Number(player.resources.stone) || 0) < stoneCost) {
      const formatNum = (num: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
      addLog(`Need: ${formatNum(cost)}G, ${formatNum(woodCost)}W, ${formatNum(stoneCost)}S for upgrade.`);
      return;
    }

    const updatedBuildings = (player.buildings || []).map(b => 
      b.id === buildingId ? { ...b, level: b.level + 1 } : b
    );
    setPlayer({
      ...player,
      buildings: updatedBuildings,
      resources: {
        ...player.resources,
        gold: Math.max(0, (Number(player.resources.gold) || 0) - cost),
        wood: Math.max(0, (Number(player.resources.wood) || 0) - woodCost),
        stone: Math.max(0, (Number(player.resources.stone) || 0) - stoneCost)
      }
    });
    addLog(`${building.type} upgraded to Level ${building.level + 1}!`);
  };

  useEffect(() => {
    if (!player) return;
    const interval = setInterval(() => {
      setIncomeTimer(prev => {
        if (prev <= 1) {
          setPlayer(p => {
            if (!p) return null;
            let incomeGold = 0;
            let incomeFood = 0;
            let incomeWood = 0;
            let incomeStone = 0;

            Object.entries(p.conqueredRegions).forEach(([regId, level]) => {
              const region = REGIONS.find(r => r.id === regId);
              const lv = Number(level) || 0;
              incomeGold += (lv * 15) + 10;
              
              if (region) {
                if (region.resources.includes('Food')) incomeFood += lv * 5;
                if (region.resources.includes('Wood')) incomeWood += lv * 5;
                if (region.resources.includes('Stone')) incomeStone += lv * 5;
                if (region.resources.includes('Mana Crystals')) incomeGold += lv * 2;
              }
            });

            const marketBonus = p.buildings.find(b => b.type === 'Market')?.level || 0;
            
            return {
              ...p,
              resources: {
                ...p.resources,
                gold: (Number(p.resources.gold) || 0) + incomeGold + (marketBonus * 20),
                wood: (Number(p.resources.wood) || 0) + incomeWood + (marketBonus * 5),
                stone: (Number(p.resources.stone) || 0) + incomeStone + (marketBonus * 5),
                food: (Number(p.resources.food) || 0) + incomeFood + (marketBonus * 10),
                mana: (Number(p.resources.mana) || 0) + (p.buildings.find(b => b.type === 'Ancient Shrine')?.level || 0) * 10
              }
            };
          });
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [player !== null]);

  const upgradeBase = () => {
    if (!player) return;
    const cost = (player.baseLevel + 1) * 500;
    const woodCost = (player.baseLevel + 1) * 150;
    const stoneCost = (player.baseLevel + 1) * 100;
    const reqLevel = player.baseLevel * 2;

    if (player.player.level < reqLevel) {
       addLog(`Commander Level ${reqLevel} is required to upgrade the base to tier ${player.baseLevel + 1}. Current: ${player.player.level}. Go fight to gain EXP!`);
       return;
    }

    if (Number(player.resources.gold) < cost || Number(player.resources.wood || 0) < woodCost || Number(player.resources.stone || 0) < stoneCost) {
       addLog(`Need ${cost} Gold, ${woodCost} Wood, ${stoneCost} Stone to upgrade base.`);
       return;
    }

    setPlayer({
      ...player,
      baseLevel: player.baseLevel + 1,
      resources: { 
        ...player.resources, 
        gold: Math.max(0, (Number(player.resources.gold) || 0) - cost),
        wood: Math.max(0, (Number(player.resources.wood) || 0) - woodCost),
        stone: Math.max(0, (Number(player.resources.stone) || 0) - stoneCost)
      }
    });
    addLog(`Base upgraded to Level ${player.baseLevel + 1}! Territory expansion capacity increased.`);
  };

  const recruitMember = (char: Character) => {
    if (!player) return;
    const barracksLevel = player.buildings.find(b => b.type === 'Barracks')?.level || 1;
    const maxSquad = 5 + (barracksLevel * 4);
    
    if (player.squad.length >= maxSquad) {
      addLog(`Your current housing (Barracks Level ${barracksLevel}) only supports ${maxSquad} heroes.`);
      return;
    }

    if (player.resources.gold >= 300) {
       setPlayer({
         ...player,
         squad: [...player.squad, { ...char, role: 'Unassigned' }],
         resources: { ...player.resources, gold: Math.max(0, player.resources.gold - 300) }
       });
       addLog(`${char.name} has joined your squad!`);
    } else {
       addLog(`Not enough gold to recruit ${char.name}.`);
    }
  };

  const specialRecruit = (type: 'Exploration' | 'Trade') => {
    if (!player) return;
    const barracksLevel = player.buildings.find(b => b.type === 'Barracks')?.level || 1;
    const maxSquad = 5 + (barracksLevel * 4);
    
    if (player.squad.length >= maxSquad) {
      addLog(`Your current housing (Barracks Level ${barracksLevel}) only supports ${maxSquad} heroes.`);
      return;
    }

    const generateStatsForLevel = (lvl: number, baseBoost: number) => {
      const b = 10 + (lvl * 3) + baseBoost;
      return {
        hp: b * 10, maxHp: b * 10,
        mp: b * 3, maxMp: b * 3,
        str: b, def: b - 2, spd: b - 1, int: b, cha: b - 3
      };
    };

    if (type === 'Exploration') {
      if (player.luck < 50) {
        addLog("You need 50 Luck to discover a wandering hero.");
        return;
      }
      
      const newLevel = player.player.level + 2;
      const newChar: Character = {
        id: 'hero_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        name: `Wanderer ${Math.floor(Math.random() * 1000)}`,
        race: RACES[Math.floor(Math.random() * RACES.length)],
        class: CLASSES[Math.floor(Math.random() * CLASSES.length)],
        affinity: AFFINITIES[Math.floor(Math.random() * AFFINITIES.length)],
        level: newLevel,
        exp: 0,
        role: 'Unassigned',
        stats: generateStatsForLevel(newLevel, 5),
        personality: 'Brave',
        backstory: 'A wandering hero drawn by destiny.',
        loyalty: 80,
        isAssignedToMission: false
      };

      setPlayer({
        ...player,
        luck: Math.max(0, player.luck - 50),
        squad: [...player.squad, newChar]
      });
      addLog(`Your immense luck has attracted ${newChar.name}, a powerful Level ${newChar.level} ${newChar.class}!`);
    } else if (type === 'Trade') {
      const wood = Number(player.resources.wood) || 0;
      const food = Number(player.resources.food) || 0;
      if (wood < 1000 || food < 1000) {
        addLog("You need 1000 Wood and 1000 Food to establish a trade network recruit.");
        return;
      }

      const newLevel = player.player.level;
      const newChar: Character = {
        id: 'hero_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        name: `Mercenary ${Math.floor(Math.random() * 1000)}`,
        race: RACES[Math.floor(Math.random() * RACES.length)],
        class: CLASSES[Math.floor(Math.random() * CLASSES.length)],
        affinity: AFFINITIES[Math.floor(Math.random() * AFFINITIES.length)],
        level: newLevel,
        exp: 0,
        role: 'Unassigned',
        stats: generateStatsForLevel(newLevel, -2),
        personality: 'Loyal',
        backstory: 'A skilled mercenary hired for a hefty price.',
        loyalty: 60,
        isAssignedToMission: false
      };

      setPlayer({
        ...player,
        resources: {
          ...player.resources,
          wood: wood - 1000,
          food: food - 1000
        },
        squad: [...player.squad, newChar]
      });
      addLog(`Trade networks successfully hired ${newChar.name}, a Level ${newChar.level} ${newChar.class}!`);
    }
  };

  const assignRole = (charId: string, role: CharacterRole) => {
    if (!player) return;
    
    if (player.player.id === charId) {
      setPlayer({
        ...player,
        player: { ...player.player, role }
      });
      addLog(`Hero's role changed to ${role}.`);
      return;
    }

    const updatedSquad = (player.squad || []).map(m => 
      m.id === charId ? { ...m, role } : m
    );

    setPlayer({
      ...player,
      squad: updatedSquad
    });
    
    addLog(`Assigned role ${role} to squad member.`);
  };

  const toggleBeastDeployment = (beastId: string) => {
    if (!player) return;
    const beast = (player.beasts || []).find(b => b.id === beastId);
    if (!beast) return;

    if (!beast.isDeployed) {
      const allChars = [player.player, ...(player.squad || [])];
      const isEquipped = allChars.some(c => c.equippedBeastId === beastId);
      if (isEquipped) {
        addLog(`${beast.name} is currently soul-linked to a hero and cannot also be deployed in the squad!`);
        return;
      }

      const deployedCount = (player.beasts || []).filter(b => b.isDeployed).length;
      if (deployedCount >= 1) {
        addLog("Maximum of 1 active beast can be deployed from the Sanctuary!");
        return;
      }
    }

    const updatedBeasts = (player.beasts || []).map(b => 
      b.id === beastId ? { ...b, isDeployed: !b.isDeployed } : b
    );

    setPlayer({ ...player, beasts: updatedBeasts });
    addLog(beast.isDeployed ? `Sent ${beast.name} back to Sanctuary.` : `Active combat deployment for ${beast.name} enabled.`);
  };

  const equipBeast = (charId: string, beastId: string | null) => {
    if (!player) return;
    
    if (beastId) {
      const beast = (player.beasts || []).find(b => b.id === beastId);
      if (beast?.isDeployed) {
        addLog(`${beast.name} is already fighting in the squad and cannot be soul-linked!`);
        return;
      }

      const allChars = [player.player, ...(player.squad || [])];
      const alreadyLinked = allChars.find(c => c.equippedBeastId === beastId);
      if (alreadyLinked && alreadyLinked.id !== charId) {
        addLog(`${beast.name} is already soul-linked to ${alreadyLinked.name}!`);
        return;
      }
    }

    if (player.player.id === charId) {
      setPlayer({ ...player, player: { ...player.player, equippedBeastId: beastId || undefined } });
      addLog(beastId ? "Spirit soul-linked to Hero." : "Spirit link severed from Hero.");
      return;
    }

    const updatedSquad = (player.squad || []).map(m => 
      m.id === charId ? { ...m, equippedBeastId: beastId || undefined } : m
    );

    setPlayer({ ...player, squad: updatedSquad });
    addLog(beastId ? "Spirit soul-linked to squad member." : "Spirit link severed from squad member.");
  };

  const levelUpBeast = (beastId: string, cost: number) => {
    if (!player) return;
    const beastIndex = (player.beasts || []).findIndex(b => b.id === beastId);
    if (beastIndex === -1 || player.resources.gold < cost) return;

    const newBeasts = [...player.beasts];
    const beast = newBeasts[beastIndex];
    
    const rarityMults: any = { 'Common': 1, 'Uncommon': 1.2, 'Rare': 1.5, 'Epic': 2, 'Legendary': 3, 'Mythic': 4, 'Ancient': 5 };
    const multiplier = rarityMults[beast.rarity] || 1;

    newBeasts[beastIndex] = {
      ...beast,
      level: beast.level + 1,
      stats: {
        hp: beast.stats.maxHp + Math.floor(15 * multiplier),
        maxHp: beast.stats.maxHp + Math.floor(15 * multiplier),
        atk: beast.stats.atk + Math.floor(4 * multiplier),
        def: beast.stats.def + Math.floor(3 * multiplier),
        spd: beast.stats.spd + Math.floor(2 * multiplier)
      }
    };

    setPlayer({
      ...player,
      resources: {
         ...player.resources,
         gold: player.resources.gold - cost
      },
      beasts: newBeasts
    });
    addLog(`Enhanced ${beast.name} to level ${beast.level + 1}!`);
  };

  const sellBeast = (beastId: string) => {
    if (!player) return;
    const beast = (player.beasts || []).find(b => b.id === beastId);
    if (!beast) return;

    const rarityMap: Record<string, number> = {
      'Common': 50,
      'Uncommon': 150,
      'Rare': 450,
      'Epic': 1200,
      'Legendary': 3500,
      'Mythic': 10000,
      'Ancient': 25000
    };
    
    const baseValue = rarityMap[beast.rarity] || 50;
    const levelBonus = beast.level * 25;
    const totalValue = Math.floor(baseValue + levelBonus);

    let updatedHero = { ...player.player };
    if (updatedHero.equippedBeastId === beastId) {
      updatedHero = { ...updatedHero, equippedBeastId: undefined };
    }
    
    const updatedSquad = (player.squad || []).map(m => 
      m.equippedBeastId === beastId ? { ...m, equippedBeastId: undefined } : m
    );

    setPlayer({
      ...player,
      resources: { 
        ...player.resources, 
        gold: (Number(player.resources.gold) || 0) + totalValue 
      },
      beasts: (player.beasts || []).filter(b => b.id !== beastId),
      player: updatedHero,
      squad: updatedSquad
    });

    addLog(`Sold ${beast.name} (${beast.rarity}) for ${totalValue} Gold.`);
  };

  const ascendBeasts = (speciesId: string, level: number, rarity: string) => {
    if (!player) return;
    
    const targets = (player.beasts || []).filter(b => b.species === speciesId && b.level === level && b.rarity === rarity && !b.isDeployed);
    if (targets.length < 10) return;
    
    const consumed = targets.slice(0, 10);
    const consumedIds = consumed.map(b => b.id);
    const baseBeast = consumed[0];
    
    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Ancient'];
    const currentIdx = rarityOrder.indexOf(rarity);
    const nextRarity = rarityOrder[Math.min(currentIdx + 1, rarityOrder.length - 1)];

    const rarityMults: Record<string, number> = { 'Common': 1, 'Uncommon': 1.2, 'Rare': 1.5, 'Epic': 2, 'Legendary': 3, 'Mythic': 4, 'Ancient': 5 };
    const multiplier = rarityMults[nextRarity] || 1;

    const newBeast: Beast = {
      ...baseBeast,
      id: 'asc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      rarity: nextRarity as any,
      stats: {
        hp: Math.floor(baseBeast.stats.maxHp * 1.5),
        maxHp: Math.floor(baseBeast.stats.maxHp * 1.5),
        atk: Math.floor(baseBeast.stats.atk * 1.5),
        def: Math.floor(baseBeast.stats.def * 1.5),
        spd: Math.floor(baseBeast.stats.spd * 1.5),
      }
    };

    setPlayer({
      ...player,
      beasts: [
        ...(player.beasts || []).filter(b => !consumedIds.includes(b.id)),
        newBeast
      ]
    });

    addLog(`Ascension complete! 10 ${rarity} ${speciesId} fused into a ${nextRarity} ${speciesId}!`);
  };

  const releaseBeast = (beastId: string) => {
    if (!player) return;
    const beast = (player.beasts || []).find(b => b.id === beastId);
    if (!beast) return;

    const updatedHero = { ...player.player };
    if (updatedHero.equippedBeastId === beastId) delete updatedHero.equippedBeastId;
    
    const updatedSquad = (player.squad || []).map(m => 
      m.equippedBeastId === beastId ? { ...m, equippedBeastId: undefined } : m
    );

    setPlayer({
      ...player,
      beasts: (player.beasts || []).filter(b => b.id !== beastId),
      player: updatedHero,
      squad: updatedSquad
    });

    addLog(`Released ${beast.name} back into the wild.`);
  };

  const manageRegion = (regionId: string, action: 'develop') => {
    if (!player) return;
    const level = player.conqueredRegions[regionId] || 0;
    const cost = (level + 1) * 300;

    if (player.resources.gold >= cost) {
      setPlayer({
        ...player,
        resources: { ...player.resources, gold: player.resources.gold - cost },
        conqueredRegions: { ...player.conqueredRegions, [regionId]: level + 1 }
      });
      addLog(`Developed ${regionId}. New Level: ${level + 1}`);
    } else {
      addLog(`Need ${cost} Gold to develop ${regionId}.`);
    }
  };

  const evolveHero = () => {
    if (!player) return;
    setPlayer({
      ...player,
      player: {
        ...player.player,
        isHeroEvolved: true,
        stats: {
          ...player.player.stats,
          maxHp: Math.floor(player.player.stats.maxHp * 1.5),
          hp: Math.floor(player.player.stats.maxHp * 1.5),
          str: Math.floor(player.player.stats.str * 1.5),
          int: Math.floor(player.player.stats.int * 1.5),
          def: Math.floor(player.player.stats.def * 1.5)
        }
      }
    });
    addLog(`Hero ${player.player.name} has EVOLVED to a higher state of power!`);
  };

  const assignRightHand = (id: string) => {
    if (!player) return;
    const char = player.squad.find(s => s.id === id);
    if (!char) return;
    setPlayer({
      ...player,
      rightHandManId: id
    });
    addLog(`${char.name} has been appointed as First in Command!`);
  };

  const evolveRightHand = () => {
    if (!player || !player.rightHandManId) return;
    
    const updatedSquad = player.squad.map(sq => {
      if (sq.id === player.rightHandManId) {
        return {
          ...sq,
          stats: {
           ...sq.stats,
           str: Math.floor(sq.stats.str * 1.3),
           int: Math.floor(sq.stats.int * 1.3),
           def: Math.floor(sq.stats.def * 1.3),
          }
        };
      }
      return sq;
    });

    setPlayer({
      ...player,
      rightHandManEvolved: true,
      squad: updatedSquad
    });
    addLog(`First in Command has been promoted to Hand of the King! Stats permanently boosted.`);
  };

  const startInvasion = (regionId: string) => {
    const region = REGIONS.find(r => r.id === regionId);
    if (!region || !player) return;
    
    const activeBeasts = (player.beasts || []).filter(b => b.isDeployed);
    const squadMembers = player.squad || [];
    const fullParty = [player.player, ...squadMembers, ...activeBeasts];

    setActiveEnemy([{
      id: 'guardian_' + Math.random(),
      name: `Guardian of ${region.name}`,
      regionId: region.id,
      level: region.difficulty + 2,
      stats: { 
        hp: 120 + region.difficulty * 25, 
        maxHp: 120 + region.difficulty * 25,
        atk: 22 + region.difficulty * 6,
        def: 12 + region.difficulty * 2,
        spd: 12 + region.difficulty * 2,
        mp: 50,
        maxMp: 50
      },
      element: 'Void' as any
    }]);
    
    setScreen('Combat');
    addLog(`DIPLOMATIC INVASION: Engaging ${region.name} Guardian with your vanguard of ${fullParty.length}.`);
  };

  const claimMissionRewards = (missionId: string) => {
    if (!player) return;
    const mission = player.activeMissions?.find(m => m.id === missionId);
    if (!mission) return;

    const updatedResources = { ...player.resources };
    updatedResources.gold += mission.reward.gold;
    if (mission.reward.resources) {
      Object.entries(mission.reward.resources).forEach(([key, val]) => {
        if (key in updatedResources) {
          (updatedResources as any)[key] += val;
        }
      });
    }

    const updatedSquad = (player.squad || []).map(m => {
      if (mission.assignedCharacterIds.includes(m.id)) {
        return processCharacterExp(m, mission.reward.exp);
      }
      return m;
    });

    setPlayer({
      ...player,
      resources: updatedResources,
      squad: updatedSquad,
      activeMissions: player.activeMissions!.filter(m => m.id !== missionId)
    });

    addLog(`Mission "${mission.name}" completed! Claimed ${mission.reward.gold} Gold and ${mission.reward.exp} EXP.`);
  };

  const handleCapture = (beast: Beast) => {
    if (!player) return;
    
    const legendaryPassives = ['World Weaver', 'Timeless Aura', 'Gravity Well', 'Soul Devourer'];
    const legendaryActives = ['Celestial Strike', 'Meteor Swarm', 'Abyssal Chasm', 'Divine Retribution'];
    
    const mythicPassives = ['Godly Presence', 'Reality Bender', 'Omniscience', 'Void Walker'];
    const mythicActives = ['Obliteration Ray', 'Starsurge', 'Eon Shift', 'Cataclysm'];
    
    const ancientPassives = ['Primordial Source', 'Creator's Breath', 'Eternal Light', 'Origin Point'];
    const ancientActives = ['Supernova', 'Genesis', 'Omega Flare', 'Cosmic Annihilation'];

    const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    let selectedSkills = beast.skills && beast.skills.length > 0 ? beast.skills : ['Tackle'];
    if (!beast.skills || beast.skills.length === 0) {
      const rarity = beast.rarity || 'Common';
      if (rarity === 'Common') selectedSkills = ['Scratch'];
      else if (rarity === 'Uncommon') selectedSkills = ['Bite', 'Dash'];
      else if (rarity === 'Rare') selectedSkills = ['Elemental Burst', 'Guard'];
      else if (rarity === 'Epic') selectedSkills = ['Ancient Roar (Passive)', 'Elemental Burst'];
      else if (rarity === 'Legendary') selectedSkills = [`${pickRandom(legendaryPassives)} (Passive)`, pickRandom(legendaryActives)];
      else if (rarity === 'Mythic') selectedSkills = [`${pickRandom(mythicPassives)} (Passive)`, pickRandom(mythicActives)];
      else if (rarity === 'Ancient') selectedSkills = [`${pickRandom(ancientPassives)} (Passive)`, pickRandom(ancientActives)];
    }
    
    const newBeast: Beast = {
      id: beast.id || 'b_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      name: beast.name || 'Wild Spirit',
      species: beast.species || beast.name || 'Captured Beast',
      element: beast.element || 'Normal' as any,
      rarity: beast.rarity || 'Common',
      level: beast.level || 1,
      stats: beast.stats || { hp: 50, maxHp: 50, atk: 10, def: 10, spd: 10 },
      skills: selectedSkills,
      bond: 0
    };

    setPlayer({
      ...player,
      beasts: [...(player.beasts || []), newBeast]
    });
    addLog(`New beast ${newBeast.name} captured! it has been sent to the Sanctuary.`);
  };

  const summonSpirit = () => {
    if (!player) return;
    const shrine = player.buildings.find(b => b.type === 'Ancient Shrine');
    if (!shrine || shrine.level === 0) {
      addLog("The Ancient Shrine must be Level 1+ to summon spirits.");
      return;
    }

    const maxBeasts = 100;
    if (player.beasts && player.beasts.length >= maxBeasts) {
      addLog(`Primal Sanctuary is full! Max capacity: ${maxBeasts}.`);
      return;
    }

    const goldCost = 500;
    const luckCost = 10;
    if (player.resources.gold < goldCost) {
      addLog("Not enough Gold for an invocation.");
      return;
    }

    if ((player.luck || 0) < luckCost) {
      addLog(`Not enough Luck for an invocation. Required: ${luckCost}.`);
      return;
    }

    setIsInvoking(true);
    addLog("You cast an invocation... A new spirit answers the call!");

    setTimeout(() => {
      setPlayer(prev => {
        if (!prev) return null;
        const roll = Math.random() * 100 + prev.luck;
        let rarity: any = 'Common';
        if (roll > 105) rarity = 'Ancient';
        else if (roll > 95) rarity = 'Mythic';
        else if (roll > 85) rarity = 'Legendary';
        else if (roll > 70) rarity = 'Epic';
        else if (roll > 50) rarity = 'Rare';
        else if (roll > 30) rarity = 'Uncommon';

        const rarityMults: Record<string, number> = { 'Common': 1, 'Uncommon': 1.2, 'Rare': 1.5, 'Epic': 2, 'Legendary': 3, 'Mythic': 4, 'Ancient': 5 };
        const legendaryPassives = ['World Weaver', 'Timeless Aura', 'Gravity Well', 'Soul Devourer'];
        const legendaryActives = ['Celestial Strike', 'Meteor Swarm', 'Abyssal Chasm', 'Divine Retribution'];
        
        const mythicPassives = ['Godly Presence', 'Reality Bender', 'Omniscience', 'Void Walker'];
        const mythicActives = ['Obliteration Ray', 'Starsurge', 'Eon Shift', 'Cataclysm'];
        
        const ancientPassives = ['Primordial Source', 'Creator's Breath', 'Eternal Light', 'Origin Point'];
        const ancientActives = ['Supernova', 'Genesis', 'Omega Flare', 'Cosmic Annihilation'];

        const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        let selectedSkills = ['Divine Spark'];
        if (rarity === 'Common') selectedSkills = ['Scratch'];
        else if (rarity === 'Uncommon') selectedSkills = ['Bite', 'Dash'];
        else if (rarity === 'Rare') selectedSkills = ['Elemental Burst', 'Guard'];
        else if (rarity === 'Epic') selectedSkills = ['Ancient Roar (Passive)', 'Elemental Burst'];
        else if (rarity === 'Legendary') selectedSkills = [`${pickRandom(legendaryPassives)} (Passive)`, pickRandom(legendaryActives)];
        else if (rarity === 'Mythic') selectedSkills = [`${pickRandom(mythicPassives)} (Passive)`, pickRandom(mythicActives)];
        else if (rarity === 'Ancient') selectedSkills = [`${pickRandom(ancientPassives)} (Passive)`, pickRandom(ancientActives)];

        const multiplier = rarityMults[rarity as string] || 1;
        const uniqueVariance = 0.9 + (Math.random() * 0.2);

        const newBeast: Beast = {
          id: 'sum_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          name: `${rarity} Spirit`,
          species: 'Divine Manifestation',
          element: AFFINITIES[Math.floor(Math.random() * AFFINITIES.length)],
          rarity,
          level: 1,
          stats: { 
            hp: Math.floor(100 * multiplier * uniqueVariance), 
            maxHp: Math.floor(100 * multiplier * uniqueVariance), 
            atk: Math.floor(15 * multiplier * uniqueVariance), 
            def: Math.floor(10 * multiplier * uniqueVariance), 
            spd: Math.floor(12 * multiplier * uniqueVariance) 
          },
          skills: selectedSkills,
          bond: 10
        };

        setInvocationResult(newBeast);

        return {
          ...prev,
          resources: { ...prev.resources, gold: Math.max(0, (Number(prev.resources.gold) || 0) - goldCost) },
          luck: Math.max(0, prev.luck - luckCost)
        };
      });
      setIsInvoking(false);
    }, 2500);
  };

  const handleInvocationChoice = (choice: 'Accept' | 'Sell' | 'Release') => {
     if (!player || !invocationResult) return;
     if (choice === 'Accept') {
        setPlayer({ ...player, beasts: [...(player.beasts || []), invocationResult] });
        addLog(`${invocationResult.name} has joined the sanctuary.`);
     } else if (choice === 'Sell') {
        const rarities: Record<string, number> = { 'Common': 50, 'Uncommon': 100, 'Rare': 300, 'Epic': 800, 'Legendary': 2000, 'Mythic': 5000, 'Ancient': 10000 };
        const val = rarities[invocationResult.rarity] || 50;
        setPlayer({ ...player, resources: { ...player.resources, gold: (Number(player.resources.gold) || 0) + val } });
        addLog(`${invocationResult.name} was sold for ${val} Gold.`);
     } else {
        setPlayer({ ...player, luck: (player.luck || 0) + 2 });
        addLog(`${invocationResult.name} was released safely. You feel slightly luckier (+2).`);
     }
     setInvocationResult(null);
  };

  const deployMission = (mission: any) => {
    if (!player) return;
    if (player.activeMissions && player.activeMissions.length >= 3) {
      addLog("Maximum mission capacity reached!");
      return;
    }
    
    const busyIds = (player.activeMissions || []).flatMap(m => m.assignedCharacterIds);
    const availableMember = player.squad.find(m => !busyIds.includes(m.id));

    if (!availableMember) {
      addLog("No available squad members for this mission!");
      return;
    }

    let rewardMult = 1.0;
    if (mission.type === 'Exploration' && availableMember.role === 'Scout') rewardMult = 1.5;
    if (mission.type === 'resource_gathering' && availableMember.role === 'Worker') rewardMult = 1.8;
    if (mission.type === 'training' && availableMember.role === 'Soldier') rewardMult = 1.4;

    const newMission: PassiveMission = {
      ...mission,
      id: 'mission_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      startTime: Date.now(),
      assignedCharacterIds: [availableMember.id],
      reward: {
        ...mission.reward,
        exp: Math.floor(mission.reward.exp * rewardMult),
        gold: Math.floor(mission.reward.gold * rewardMult)
      }
    };

    setPlayer({
      ...player,
      activeMissions: [...(player.activeMissions || []), newMission]
    });
    addLog(`Mission "${mission.name}" started! ${availableMember.name} (${availableMember.role}) is deploying.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      <AnimatePresence mode="wait">
        {screen === 'Menu' && (
          <MainMenu 
            onStart={() => setScreen('Slots')} 
            user={user}
          />
        )}
        {screen === 'Slots' && (
           <SaveSlotsMenu onSelect={loadSlot} user={user} />
        )}
        {screen === 'Creation' && <CharacterCreation onComplete={initializePlayer} />}
        {player && screen !== 'Menu' && screen !== 'Creation' && (
          <div className="flex flex-col h-screen">
            {screen !== 'Combat' && (
              <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 transition-opacity">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CharacterAvatar 
                      race={player.player.race} 
                      characterClass={player.player.class} 
                      affinity={player.player.affinity} 
                      size="sm" 
                    />
                    <span className="font-bold tracking-tight text-white">{player.player.name}</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex gap-4 text-xs font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Gem size={14} /> <span>{Math.floor(Number(player.resources.gold) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <ShoppingBag size={14} /> <span>{Math.floor(Number(player.resources.food) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <ManaIcon size={14} /> <span>{Math.floor(Number(player.resources.mana) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 ml-2">
                      <Activity size={14} /> <span className="font-mono">{incomeTimer}s</span>
                    </div>
                  </div>
                </div>
                <nav className="flex items-center gap-2">
                  <NavButton icon={Castle} active={screen === 'Base'} onClick={() => changeScreen('Base')} label="Kingdom" />
                  <NavButton icon={Users} active={screen === 'Character'} onClick={() => changeScreen('Character')} label="Character" />
                  <NavButton icon={MapIcon} active={screen === 'Map'} onClick={() => changeScreen('Map')} label="World Map" />
                  <NavButton icon={Sword} active={screen === 'League'} onClick={() => changeScreen('League')} label="Recruits" />
                  <NavButton icon={Briefcase} active={screen === 'Squad'} onClick={() => changeScreen('Squad')} label="Squads" />
                  <NavButton icon={Heart} active={screen === 'Bestiary'} onClick={() => changeScreen('Bestiary')} label="Pets & Spirits" />
                  <NavButton icon={Globe} active={screen === 'Diplomacy'} onClick={() => changeScreen('Diplomacy')} label="Diplomacy" />
                  <NavButton icon={Activity} active={screen === 'Missions'} onClick={() => changeScreen('Missions')} label="Missions" />
                  <NavButton icon={Settings} active={screen === 'Settings'} onClick={() => changeScreen('Settings')} label="Maintenance" />
                  <NavButton icon={Info} active={screen === 'Guide'} onClick={() => changeScreen('Guide')} label="Guide" />
                  {player.buildings.find(b => b.type === 'Ancient Shrine' && b.level > 0) && (
                    <NavButton icon={Sparkles} active={screen === 'Oracle'} onClick={() => changeScreen('Oracle')} label="Oracle" />
                  )}
                  <div className="w-px h-6 bg-white/10 mx-2" />
                  <NavButton icon={Scroll} active={showChronicle} onClick={() => setShowChronicle(!showChronicle)} label="Log" />
                </nav>
              </header>
            )}

            <main className="flex-1 overflow-hidden flex flex-row relative w-full">
              <div className={`flex-1 flex flex-col ${screen === 'Combat' ? 'overflow-hidden p-0 h-full w-full' : 'overflow-y-auto p-6 relative'} scrollbar-hide`}>
                {screen !== 'Base' && screen !== 'Combat' && (
                  <div className="mb-6 flex items-center justify-between shrink-0">
                     <button 
                       onClick={goBack}
                       className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
                     >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Go Back</span>
                     </button>
                  </div>
                )}
                <AnimatePresence mode="wait">
                  {screen === 'Base' && (
                    <BaseOverview 
                      player={player} 
                      onUpgrade={upgradeBase} 
                      onUpgradeBuilding={upgradeBuilding} 
                      onSummonSpirit={summonSpirit}
                      onEvolveHero={evolveHero}
                      onAssignRightHand={assignRightHand}
                      onEvolveRightHand={evolveRightHand}
                    />
                  )}
                  {screen === 'Character' && <HeroProfile player={player} onEquipBeast={equipBeast} onAllocateStat={allocateStat} />}
                  {screen === 'Map' && <WorldMap player={player} onTravel={(r, isEvent) => startExploration(r, isEvent)} />}
                  {screen === 'Squad' && <SquadManagement player={player} onRecruit={recruitMember} onAssignRole={assignRole} onSpecialRecruit={specialRecruit} />}
                  {screen === 'League' && <League player={player} setPlayer={setPlayer as any} />}
                  {screen === 'Diplomacy' && <Diplomacy player={player} setPlayer={setPlayer} onInvasion={startInvasion} onDevelop={(id) => manageRegion(id, 'develop')} />}
                  {screen === 'Missions' && <MissionsView player={player} onDeploy={deployMission} onClaimRewards={claimMissionRewards} />}
                  {screen === 'Oracle' && <GeminiOracle player={player} onActivateLegacy={activateLegacy} />}
                  {screen === 'Guide' && <UserGuide />}
                  {screen === 'Quests' && <QuestBoard player={player} />}
                  {screen === 'Bestiary' && <Bestiary player={player} onSell={sellBeast} onRelease={releaseBeast} onToggleDeployment={toggleBeastDeployment} onLevelUp={levelUpBeast} onAscend={ascendBeasts} />}
                  {screen === 'Settings' && (
                    <div className="max-w-4xl mx-auto py-12 text-center text-slate-400">
                       <Settings size={48} className="mx-auto mb-6 opacity-20" />
                       <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">Maintenance</h2>
                       <p className="text-sm">Manage your account, saves, and system settings here.</p>
                       <div className="mt-8 flex justify-center gap-4">
                         <button onClick={() => setScreen('Slots')} className="px-6 py-3 bg-slate-900 border border-white/10 rounded-xl hover:bg-slate-800 transition-colors uppercase font-bold tracking-widest text-xs">
                           Manage Save Slots
                         </button>
                         <button 
                           onClick={async () => {
                             if (player && saveSlot !== null) {
                               await saveGameData(player, saveSlot);
                               addLog(`Game manually saved to Slot ${saveSlot}.`);
                             } else {
                               addLog("No active game session to save.");
                             }
                           }}
                           className="px-6 py-3 bg-blue-600 border border-blue-500/50 rounded-xl hover:bg-blue-500 transition-colors uppercase font-bold tracking-widest text-xs text-white"
                         >
                           Save Manually
                         </button>
                       </div>
                    </div>
                  )}
                  {screen === 'Event' && currentEvent && <EventEncounter player={player} event={currentEvent} onChoiceResult={handleEventOutcome} />}
                  {screen === 'Combat' && (() => {
                    const barracksLevel = player.buildings.find(b => b.type === 'Barracks')?.level || 0;
                    const bonus = barracksLevel * 5;
                    
                    const applyBonus = (unit: any) => {
                      if (!unit.stats) return unit;
                      return {
                        ...unit,
                        stats: {
                          ...unit.stats,
                          hp: (unit.stats.hp || 0) + bonus * 2,
                          maxHp: (unit.stats.maxHp || 0) + bonus * 2,
                          str: (unit.stats.str || 0) + bonus,
                          int: (unit.stats.int || 0) + bonus,
                          def: (unit.stats.def || 0) + bonus,
                          spd: (unit.stats.spd || 0) + bonus,
                          atk: (unit.stats.atk || 0) + bonus,
                        }
                      };
                    };

                    const rawParty = [
                      player.player, 
                      ...(player.squad || []),
                      ...(player.beasts || []).filter(b => b.isDeployed)
                    ];

                    return (
                      <Combat 
                        playerParty={rawParty.map(applyBonus)} 
                        allBeasts={player.beasts || []}
                        enemyParty={activeEnemy || []} 
                        rightHandManId={player.rightHandManId}
                        onWin={(loot) => { setActiveEnemy([]); handleWin(loot); }} 
                        onLose={() => { setActiveEnemy([]); changeScreen('Map'); }} 
                        onEscape={() => { setActiveEnemy([]); changeScreen('Map'); }}
                        onCapture={handleCapture}
                      />
                    );
                  })()}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {showChronicle && screen !== 'Combat' && (
                  <motion.aside 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="border-l border-white/5 bg-slate-900/30 p-4 flex flex-col gap-4 max-h-full overflow-hidden shrink-0"
                  >
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Scroll size={12} /> Chronicle
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                      {logs.map((log, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={`log_${i}`} 
                          className="text-sm font-medium text-slate-400 leading-tight border-l-2 border-white/5 pl-3 py-1"
                        >
                          {log}
                        </motion.div>
                      ))}
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>
            </main>
          </div>
        )}

        <AnimatePresence>
          {isInvoking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center">
                <motion.div 
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-32 h-32 rounded-full border-b-2 border-r-2 border-amber-500 mb-8 flex items-center justify-center"
                >
                  <Sparkles size={48} className="text-amber-400 animate-pulse" />
                </motion.div>
                <h3 className="text-2xl font-black italic uppercase tracking-widest text-amber-500 animate-pulse">Invoking Spirit...</h3>
              </div>
            </motion.div>
          )}

          {invocationResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6"
            >
              <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center shadow-2xl text-center">
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/20 to-transparent" />
                <Ghost size={64} className={`mb-6 relative z-10 ${
                  invocationResult.rarity === 'Ancient' ? 'text-red-500' :
                  invocationResult.rarity === 'Mythic' ? 'text-purple-500' :
                  invocationResult.rarity === 'Legendary' ? 'text-amber-500' :
                  invocationResult.rarity === 'Epic' ? 'text-fuchsia-500' :
                  invocationResult.rarity === 'Rare' ? 'text-blue-500' :
                  invocationResult.rarity === 'Uncommon' ? 'text-emerald-500' :
                  'text-slate-400'
                }`} />
                <h2 className="relative z-10 text-3xl font-black italic uppercase text-white mb-2">{invocationResult.name}</h2>
                <div className="relative z-10 text-xs font-bold uppercase tracking-widest text-amber-500 mb-8 border border-amber-500/30 px-3 py-1 rounded-full bg-amber-500/10">
                  {invocationResult.rarity}
                </div>
                
                <div className="relative z-10 flex gap-6 mb-8 text-sm">
                  <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase font-bold">HP</span><span className="font-mono">{invocationResult.stats.maxHp}</span></div>
                  <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase font-bold">ATK</span><span className="font-mono">{invocationResult.stats.atk}</span></div>
                  <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase font-bold">DEF</span><span className="font-mono">{invocationResult.stats.def}</span></div>
                  <div className="flex flex-col items-center"><span className="text-slate-500 text-[10px] uppercase font-bold">SPD</span><span className="font-mono">{invocationResult.stats.spd}</span></div>
                </div>

                <div className="relative z-10 text-xs text-slate-400 italic mb-8">
                  Provides a rarity-based passive bonus when equipped in Squad.
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-2 w-full">
                  <button 
                    onClick={() => handleInvocationChoice('Accept')}
                    className="py-3 rounded-xl bg-amber-500 text-slate-950 font-black uppercase tracking-widest hover:bg-amber-400 transition-colors text-[10px]"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleInvocationChoice('Sell')}
                    className="py-3 rounded-xl bg-slate-800 text-amber-500 border border-amber-500/20 font-black uppercase tracking-widest hover:bg-slate-700 transition-colors text-[10px]"
                  >
                    Sell
                  </button>
                  <button 
                    onClick={() => handleInvocationChoice('Release')}
                    className="py-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black uppercase tracking-widest hover:bg-rose-500/20 transition-colors text-[10px]"
                  >
                    Release
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </AnimatePresence>
    </div>
  );
}

function MainMenu({ onStart, user }: { onStart: () => void, user: User | null }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2684&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      
      <div className="relative z-10 text-center flex flex-col items-center gap-8">
        <div className="space-y-2">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-24 h-24 bg-amber-500 rounded-3xl mx-auto shadow-2xl shadow-amber-500/20 mb-6 flex items-center justify-center"
           >
             <Castle size={48} className="text-slate-950" />
           </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl font-black text-white tracking-tighter uppercase italic"
          >
            Land <span className="text-amber-500">of</span> Lost Berries
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 font-medium tracking-widest uppercase text-sm"
          >
            A Mystical RPG Odyssey
          </motion.p>
        </div>
        
        {!user && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={signInWithGoogle}
            className="px-12 py-4 bg-blue-600 text-white font-bold rounded-full shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-colors duration-300 uppercase tracking-widest text-[10px] flex items-center gap-2"
          >
            <Globe size={16} /> Sign in with Google
          </motion.button>
        )}
        
        {user && (
          <div className="text-xs text-slate-500 font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
            Signed in as <span className="text-white">{user.email}</span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-12 py-4 bg-white text-slate-950 font-bold rounded-full shadow-2xl shadow-white/10 hover:bg-amber-500 hover:text-white transition-colors duration-300 uppercase tracking-widest text-xs"
        >
          Embark on Journey
        </motion.button>
      </div>
    </motion.div>
  );
}

function CharacterCreation({ onComplete }: { onComplete: (data: any) => void }) {
  const [form, setForm] = useState({
    name: '',
    race: 'Human',
    class: 'Mage',
    affinity: 'Fire'
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 bg-slate-950 overflow-y-auto"
    >
      <div className="max-w-4xl w-full bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl my-auto">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 space-y-8">
            <header className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl font-bold">The Great Awakening</h2>
              <p className="text-slate-400 text-sm italic">"In the void of the unknown, your soul takes shape."</p>
            </header>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Wanderer Name</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter name..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Bloodline (Race)</label>
                  <select 
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm"
                    onChange={e => setForm({ ...form, race: e.target.value })}
                  >
                    {RACES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Calling (Class)</label>
                  <select 
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm"
                    onChange={e => setForm({ ...form, class: e.target.value })}
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Arcane Affinity</label>
                <div className="flex flex-wrap gap-2">
                  {AFFINITIES.slice(0, 12).map(a => (
                    <button
                      key={a}
                      onClick={() => setForm({ ...form, affinity: a })}
                      className={`px-3 py-1.5 rounded-full border text-[10px] font-black transition-all uppercase tracking-widest ${
                        form.affinity === a 
                          ? 'bg-white text-slate-950 border-white shadow-lg' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
               disabled={!form.name}
               onClick={() => onComplete(form)}
               className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-20 disabled:grayscale transition-all rounded-xl font-black text-white uppercase tracking-widest text-xs shadow-xl shadow-amber-600/20"
            >
              Forge Destiny
            </button>
          </div>

          <div className="bg-slate-900/80 relative overflow-hidden flex flex-col items-center justify-center p-12 text-center border-l border-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80" />
            <motion.div 
              key={`${form.race}-${form.class}-${form.affinity}`}
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative z-10 mb-6"
            >
               <CharacterAvatar 
                 race={form.race as Race} 
                 characterClass={form.class as Class} 
                 affinity={form.affinity as Element} 
                 size="lg" 
               />
               <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                  <div className="bg-amber-500 px-3 py-0.5 rounded-full text-[10px] font-black uppercase text-slate-950 shadow-lg">
                    Preview
                  </div>
               </div>
            </motion.div>
            <div className="relative z-10 space-y-1">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">{form.name || 'Anonymous'}</h3>
              <p className="text-amber-500 font-black uppercase tracking-widest text-[10px]">
                {form.race} • {form.class} • {form.affinity}
              </p>
              {RACE_DATA[form.race as Race] && (
                <div className="pt-2">
                   <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Innate Ability</div>
                   <div className="text-[10px] font-bold text-white italic">{RACE_DATA[form.race as Race].ability.name}</div>
                </div>
              )}
            </div>
            <div className="relative z-10 mt-12 w-full grid grid-cols-2 gap-3">
               <StatView label="HP" value={100 + (RACE_DATA[form.race as Race]?.statBonus.hp || 0)} />
               <StatView label="MP" value={50 + (RACE_DATA[form.race as Race]?.statBonus.mp || (RACE_DATA[form.race as Race]?.statBonus.int ? RACE_DATA[form.race as Race]?.statBonus.int * 5 : 0))} />
               <StatView label="STR" value={10 + (RACE_DATA[form.race as Race]?.statBonus.str || 0)} />
               <StatView label="INT" value={10 + (RACE_DATA[form.race as Race]?.statBonus.int || 0)} />
               <StatView label="DEF" value={10 + (RACE_DATA[form.race as Race]?.statBonus.def || 0)} />
               <StatView label="SPD" value={10 + (RACE_DATA[form.race as Race]?.statBonus.spd || 0)} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatView({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-left ring-1 ring-white/5 transition-all hover:bg-white/10">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
      <div className="text-lg font-black text-white">{value}</div>
    </div>
  );
}

function NavButton({ icon: Icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all transition-transform active:scale-95 group ${
        active 
          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={16} className={active ? 'text-slate-950' : 'group-hover:text-amber-500'} />
      <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">{label}</span>
    </button>
  );
}

function BaseOverview({ 
  player, 
  onUpgrade, 
  onUpgradeBuilding, 
  onSummonSpirit,
  onEvolveHero,
  onAssignRightHand,
  onEvolveRightHand
}: { 
  player: PlayerState, 
  onUpgrade: () => void, 
  onUpgradeBuilding: (id: string) => void, 
  onSummonSpirit: () => void,
  onEvolveHero?: () => void,
  onAssignRightHand?: (id: string) => void,
  onEvolveRightHand?: () => void
}) {
  const rightHand = player.rightHandManId ? player.squad.find(s => s.id === player.rightHandManId) : null;
  const showRightHandSelect = player.player.level >= 15 && !player.rightHandManId;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-6">
          <CharacterAvatar race={player.player.race} characterClass={player.player.class} affinity={player.player.affinity} size="lg" />
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">
              {player.player.name} {player.player.isHeroEvolved ? <span className="text-amber-500 text-2xl">★</span> : ''}
            </h2>
            <p className="text-slate-500 text-sm font-medium tracking-wide">
              Imperial {player.baseType} • Tier {player.baseLevel} Sanctuary
            </p>
            <div className="flex gap-2 mt-2">
               {player.player.level >= 15 && !player.player.isHeroEvolved && onEvolveHero && (
                 <button onClick={onEvolveHero} className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-full shadow-lg transition-all">
                   Evolve Hero
                 </button>
               )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <button 
             onClick={onUpgrade}
             className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all ${(player.player?.level || 1) >= player.baseLevel * 2 ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-slate-700 hover:bg-slate-600 cursor-not-allowed border border-white/5'}`}
           >
             Upgrade {player.baseLevel + 1} ({player.baseLevel * 2} Lv)
           </button>
           <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Cost: {(player.baseLevel + 1) * 500}G, {(player.baseLevel + 1) * 150}W, {(player.baseLevel + 1) * 100}S
           </div>
           <div className="flex gap-6 uppercase">
              <div className="text-[10px] text-slate-500 font-bold border-r border-white/10 pr-4">Construction: Active</div>
              <div className="text-[10px] text-orange-400 font-bold">Luck: {player.luck}</div>
              <div className="text-[10px] text-slate-500 font-bold text-blue-400">Total Conquered: {Object.keys(player.conqueredRegions || {}).length}</div>
           </div>
        </div>
      </div>

      {(rightHand || showRightHandSelect) && (
        <div className="bg-gradient-to-r from-indigo-900/30 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black uppercase text-indigo-400 tracking-widest">First in Command</h3>
              {rightHand && rightHand.level >= 30 && !player.rightHandManEvolved && onEvolveRightHand && (
                <button onClick={onEvolveRightHand} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-full shadow-lg transition-all">
                  Promote to Hand of the King
                </button>
              )}
           </div>
           
           {rightHand ? (
              <div className="flex items-center gap-4">
                 <CharacterAvatar race={rightHand.race} characterClass={rightHand.class} affinity={rightHand.affinity} size="sm" />
                 <div>
                    <h4 className="text-xl font-bold uppercase italic text-white">
                      {rightHand.name} {player.rightHandManEvolved ? <span className="text-indigo-400 ml-1">♛</span> : ''}
                    </h4>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">
                      {player.rightHandManEvolved ? "Hand of the King" : "First in Command"} • Level {rightHand.level}
                    </p>
                 </div>
              </div>
           ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 noscroll">
                 {player.squad.map(sq => (
                   <button 
                     key={sq.id} 
                     onClick={() => onAssignRightHand && onAssignRightHand(sq.id)}
                     className="bg-slate-950 p-3 rounded-xl border border-white/5 hover:border-indigo-500/50 flex-shrink-0 flex items-center gap-3 transition-colors"
                   >
                     <CharacterAvatar race={sq.race} characterClass={sq.class} affinity={sq.affinity} size="sm" />
                     <div className="text-left">
                       <div className="text-xs font-bold text-white uppercase">{sq.name}</div>
                       <div className="text-[10px] text-slate-500 uppercase tracking-widest">Lv {sq.level} {sq.class}</div>
                     </div>
                   </button>
                 ))}
                 {player.squad.length === 0 && (
                   <p className="text-xs text-slate-500">Recruit squad members to appoint a First in Command.</p>
                 )}
              </div>
           )}
        </div>
      )}

      <div className="flex gap-8 mb-8 overflow-x-auto pb-2 noscroll">
         <ResourceBar label="Gold" value={player.resources.gold} color="text-amber-400" icon={Gem} />
         <ResourceBar label="Wood" value={player.resources.wood} color="text-amber-700" icon={Mountain} />
         <ResourceBar label="Stone" value={player.resources.stone} color="text-slate-400" icon={Shield} />
         <ResourceBar label="Food" value={player.resources.food} color="text-emerald-500" icon={ShoppingBag} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(player.buildings || []).map((building, i) => (
          <BuildingCard 
            key={`${building.id}_${i}`}
            name={building.type} 
            level={building.level} 
            description={
               building.type === 'Market' ? `Generates ${building.level * 5} Gold every 60s (Online Only).` : 
               building.type === 'Barracks' ? `Increases squad capacity (Max: ${Math.min(4, 1 + building.level)}) and provides +${building.level * 5} bonus to all stats for squad members in combat.` : 
               building.type === 'Ancient Shrine' ? `Summon ancient spirits to aid you in your journey. (Capacity: 100 max)` : building.description
            }
            icon={building.type === 'Barracks' ? Target : (building.type === 'Market' ? ShoppingBag : Sparkles)} 
            costs={
              building.type === 'Barracks' ? {
                gold: Math.floor(Math.pow(10, building.level) * 100000),
                wood: Math.floor(Math.pow(8, building.level) * 50000),
                stone: Math.floor(Math.pow(8, building.level) * 50000),
                reqLevel: (building.level * 20) + 10
              } : {
                gold: (building.level + 1) * 350,
                wood: (building.level + 1) * 100,
                stone: (building.level + 1) * 50
              }
            }
            onUpgrade={building.type === 'Ancient Shrine' ? undefined : () => onUpgradeBuilding(building.id)}
            specialAction={building.type === 'Ancient Shrine' && building.level > 0 ? onSummonSpirit : undefined}
            specialActionLabel="Summon Spirit (-500g, -10 Luck)"
          />
        ))}
        <div className="h-full min-h-[300px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-slate-700">
           <Plus size={48} className="mb-4 opacity-10" />
           <span className="text-xs font-black uppercase tracking-[0.2em]">New expansion slots unlocked at Base Tier 5</span>
        </div>
      </div>
    </motion.div>
  );
}

function ResourceBar({ label, value, color, icon: Icon }: any) {
  const formatNum = (num: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num || 0);
  return (
    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
       <Icon size={16} className={color} />
       <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
          <span className={`text-sm font-black ${color}`}>{formatNum(value)}</span>
       </div>
    </div>
  );
}

function BuildingCard({ name, level, description, icon: Icon, onUpgrade, costs, specialAction, specialActionLabel }: any) {
  const formatNum = (num: number | undefined) => num !== undefined ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num) : 0;
  
  return (
    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 hover:bg-slate-800 transition-all group relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-4">
         <div className={`text-[10px] font-black uppercase tracking-widest ${level > 0 ? 'text-emerald-500' : 'text-slate-600'}`}>
           {level > 0 ? 'Active (Lv ' + level + ')' : 'Dormant'}
         </div>
      </div>
      <div>
        <div className="mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-amber-500 ring-1 ring-white/10 shadow-xl group-hover:scale-110 transition-transform">
            <Icon size={28} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
             <h4 className="text-xl font-black uppercase tracking-tighter italic">{name}</h4>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium min-h-[4rem]">{description}</p>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-white/5 space-y-3">
         {onUpgrade && (
           <>
             <button 
               onClick={onUpgrade}
               className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-white text-slate-950 hover:bg-amber-500 hover:text-white active:scale-95 shadow-xl shadow-white/5"
             >
               Upgrade Level {level + 1}
             </button>
             <div className="text-[10px] text-slate-500 text-center font-bold tracking-wide">
               Need: {formatNum(costs?.gold)}G, {formatNum(costs?.wood)}W, {formatNum(costs?.stone)}S {costs?.reqLevel ? ` | Lvl ${costs.reqLevel}` : ''}
             </div>
           </>
         )}
         {specialAction && (
           <button 
             onClick={specialAction}
             className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2"
           >
             <Sparkles size={14} /> {specialActionLabel}
           </button>
         )}
      </div>
    </div>
  );
}

// ... (rest of the components are unchanged, keeping them for context)
