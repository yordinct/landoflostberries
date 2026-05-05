import React, { useState } from 'react';
import { RACES, CLASSES, AFFINITIES, RACE_DATA } from '../constants';
import { Character, Race, Class, Element } from '../types';

interface Props {
  onComplete: (characterData: Partial<Character>) => void;
}

export const CharacterCreation: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [race, setRace] = useState<Race>('Human');
  const [characterClass, setCharacterClass] = useState<Class>('Knight');
  const [affinity, setAffinity] = useState<Element>('Fire');
  const [error, setError] = useState('');

  const handleComplete = () => {
    if (!name.trim()) {
      setError('Please enter a name for your hero.');
      return;
    }
    onComplete({
      name,
      race,
      class: characterClass,
      affinity,
    });
  };

  const selectedRaceData = RACE_DATA[race];

  return (
    <div className="p-8 max-w-4xl mx-auto bg-slate-900 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-center text-white mb-8">Create Your Hero</h1>
      
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Selections */}
        <div className="space-y-6">
          <div>
            <label htmlFor="heroName" className="block text-lg font-medium text-slate-300 mb-2">
              Hero Name
            </label>
            <input
              id="heroName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your hero's name"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label htmlFor="race" className="block text-lg font-medium text-slate-300 mb-2">Race</label>
            <select id="race" value={race} onChange={(e) => setRace(e.target.value as Race)} className="w-full p-2 bg-slate-800 rounded">
              {RACES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="class" className="block text-lg font-medium text-slate-300 mb-2">Class</label>
            <select id="class" value={characterClass} onChange={(e) => setCharacterClass(e.target.value as Class)} className="w-full p-2 bg-slate-800 rounded">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="affinity" className="block text-lg font-medium text-slate-300 mb-2">Affinity</label>
            <select id="affinity" value={affinity} onChange={(e) => setAffinity(e.target.value as Element)} className="w-full p-2 bg-slate-800 rounded">
              {AFFINITIES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Right Side: Information */}
        <div className="bg-slate-800 p-6 rounded-md border border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Race Details: {race}</h2>
          {selectedRaceData ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-300">Stat Bonus</h3>
                <p className="text-slate-400">
                  {Object.entries(selectedRaceData.statBonus).map(([stat, value]) => `${stat.toUpperCase()}: +${value}`).join(', ')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-300">Racial Ability</h3>
                <p className="text-slate-400"><strong>{selectedRaceData.ability.name}:</strong> {selectedRaceData.ability.description}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Select a race to see its details.</p>
          )}
        </div>
      </div>
      
      <div className="text-center mt-10">
        <button 
          onClick={handleComplete}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105"
        >
          Begin Your Adventure
        </button>
      </div>
    </div>
  );
};
