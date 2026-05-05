import React, { useState, useEffect } from 'react';
import { 
  Sword, Shield, Wand, Users, Castle, Map as MapIcon, 
  FolderKanban 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerState, Character, SaveSlot, Screen, Item, Equipment, Consumable } from './types';
import { RACES, CLASSES, AFFINITIES } from './constants';
import { ITEMS_DATABASE } from './items';
import { MainMenu, WorldMap, NavButton } from './components/placeholders';
import { CharacterCreation } from './components/CharacterCreation';
import { SaveSlotsMenu } from './components/SaveSlotsMenu';
import { BaseScreen } from './components/BaseScreen';
import { CharacterScreen } from './components/CharacterScreen';
import { Inventory } from './components/Inventory';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { saveGame, loadGame } from './services/dbService';

// Main App Component
export default function App() {
  const [screen, setScreen] = useState<Screen>('Menu');
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [logs, setLogs] = useState<string[]>(['Welcome to the Land of Lost Berries.']);
  const [saveSlot, setSaveSlot] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));
  const changeScreen = (newScreen: Screen) => setScreen(newScreen);

  const initializePlayer = (characterData: Partial<Character>) => {
    const startingWeapon = ITEMS_DATABASE.find(i => i.id === 'weap_001')!;
    const startingArmor = ITEMS_DATABASE.find(i => i.id === 'arm_001')!;

    const newPlayer: PlayerState = {
      player: {
        id: `player_${Date.now()}`,
        name: characterData.name || 'Hero',
        race: characterData.race || 'Human',
        class: characterData.class || 'Knight',
        affinity: characterData.affinity || 'Light',
        level: 1,
        exp: 0,
        stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50, str: 10, int: 10, def: 10, spd: 10, cha: 10 },
        equipment: { weapon: startingWeapon.id, armor: startingArmor.id },
        loyalty: 100,
        role: 'Unassigned',
        personality: 'Brave',
        backstory: 'An amnesiac adventurer.'
      },
      baseType: 'Kingdom',
      baseLevel: 1,
      resources: { gold: 100, food: 100, mana: 50, wood: 50, stone: 50 },
      inventory: [ITEMS_DATABASE.find(i => i.id === 'cons_001')!], // Start with a potion
      squad: [],
      beasts: [],
      unlockedRegions: ['verdant'],
      conqueredRegions: {},
      buildings: [],
      activeQuests: [],
      completedQuests: [],
      activeMissions: [],
      luck: 10,
      raceExperience: {},
      updatedAt: Date.now(),
    };
    
    // Apply initial equipment stats
    if (startingWeapon.type === 'Weapon') Object.keys(startingWeapon.stats).forEach(k => newPlayer.player.stats[k] += startingWeapon.stats[k]);
    if (startingArmor.type === 'Armor') Object.keys(startingArmor.stats).forEach(k => newPlayer.player.stats[k] += startingArmor.stats[k]);

    setPlayer(newPlayer);
    changeScreen('Base');
    addLog(`A new hero, ${newPlayer.player.name}, has been born!`);
  };

  const loadSlot = async (slot: number) => {
    const data = await loadGame(user!.uid, slot);
    if (data) {
      setPlayer(data as PlayerState);
      setSaveSlot(slot);
      changeScreen('Base');
      addLog(`Loaded game from Slot ${slot}.`);
    } else {
      setSaveSlot(slot);
      changeScreen('Creation');
    }
  };

  const handleSaveGame = () => {
    if (player && saveSlot !== null && user) {
      saveGame(user.uid, saveSlot, player);
      addLog(`Game saved to Slot ${saveSlot}.`);
    }
  };

  const handleEquipItem = (itemId: string) => {
    // This is a simplified version. A real one would be much more complex.
    addLog(`Equipping item... (logic not fully implemented)`);
  };

  const handleUseItem = (itemId: string) => {
    addLog(`Using item... (logic not fully implemented)`);
  };

  const renderScreen = () => {
    if (!player) {
      switch(screen) {
        case 'Menu': return <MainMenu onStart={() => changeScreen('Slots')} user={user} />;
        case 'Slots': return <SaveSlotsMenu onSelect={loadSlot} user={user} />;
        case 'Creation': return <CharacterCreation onComplete={initializePlayer} />;
        default: return <MainMenu onStart={() => changeScreen('Slots')} user={user} />;
      }
    } else {
      switch(screen) {
        case 'Base': return <BaseScreen player={player} />;
        case 'Character': return <CharacterScreen player={player} />;
        case 'Inventory': return <Inventory player={player} onEquip={handleEquipItem} onUse={handleUseItem} />;
        case 'Map': return <WorldMap player={player} onTravel={() => {}} />;
        default: return <BaseScreen player={player} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AnimatePresence mode="wait">
        {screen === 'Menu' || screen === 'Slots' || screen === 'Creation' ? (
          renderScreen()
        ) : (
           player && (
            <div className="flex flex-col h-screen">
                <header className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold">{player.baseType}</h1>
                    </div>
                    <nav className="flex items-center gap-2">
                        <NavButton icon={Castle} active={screen === 'Base'} onClick={() => changeScreen('Base')} label="Kingdom" />
                        <NavButton icon={FolderKanban} active={screen === 'Inventory'} onClick={() => changeScreen('Inventory')} label="Armory" />
                        <NavButton icon={Users} active={screen === 'Character'} onClick={() => changeScreen('Character')} label="Character" />
                        <NavButton icon={MapIcon} active={screen === 'Map'} onClick={() => changeScreen('Map')} label="World" />
                    </nav>
                    <div className="w-40">
                        <button onClick={handleSaveGame} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 w-full">Save Game</button>
                    </div>
                </header>
                <main className="flex-1 overflow-hidden flex flex-row relative w-full">
                    <div className="flex-1 overflow-y-auto">
                        {renderScreen()}
                    </div>
                    <aside className="w-72 border-l border-white/5 bg-slate-900/50 p-4 flex flex-col shrink-0">
                        <h2 className="text-lg font-semibold mb-2">Chronicle</h2>
                        <div className="flex-1 overflow-y-auto text-sm text-slate-400 space-y-2 pr-2">
                            {logs.map((log, i) => <p key={i} className="opacity-80">{log}</p>)}
                        </div>
                    </aside>
                </main>
            </div>
           )
        )}
      </AnimatePresence>
    </div>
  );
}
