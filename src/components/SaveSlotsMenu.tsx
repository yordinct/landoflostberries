import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import { saveGame, getAllSaves, deleteSave } from '../services/dbService';
import { User } from 'firebase/auth';

interface Props {
  onSelect: (slot: number) => void;
  user: User | null;
}

export function SaveSlotsMenu({ onSelect, user }: Props) {
  const [saves, setSaves] = useState<Record<number, PlayerState | null>>({ 1: null, 2: null, 3: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndSyncSaves() {
      setLoading(true);
      let finalSaves: Record<number, PlayerState | null> = { 1: null, 2: null, 3: null };

      // Load local saves
      for (const slot in finalSaves) {
        const localData = localStorage.getItem(`koa_save_slot_${slot}`);
        if (localData) {
          try {
            finalSaves[Number(slot)] = JSON.parse(localData);
          } catch {}
        }
      }

      // Sync with cloud saves if user is logged in
      if (user) {
        try {
          const cloudSaves = await getAllSaves();
          for (const slot in finalSaves) {
            const slotNum = Number(slot);
            const localSave = finalSaves[slotNum];
            const cloudSave = cloudSaves[slotNum];
            if (cloudSave) {
              finalSaves[slotNum] = cloudSave; // Cloud is source of truth
            } else if (localSave) {
              await saveGame(slotNum, localSave); // Upload local-only save
            }
          }
        } catch (error) {
          console.error("Failed to sync cloud saves:", error);
        }
      }
      setSaves(finalSaves);
      setLoading(false);
    }

    fetchAndSyncSaves();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, slot: number) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete save slot ${slot}? This is permanent.`)) {
      setSaves(prev => ({ ...prev, [slot]: null }));
      localStorage.removeItem(`koa_save_slot_${slot}`);
      if (user) {
        try {
          await deleteSave(slot);
        } catch (error) {
          console.error('Failed to delete cloud save:', error);
        }
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading Save Slots...</div>;
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6">Select a Save Slot</h2>
      <div className="space-y-4 w-full max-w-md">
        {[1, 2, 3].map(slot => {
          const save = saves[slot];
          return (
            <div key={slot} onClick={() => onSelect(slot)} className="border-2 border-slate-700 p-4 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors relative">
              <h3 className="text-xl font-semibold">Slot {slot}</h3>
              {save && save.player ? (
                <div>
                  <p>Character: {save.player.name}, Level {save.player.level}</p>
                  <p>Last Saved: {new Date(save.updatedAt).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-slate-400">Empty Slot</p>
              )}
              {save && (
                <button onClick={(e) => handleDelete(e, slot)} className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
