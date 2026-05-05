import React, { useState, useEffect } from 'react';
import { 
  Sword, Shield, Wand, Zap, Flame, Droplets, Wind, Mountain, 
  Moon, Sun, Ghost, Heart, Star, Sparkles, Brain, Compass, 
  Users, Castle, Gem, Hammer, Book, Scroll, Map as MapIcon, 
  Gamepad2, Skull, Trophy, Settings, Briefcase, ChevronRight,
  Crosshair, LucideIcon, Menu, X, Plus, Info, Zap as ManaIcon,
  ShoppingBag, Target, UserPlus, AlertCircle, ArrowLeft, Globe, Flag, Activity,
  User as UserIcon, DoorOpen, TrendingUp, Trash2, FolderKanban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerState, Character, Race, Class, Element, Beast, SaveSlot, Screen, CharacterRole, PassiveMission, Item, EquipmentSlot, Equipment, Quest } from './types';
import { RACES, CLASSES, AFFINITIES, REGIONS, RECRUITABLE_CHARACTERS, RACE_DATA } from './constants';
import { ITEMS_DATABASE } from './items';
import Combat from './components/Combat';
import CharacterAvatar from './components/CharacterAvatar';
import Diplomacy from './components/Diplomacy';
import MissionsView from './components/Missions';
import UserGuide from './components/UserGuide';
import League from './components/League';
import EventEncounter, { ExplorationEvent } from './components/EventEncounter';
import Inventory from './components/Inventory';
import { generateExplorationEvent } from './services/eventService';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { saveGame, loadGame, getAllSaves, deleteSave } from './services/dbService'; // Corrected import names for clarity
import { getCharacterRank } from './utils';
import { GoogleGenAI } from "@google/genai";

