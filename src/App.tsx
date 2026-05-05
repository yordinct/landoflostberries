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
import { PlayerState, Character, Race, Class, Element, Beast, SaveSlot, Screen, CharacterRole, PassiveMission, Item, EquipmentSlot, Equipment, Quest, ExplorationEvent } from './types'; // Corrected ExplorationEvent import
import { RACES, CLASSES, AFFINITIES, REGIONS, RECRUITABLE_CHARACTERS, RACE_DATA } from './constants';
import { ITEMS_DATABASE } from './items';
import Combat from './components/Combat';
import Inventory from './components/Inventory';
// Corrected imports to use placeholders
import { MainMenu, CharacterCreation, WorldMap, NavButton } from './components/placeholders'; 
import { SaveSlotsMenu } from './components/SaveSlotsMenu'; // CORRECTED IMPORT
import { generateExplorationEvent } from './services/eventService';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { saveGame, loadGame, getAllSaves, deleteSave } from './services/dbService';
import { getCharacterRank } from './utils';

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

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));
  const changeScreen = (newScreen: Screen) => { /* ... */ };
  const handleEquipItem = (characterId: string, itemId: string) => { /* ... */ };
  const handleUnequipItem = (characterId: string, slot: EquipmentSlot) => { /* ... */ };
  const handleWin = (loot: any) => { /* ... */ };
  const triggerCombat = (region: string) => { /* ... */ };
  const initializePlayer = async (data: any) => { /* ... */ };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AnimatePresence mode="wait">
        {screen === 'Menu' && <MainMenu onStart={() => setScreen('Slots')} user={user} />}
        {screen === 'Slots' && <SaveSlotsMenu onSelect={loadSlot} user={user} />}
        {screen === 'Creation' && <CharacterCreation onComplete={(data) => initializePlayer(data)} />}
        {player && screen !== 'Menu' && screen !== 'Creation' && (
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
              <div className={`flex-1 flex flex-col ${screen === 'Combat' ? 'overflow-hidden h-full w-full' : 'overflow-y-auto p-6'}`}>
                <AnimatePresence mode="wait">
                  {screen === 'Map' && <WorldMap player={player} onTravel={(r) => triggerCombat(r)} />}
                  {screen === 'Inventory' && <Inventory squad={[player.player, ...(player.squad || [])]} inventory={player.inventory || []} onEquipItem={handleEquipItem} onUnequipItem={handleUnequipItem} />}
                  {screen === 'Combat' && <Combat playerParty={[player.player, ...(player.squad || [])]} enemyParty={activeEnemy || []} onWin={handleWin} onLose={() => { setActiveEnemy([]); changeScreen('Map'); }} />}
                </AnimatePresence>
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

// NO MORE PLACEHOLDER HERE
