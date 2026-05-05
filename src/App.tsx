import React, { useState, useEffect } from 'react';
import { 
  Sword, Shield, Wand, Users, Castle, Map as MapIcon, 
  FolderKanban 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerState, Character, Screen, GameEvent, Item, Consumable } from './types';
import { ITEMS_DATABASE } from './items';
import { MainMenu, WorldMap, NavButton } from './components/placeholders';
import { CharacterCreation } from './components/CharacterCreation';
import { SaveSlotsMenu } from './components/SaveSlotsMenu';
import { BaseScreen } from './components/BaseScreen';
import { CharacterScreen } from './components/CharacterScreen';
import { Inventory } from './components/Inventory';
import { EventModal } from './components/EventModal';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { saveGame, loadGame } from './services/dbService';
import { getEvent } from './services/eventService';

// Main App Component
export default function App() {
  const [screen, setScreen] = useState<Screen>('Menu');
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [logs, setLogs] = useState<string[]>(['Welcome to the Land of Lost Berries.']);
  const [saveSlot, setSaveSlot] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));
  const changeScreen = (newScreen: Screen) => setScreen(newScreen);

  const updatePlayer = (updater: (p: PlayerState) => PlayerState) => {
    setPlayer(prev => {
      if (!prev) return null;
      return updater(prev);
    });
  };

  const initializePlayer = (characterData: Partial<Character>) => {
    const startingWeapon = ITEMS_DATABASE.find(i => i.id === 'weap_001')!;
    const startingArmor = ITEMS_DATABASE.find(i => i.id === 'arm_001')!;

    let newPlayer: PlayerState = {
      player: {
        id: `player_${Date.now()}`,
        name: characterData.name || 'Hero',
        race: characterData.race || 'Human',
        class: characterData.class || 'Knight',
        affinity: characterData.affinity || 'Light',
        level: 1, exp: 0,
        stats: { hp: 100, maxHp: 100, mp: 50, maxMp: 50, str: 10, int: 10, def: 10, spd: 10, cha: 10 },
        equipment: { weapon: startingWeapon.id, armor: startingArmor.id },
        loyalty: 100, role: 'Unassigned', personality: 'Brave', backstory: 'An amnesiac adventurer.'
      },
      baseType: 'Kingdom', baseLevel: 1,
      resources: { gold: 100, food: 100, mana: 50, wood: 50, stone: 50 },
      inventory: [ITEMS_DATABASE.find(i => i.id === 'cons_001')!],
      squad: [], beasts: [],
      unlockedRegions: ['verdant'], conqueredRegions: {},
      buildings: [], activeQuests: [], completedQuests: [], activeMissions: [],
      luck: 10, raceExperience: {}, updatedAt: Date.now(),
    };

    if (startingWeapon.type === 'Weapon') Object.entries(startingWeapon.stats).forEach(([k, v]) => newPlayer.player.stats[k] += v);
    if (startingArmor.type === 'Armor') Object.entries(startingArmor.stats).forEach(([k, v]) => newPlayer.player.stats[k] += v);

    setPlayer(newPlayer);
    changeScreen('Base');
    addLog(`A new hero, ${newPlayer.player.name}, has been born!`);
  };

  const loadSlot = async (slot: number) => {
    let data: PlayerState | null = null;
    if (user) {
      data = await loadGame(user.uid, slot);
    } else {
      const localData = localStorage.getItem(`koa_save_slot_${slot}`);
      if (localData) try { data = JSON.parse(localData); } catch (e) { addLog("Error loading local save."); }
    }
    if (data) {
      setPlayer(data);
      setSaveSlot(slot);
      changeScreen('Base');
      addLog(`Loaded game from Slot ${slot}.`);
    } else {
      setSaveSlot(slot);
      changeScreen('Creation');
    }
  };

  const handleSaveGame = () => {
    if (player && saveSlot !== null) {
      const updatedPlayer = { ...player, updatedAt: Date.now() };
      setPlayer(updatedPlayer);
      if (user) {
        saveGame(user.uid, saveSlot, updatedPlayer);
        addLog(`Game saved to Cloud Slot ${saveSlot}.`);
      } else {
        localStorage.setItem(`koa_save_slot_${saveSlot}`, JSON.stringify(updatedPlayer));
        addLog(`Game saved locally to Slot ${saveSlot}.`);
      }
    }
  };
  
  const handleTriggerEvent = () => {
      const event = getEvent(player!.player.level);
      if (event) setActiveEvent(event);
      else addLog("Nothing seems to be happening right now.");
  };
  
  const handleResolveEvent = (choice) => {
      if (!player || !activeEvent) return;
      const outcome = choice.outcome(player);

      addLog(outcome.text);

      updatePlayer(p => {
          const newState = { ...p };
          switch(outcome.action) {
              case 'add_quest':
                  newState.activeQuests = [...newState.activeQuests, outcome.payload];
                  break;
              case 'recruit_character':
                  if (outcome.payload.cost) newState.resources.gold -= outcome.payload.cost;
                  newState.squad = [...newState.squad, outcome.payload.character];
                  addLog(`${outcome.payload.character.name} has joined your squad!`);
                  break;
              // Other cases like 'combat' would be handled here
          }
          return newState;
      });

      setActiveEvent(null);
  };

  const handleUseItem = (itemId: string) => {
    const item = ITEMS_DATABASE.find(i => i.id === itemId);
    if (!item || item.type !== 'Consumable') return;

    updatePlayer(p => {
      const newStats = { ...p.player.stats };
      let newInventory = [...p.inventory];
      let logMsg = `Used ${item.name}.`;

      const effect = (item as Consumable).effect;
      if(effect.type === 'HEAL') {
        const healAmount = effect.value;
        newStats.hp = Math.min(newStats.maxHp, newStats.hp + healAmount);
        logMsg += ` Healed for ${healAmount} HP.`
      }

      const itemIndex = newInventory.findIndex(i => i.id === itemId);
      if (itemIndex > -1) {
        newInventory.splice(itemIndex, 1);
      }
      
      addLog(logMsg);
      return {
        ...p,
        player: { ...p.player, stats: newStats },
        inventory: newInventory
      };
    });
  };

  const renderScreen = () => {
    if (!player) {
      switch(screen) {
        case 'Menu': return <MainMenu onStart={() => changeScreen('Slots')} user={user} />;
        case 'Slots': return <SaveSlotsMenu onSelect={loadSlot} user={user} />;
        case 'Creation': return <CharacterCreation onComplete={initializePlayer} />;
        default: return <MainMenu onStart={() => changeScreen('Slots')} user={user} />;
      }
    }
    switch(screen) {
      case 'Base': return <BaseScreen player={player} onTriggerEvent={handleTriggerEvent} />;
      case 'Character': return <CharacterScreen player={player} />;
      case 'Inventory': return <Inventory player={player} onEquip={() => {}} onUse={handleUseItem} />;
      case 'Map': return <WorldMap player={player} onTravel={() => {}} />;
      default: return <BaseScreen player={player} onTriggerEvent={handleTriggerEvent} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {activeEvent && <EventModal event={activeEvent} onResolve={handleResolveEvent} />}
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
                    <div className="flex-1 overflow-y-auto">{renderScreen()}</div>
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