// Main App Component
export default function App() {
  const [screen, setScreen] = useState<Screen>('Menu');
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [logs, setLogs] = useState<string[]>(['Welcome to Land of Lost Berries.']);
  const [activeEnemy, setActiveEnemy] = useState<any[]>([]);
  const [saveSlot, setSaveSlot] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [currentEvent, setCurrentEvent] = useState<ExplorationEvent | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('');
  const [combatWinPayload, setCombatWinPayload] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));

  const changeScreen = (newScreen: Screen) => {
    if (screen !== 'Combat') setPrevScreen(screen);
    setScreen(newScreen);
  };

  const goBack = () => {
    setScreen(prevScreen || 'Base');
    setPrevScreen(null);
  };

  const saveGameData = async (state: PlayerState, slot: number) => {
    const updatedState = { ...state, updatedAt: Date.now() };
    if (user) await saveGame(slot, updatedState);
    else localStorage.setItem(`koa_save_slot_${slot}`, JSON.stringify(updatedState));
    return updatedState;
  };

  useEffect(() => {
    if (player && saveSlot !== null) {
      const autoSave = setInterval(() => saveGameData(player, saveSlot), 30000);
      return () => clearInterval(autoSave);
    }
  }, [player, saveSlot]);

  const loadSlot = async (slot: number) => {
    let savedData: PlayerState | null = user ? await loadGame(slot) : null;
    if (!savedData) {
        const local = localStorage.getItem(`koa_save_slot_${slot}`);
        if (local) try { savedData = JSON.parse(local); } catch { savedData = null; }
    }

    if (savedData) {
      const sanitizedData: PlayerState = {
        ...savedData,
        player: { ...(savedData.player || {}), equipment: savedData.player?.equipment || {} },
        squad: (savedData.squad || []).map(char => ({...char, equipment: char.equipment || {}})),
        inventory: savedData.inventory || [],
        activeQuests: savedData.activeQuests || [],
        resources: { gold: 100, food: 100, mana: 50, wood: 50, stone: 50, ...(savedData.resources || {}) },
        beasts: savedData.beasts || [],
        unlockedRegions: savedData.unlockedRegions || ['verdant'],
        luck: savedData.luck ?? 10,
      };
      setPlayer(sanitizedData);
      setSaveSlot(slot);
      setScreen('Base');
      addLog(`Loaded game from Slot ${slot}.`);
    } else {
      setSaveSlot(slot);
      setScreen('Creation');
    }
  };

  const initializePlayer = async (data: Partial<Character>) => {
    if (saveSlot === null) return;
    const raceBonus = RACE_DATA[data.race as Race]?.statBonus || {};
    const newPlayer: PlayerState = {
      player: { 
        id: 'player', name: data.name || 'Hero', race: data.race as Race, class: data.class as Class, affinity: data.affinity as Element, 
        level: 1, exp: 0, unspentStatPoints: 0,
        stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50, str: 10, int: 10, def: 10, spd: 10, cha: 10, ...raceBonus },
        equipment: {}, personality: 'Determined', backstory: '...', loyalty: 100, role: 'Unassigned'
      },
      baseType: 'Guild', baseLevel: 1, resources: { gold: 100, food: 100, mana: 50, wood: 50, stone: 50 },
      inventory: [], squad: [], beasts: [], unlockedRegions: ['verdant'], conqueredRegions: { 'verdant': 1 },
      buildings: [], activeQuests: [], completedQuests: [], activeMissions: [], luck: 10, raceExperience: {},
      updatedAt: Date.now()
    };
    const savedPlayer = await saveGameData(newPlayer, saveSlot);
    setPlayer(savedPlayer);
    setScreen('Base');
    addLog(`Character ${newPlayer.player.name} created!`);
  };

  const handleEquipItem = (characterId: string, itemId: string) => { /* ... */ };
  const handleUnequipItem = (characterId: string, slot: EquipmentSlot) => { /* ... */ };

  const handleEventOutcome = (outcome: { text: string; action?: string; payload?: any }) => {
    if (!player) return;
    addLog(`Event: ${outcome.text}`);
    setTimeout(() => {
        // ... (event outcome logic)
    }, 1500);
  };

  const triggerCombat = (regionId: string, payload?: any) => {
     if (!player) return;
     let enemies;
     if (payload?.enemies) {
         enemies = payload.enemies;
         if (payload.is_duel && payload.enemies[0]?.win_payload) setCombatWinPayload(payload.enemies[0].win_payload);
     } else {
         const region = REGIONS.find(r => r.id === regionId);
         if (!region) return;
         enemies = (region.enemies || []).map(name => ({ id: `enemy_${Math.random()}`, name, level: region.difficulty, stats: { hp: 50, maxHp: 50, atk: 10, def: 5, spd: 10, mp: 30, maxMp: 30 } }));
     }
     setActiveEnemy(enemies);
     setActiveRegion(regionId);
     setScreen('Combat');
  };

  const handleWin = (loot: { gold?: number; exp?: number; luck?: number; items?: string[] }) => {
    if (!player) return;
    setPlayer(prev => {
        if (!prev) return prev;
        const newItems = (loot.items || []).map(itemId => {
            const itemData = ITEMS_DATABASE[itemId];
            if (!itemData) return null;
            const uniqueId = `${itemData.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            addLog(`Obtained: ${itemData.name}!`);
            return { ...itemData, id: uniqueId };
        }).filter(Boolean) as Item[];

        return {
            ...prev,
            resources: { ...prev.resources, gold: (prev.resources.gold || 0) + (loot.gold || 0) },
            luck: (prev.luck || 0) + (loot.luck || 0),
            inventory: [...(prev.inventory || []), ...newItems],
            player: { ...prev.player, exp: prev.player.exp + (loot.exp || 0) }
        };
    });
    if (combatWinPayload) {
        addLog("Your opponent acknowledges your strength...");
        handleEventOutcome(combatWinPayload);
        setCombatWinPayload(null);
    }
    changeScreen('Map');
  };

  // ... other logic

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AnimatePresence mode="wait">
        {screen === 'Menu' && <MainMenu onStart={() => setScreen('Slots')} user={user} />}
        {screen === 'Slots' && <SaveSlotsMenu onSelect={loadSlot} user={user} />}
        {screen === 'Creation' && <CharacterCreation onComplete={initializePlayer} />}
        {player && screen !== 'Menu' && screen !== 'Creation' && (
          <div className="flex flex-col h-screen">
            {screen !== 'Combat' && <header> {/* ... Nav buttons ... */}</header>}
            <main className="flex-1 overflow-hidden flex flex-row relative w-full">
                <div className="flex-1 flex flex-col overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                      {screen === 'Inventory' && <Inventory squad={[player.player, ...player.squad]} inventory={player.inventory || []} onEquipItem={handleEquipItem} onUnequipItem={handleUnequipItem} />}
                      {screen === 'Combat' && <Combat playerParty={[player.player, ...player.squad]} enemyParty={activeEnemy} onWin={handleWin} onLose={() => changeScreen('Map')} />}
                      {/* ... other screens ... */}
                    </AnimatePresence>
                </div>
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SaveSlotsMenu with corrected sync logic ---
function SaveSlotsMenu({ onSelect, user }: { onSelect: (slot: number) => void, user: User | null }) {
  const [cloudSaves, setCloudSaves] = useState<Record<number, PlayerState>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAndSyncSaves() {
      if (user) {
        setLoading(true);
        try {
          const saves = await getAllSaves();
          // Sync local saves to cloud if a cloud slot is empty
          for (const slot of [1, 2, 3]) {
            if (!saves[slot]) {
              const local = localStorage.getItem(`koa_save_slot_${slot}`);
              if (local) {
                try {
                  const parsedLocal = JSON.parse(local);
                  await saveGame(slot, parsedLocal); // CORRECTED: Was dbSave, now saveGame
                  saves[slot] = parsedLocal;
                } catch (e) {
                   console.error('Failed to sync local save to cloud', e);
                }
              }
            }
          }
          setCloudSaves(saves);
        } catch (error) {
          console.error("Failed to fetch/sync cloud saves", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchAndSyncSaves();
  }, [user]);

  const getSlotData = (slot: number) => {
    if (user && cloudSaves[slot]) return cloudSaves[slot];
    const saved = localStorage.getItem(`koa_save_slot_${slot}`);
    return saved ? JSON.parse(saved) : null;
  };

  const handleDelete = async (e: React.MouseEvent, slot: number) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete save slot ${slot}?`)) {
      if (user) {
        await deleteSave(slot);
        setCloudSaves(prev => { const u = {...prev}; delete u[slot]; return u; });
      }
      localStorage.removeItem(`koa_save_slot_${slot}`);
    }
  };

  return ( <div> {/* ... JSX for save slots ... */} </div> );
}

// Other components (MainMenu, CharacterCreation, etc.) are assumed to be defined here
