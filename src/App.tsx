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
import { PlayerState, Character, Race, Class, Element, Beast, SaveSlot, Screen, CharacterRole, PassiveMission, Item, EquipmentSlot, Equipment, Quest, ExplorationEvent } from './types';
import { RACES, CLASSES, AFFINITIES, REGIONS, RECRUITABLE_CHARACTERS, RACE_DATA } from './constants';
import { ITEMS_DATABASE } from './items';
import Combat from './components/Combat';
import Inventory from './components/Inventory';
import { MainMenu, WorldMap, NavButton } from './components/placeholders';
import { CharacterCreation } from './components/CharacterCreation';
import { SaveSlotsMenu } from './components/SaveSlotsMenu';
import { BaseScreen } from './components/BaseScreen'; // Import the new component
import { generateExplorationEvent } from './services/eventService';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { saveGame, loadGame, getAllSaves, deleteSave } from './services/dbService';
import { getCharacterRank } from './utils';

// Main App Component
export default function App() {
  const [screen, setScreen] = useState<Screen>('Menu';
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [logs, setLogs] = useState<string[]>(['Welcome to Land of Lost Berries.']);
  const [activeEnemy, setActiveEnemy] = useState<any[]>([]);
  const [saveSlot, setSaveSlot] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [currentEvent, setCurrentEvent] = useState<ExplorationEvent | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('');
  const [combatWinPayload, setCombatWinPayload] = useState<any>(null);

  // ... All the logic from before ...
  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));
  const changeScreen = (newScreen: Screen) => { setPrevScreen(screen); setScreen(newScreen); };
  const handleEquipItem = (/*...args*/) => { console.log('Equip'); };
  const handleUnequipItem = (/*...args*/) => { console.log('Unequip'); };
  const handleWin = (/*...args*/) => { console.log('Win'); };
  const triggerCombat = (/*...args*/) => { console.log('Combat'); };

  const initializePlayer = (characterData: Partial<Character>) => {
    const newPlayer: PlayerState = {
      player: {
        id: 'player-1',
        name: characterData.name || 'Hero',
        race: characterData.race || 'Human',
        class: characterData.class || 'Knight',
        affinity: characterData.affinity || 'Fire',
        level: 1,
        xp: 0,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        str: 10, int: 10, def: 10, spd: 10, cha: 10,
        equipment: {},
        abilities: [],
        role: 'Player',
      },
      squad: [],
      inventory: [],
      activeQuests: [],
      resources: { gold: 100, food: 100, mana: 50, wood: 50, stone: 50 },
      beasts: [],
      unlockedRegions: ['verdant'],
      luck: 10,
      updatedAt: Date.now(),
    };
    setPlayer(newPlayer);
    setScreen('Base'); // Go to base after creation
    addLog(`A new hero, ${newPlayer.player.name}, has been born!`);
  };


  const loadSlot = async (slot: number) => {
    let savedData: PlayerState | null = user ? await loadGame(slot) : null;
    if (!savedData) {
        const local = localStorage.getItem(`koa_save_slot_${slot}`);
        if (local) try { savedData = JSON.parse(local); } catch { savedData = null; }
    }

    if (savedData) {
      setPlayer(savedData);
      setSaveSlot(slot);
      setScreen('Base');
      addLog(`Loaded game from Slot ${slot}.`);
    } else {
      setSaveSlot(slot);
      setScreen('Creation');
    }
  };

  // Remaining logic ...

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AnimatePresence mode="wait">
        {screen === 'Menu' && <MainMenu onStart={() => setScreen('Slots')} user={user} />}
        {screen === 'Slots' && <SaveSlotsMenu onSelect={loadSlot} user={user} />}
        {screen === 'Creation' && <CharacterCreation onComplete={initializePlayer} />}
        {player && screen !== 'Menu' && screen !== 'Slots' && screen !== 'Creation' && (
           <div className="flex flex-col h-screen">
              {screen !== 'Combat' && (
                <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
                    <p>Player: {player.player.name}</p>
                  <nav className="flex items-center gap-2">
                    <NavButton icon={Castle} active={screen === 'Base'} onClick={() => changeScreen('Base')} label="Kingdom" />
                    <NavButton icon={FolderKanban} active={screen === 'Inventory'} onClick={() => changeScreen('Inventory')} label="Armory" />
                    <NavButton icon={Users} active={screen === 'Character'} onClick={() => changeScreen('Character')} label="Character" />
                    <NavButton icon={MapIcon} active={screen === 'Map'} onClick={() => changeScreen('Map')} label="World Map" />
                  </nav>
                </header>
              )}
              <main className="flex-1 overflow-hidden flex flex-row relative w-full">
                  <div className="flex-1 overflow-y-auto p-6">
                      {/* Render other screens based on state */}
                      {screen === 'Map' && <WorldMap player={player} onTravel={(r) => triggerCombat(r)} />}
                      {screen === 'Inventory' && <p>Inventory Screen</p>}
                      {screen === 'Base' && <BaseScreen player={player} />} {/* Use the new component */}
                      {screen === 'Character' && <p>Character Screen</p>}
                  </div>
                 <div className="w-80 border-l border-white/5 bg-slate-900/50 p-4 flex flex-col">
                   <h2 className="text-lg font-semibold mb-2">Chronicle</h2>
                   <div className="flex-1 overflow-y-auto text-sm text-slate-400 space-y-2">
                      {logs.map((log, i) => <p key={i}>{log}</p>)}
                   </div>
                 </div>
              </main>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
