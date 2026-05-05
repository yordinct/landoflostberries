import React from 'react';

// A simple placeholder for the main menu
export const MainMenu = ({ onStart, user }: { onStart: () => void, user: any }) => (
  <div className="flex flex-col items-center justify-center h-full gap-4">
    <h1 className="text-4xl font-bold">Land of Lost Berries</h1>
    <p>Your adventure awaits.</p>
    <button onClick={onStart} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Start Game</button>
    {user ? <p>Welcome, {user.displayName || user.email}!</p> : <p>Sign in to save to the cloud.</p>}
  </div>
);

// A placeholder for the world map
export const WorldMap = ({ player, onTravel }: { player: any, onTravel: (regionId: string) => void }) => (
    <div className="p-4">
        <h2 className="text-2xl mb-4">World Map</h2>
        <p className="mb-4">Your journey begins here. Explore the regions to find adventure.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="border p-4 rounded-lg">
              <h3 className="text-xl font-bold">Verdant Valley</h3>
              <p>A lush valley teeming with life.</p>
              <button onClick={() => onTravel('verdant')} className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Explore</button>
           </div>
           <div className="border p-4 rounded-lg opacity-50">
              <h3 className="text-xl font-bold">Arid Wastes (Locked)</h3>
              <p>A vast, sun-scorched desert.</p>
           </div>
           <div className="border p-4 rounded-lg opacity-50">
              <h3 className="text-xl font-bold">Frozen Peaks (Locked)</h3>
              <p>Treacherous and icy mountains.</p>
           </div>
        </div>
    </div>
);

// A simple placeholder for a NavButton to avoid ReferenceError
export const NavButton = ({ icon: Icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string }) => (
  <button onClick={onClick} className={`flex items-center gap-2 p-2 rounded ${active ? 'bg-slate-700' : ''}`}>
    <Icon size={18} />
    <span className="hidden md:inline">{label}</span>
  </button>
);
