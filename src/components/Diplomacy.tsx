import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Shield, Sword, Flag, Users, TrendingUp, Search, Eye, AlertTriangle, Handshake, Scroll, X } from 'lucide-react';
import { PlayerState, Region } from '../types';
import { REGIONS } from '../constants';

interface DiplomacyProps {
  player: PlayerState;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerState>>;
  onInvasion: (regionId: string) => void;
  onDevelop: (regionId: string) => void;
}

export default function Diplomacy({ player, setPlayer, onInvasion, onDevelop }: DiplomacyProps) {
  const diplomacyState = player.diplomacy || {};
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  
  useEffect(() => {
     let updated = false;
     const newDip = { ...diplomacyState };
     REGIONS.forEach(r => {
        if (!newDip[r.id]) {
           newDip[r.id] = { status: r.status as 'War' | 'Peace' | 'Alliance', relation: r.status === 'War' ? -50 : 0, intel: 0 };
           updated = true;
        }
     });
     if (updated) {
         setPlayer(prev => ({ ...prev, diplomacy: newDip }));
     }
  }, [player.diplomacy, setPlayer]);

  const selectedRegion = REGIONS.find(r => r.id === selectedRegionId);
  const selectedDip = selectedRegion ? diplomacyState[selectedRegion.id] : null;

  const handleAction = (regionId: string, actionType: 'alliance' | 'spy' | 'war' | 'peace') => {
      if (player.resources.gold < 500) return; 
      
      setPlayer(prev => {
         const p = { ...prev };
         const dip = { ...(p.diplomacy || {}) };
         const current = dip[regionId] || { status: 'Peace', relation: 0, intel: 0 };
         p.resources = { ...p.resources, gold: p.resources.gold - 500 };
         
         if (actionType === 'spy') {
             current.intel = Math.min(100, current.intel + 25);
         } else if (actionType === 'war') {
             current.status = 'War';
             current.relation = -100;
         } else if (actionType === 'alliance') {
             if (current.relation > 20 || current.intel > 50) {
                 current.status = 'Alliance';
                 current.relation += 30;
             } else {
                 current.relation -= 10;
             }
         } else if (actionType === 'peace') {
             if (current.relation > -50) {
                 current.status = 'Peace';
                 current.relation = 0;
             }
         }
         dip[regionId] = current;
         p.diplomacy = dip;
         return p;
      });
  };

  const getRelationColor = (relation: number) => {
     if (relation > 40) return 'text-emerald-400';
     if (relation > 0) return 'text-blue-400';
     if (relation > -30) return 'text-amber-400';
     return 'text-rose-500';
  };
  
  const getStatusColor = (status: string) => {
     if (status === 'Alliance') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
     if (status === 'War') return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
     return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)]">
       <div className="w-full md:w-2/3 flex flex-col bg-slate-900 border border-white/5 rounded-3xl overflow-hidden h-full">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950">
             <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Geopolitics</h2>
                <p className="text-slate-500 text-xs font-medium tracking-wide">Manage global relations and territorial control.</p>
             </div>
             <div className="flex gap-3">
                 <div className="bg-slate-900 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                    <Flag size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-white">{Object.values(diplomacyState).filter(d => d.status === 'Alliance').length} Allies</span>
                 </div>
                 <div className="bg-slate-900 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                    <Sword size={14} className="text-rose-500" />
                    <span className="text-xs font-bold text-white">{Object.values(diplomacyState).filter(d => d.status === 'War').length} Wars</span>
                 </div>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
             {REGIONS.map((region, i) => {
                const devLevel = (player.conqueredRegions || {})[region.id] || 0;
                const isConquered = devLevel > 0;
                const dip = diplomacyState[region.id] || { status: region.status, relation: 0, intel: 0 };
                
                return (
                   <motion.div 
                      key={`${region.id}_${i}`}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedRegionId(region.id)}
                      className={`cursor-pointer relative overflow-hidden rounded-2xl border transition-all ${selectedRegionId === region.id ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-white/5 hover:border-white/20'}`}
                   >
                      <div className="absolute inset-0 z-0">
                         <img src={region.visual} alt={region.name} className="w-full h-full object-cover opacity-20 grayscale" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
                      </div>
                      
                      <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                               <h3 className="text-base font-black uppercase text-white tracking-widest leading-tight">{region.name}</h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isConquered ? 'Imperial Province' : 'Independent Nation'}</p>
                            </div>
                            {isConquered ? (
                               <div className="px-2 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded text-[9px] font-black uppercase tracking-widest">
                                  Lv {devLevel}
                               </div>
                            ) : (
                               <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${getStatusColor(dip.status)}`}>
                                  {dip.status}
                               </div>
                            )}
                         </div>
                         
                         <div className="flex justify-between items-end">
                            <div className="flex gap-3">
                               <div className="flex items-center gap-1">
                                  <Shield size={12} className="text-slate-500" />
                                  <span className="text-xs font-bold text-white">{region.difficulty * 250}</span>
                               </div>
                               {!isConquered && (
                                  <div className="flex items-center gap-1">
                                     <Handshake size={12} className={getRelationColor(dip.relation)} />
                                     <span className={`text-xs font-bold ${getRelationColor(dip.relation)}`}>{dip.relation}</span>
                                  </div>
                               )}
                            </div>
                            {!isConquered && (
                               <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-white/10 text-[10px] font-bold text-slate-400">
                                  <Eye size={10} /> {dip.intel}% Intel
                               </div>
                            )}
                         </div>
                      </div>
                   </motion.div>
                );
             })}
          </div>
       </div>

       <div className="w-full md:w-1/3 flex flex-col gap-4 h-full">
          <AnimatePresence mode="popLayout">
             {selectedRegion && selectedDip && (
                <motion.div 
                   key={selectedRegion.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="flex-1 bg-slate-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col"
                >
                   <div className="h-40 shrink-0 relative">
                       <img src={selectedRegion.visual} className="w-full h-full object-cover opacity-60" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                       <button onClick={() => setSelectedRegionId(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white/50 hover:text-white transition-colors">
                          <X size={16} />
                       </button>
                       <div className="absolute bottom-4 left-6">
                           <h3 className="text-2xl font-black uppercase text-white tracking-widest leading-none drop-shadow-lg">{selectedRegion.name}</h3>
                           <p className="text-xs text-slate-300 font-bold drop-shadow-lg mt-1">{selectedRegion.description}</p>
                       </div>
                   </div>

                   <div className="p-6 flex-1 overflow-y-auto space-y-6">
                       <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-950 p-3 rounded-2xl border border-white/5">
                             <div className="text-[9px] uppercase font-black text-slate-500 mb-1">Military Power</div>
                             <div className="text-sm font-black text-red-400">{selectedRegion.difficulty * 250} PT</div>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-2xl border border-white/5">
                             <div className="text-[9px] uppercase font-black text-slate-500 mb-1">Defense Rank</div>
                             <div className="text-sm font-black text-emerald-400">Rank {selectedRegion.difficulty}</div>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-2xl border border-white/5">
                             <div className="text-[9px] uppercase font-black text-slate-500 mb-1">Resources</div>
                             <div className="text-[10px] font-bold text-blue-400 truncate">{selectedRegion.resources.join(', ')}</div>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-2xl border border-white/5">
                             <div className="text-[9px] uppercase font-black text-slate-500 mb-1">Key Enemies</div>
                             <div className="text-[10px] font-bold text-purple-400 truncate">{selectedRegion.enemies.join(', ')}</div>
                          </div>
                       </div>

                       {((player.conqueredRegions || {})[selectedRegion.id] || 0) > 0 ? (
                          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                             <Shield size={32} className="text-emerald-500 mb-2" />
                             <h4 className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-1">Imperial Province</h4>
                             
                             <div className="w-full bg-slate-900 rounded-full h-1.5 mb-2 overflow-hidden border border-white/5">
                                <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, ((player.conqueredRegions || {})[selectedRegion.id] || 1) * 10)}%` }} />
                             </div>
                             <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest mb-3">Assimilation: {Math.min(100, ((player.conqueredRegions || {})[selectedRegion.id] || 1) * 10)}%</p>

                             <p className="text-[10px] text-emerald-500/70 mb-4">Invest resources to expand your influence. This territory slowly becomes part of your kingdom.</p>
                             
                             <div className="w-full space-y-2 mb-4 text-[9px] text-left border-y border-emerald-500/20 py-2">
                                <div className="flex justify-between"><span className="text-slate-400 uppercase tracking-widest">Total Population:</span> <span className="text-emerald-400 font-black">{((player.conqueredRegions || {})[selectedRegion.id] || 1) * 5000}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 uppercase tracking-widest">Available for War:</span> <span className="text-emerald-400 font-black">{((player.conqueredRegions || {})[selectedRegion.id] || 1) * 1500}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 uppercase tracking-widest">Recruit Pool:</span> <span className="text-emerald-400 font-black">{((player.conqueredRegions || {})[selectedRegion.id] || 1) * 300}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 uppercase tracking-widest">Missions & Study:</span> <span className="text-emerald-400 font-black">{((player.conqueredRegions || {})[selectedRegion.id] || 1) * 450}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 uppercase tracking-widest">Suspected Infiltrators:</span> <span className="text-red-400 font-black">{Math.max(0, 10 - ((player.conqueredRegions || {})[selectedRegion.id] || 1))}</span></div>
                             </div>

                             <button 
                                onClick={() => onDevelop(selectedRegion.id)} 
                                disabled={player.resources.gold < (((player.conqueredRegions || {})[selectedRegion.id] || 1) + 1) * 300}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-emerald-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500"
                             >
                                Invest (Cost: {(((player.conqueredRegions || {})[selectedRegion.id] || 1) + 1) * 300}G)
                             </button>
                          </div>
                       ) : (
                          <div className="space-y-4">
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-1">
                                <span className="text-slate-500">Current Status</span>
                                <span className={getStatusColor(selectedDip.status).split(' ')[1]}>{selectedDip.status}</span>
                             </div>
                             
                             <div className="space-y-2">
                               {selectedDip.status === 'War' ? (
                                  <>
                                     <button onClick={() => onInvasion(selectedRegion.id)} className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/40 border border-red-500/50">
                                        <Sword size={14} /> Launch Invasion
                                     </button>
                                     <button onClick={() => handleAction(selectedRegion.id, 'peace')} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5 disabled:opacity-50" disabled={player.resources.gold < 500}>
                                        <Flag size={14} /> Sue for Peace (500G)
                                     </button>
                                  </>
                               ) : (
                                  <>
                                     {selectedDip.status !== 'Alliance' && (
                                        <button onClick={() => handleAction(selectedRegion.id, 'alliance')} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50" disabled={player.resources.gold < 500}>
                                           <Handshake size={14} /> Propose Alliance (500G)
                                        </button>
                                     )}
                                     <button onClick={() => handleAction(selectedRegion.id, 'spy')} className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50" disabled={player.resources.gold < 500}>
                                        <Eye size={14} /> Send Spies (500G)
                                     </button>
                                     <button onClick={() => handleAction(selectedRegion.id, 'war')} className="w-full flex items-center justify-center gap-2 py-3 bg-red-950 hover:bg-red-900 text-red-500 border border-red-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all mt-4">
                                        <AlertTriangle size={14} /> Declare War
                                     </button>
                                  </>
                               )}
                             </div>
                             
                             <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 border-b border-white/5 pb-2">Spy Report</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                   {selectedDip.intel < 10 && "We know almost nothing about their inner workings. Send spies."}
                                   {selectedDip.intel >= 10 && selectedDip.intel < 50 && "They have a moderate military force and value their borders. They may form an alliance if favorable."}
                                   {selectedDip.intel >= 50 && selectedDip.intel < 100 && "We have detailed maps of their defenses. Their ruler is weak and public order is declining."}
                                   {selectedDip.intel >= 100 && "Total infiltration. We know their every move. They are ripe for conquest or subjugation."}
                                </p>
                             </div>
                          </div>
                       )}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
          
          {!selectedRegion && (
             <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8 h-full">
                <Globe size={48} className="text-slate-700 mb-4" />
                <h3 className="text-lg font-black uppercase text-slate-500 tracking-widest">Global Theatre</h3>
                <p className="text-xs text-slate-600 mt-2">Select a nation from the list to view detailed intel, manage diplomatic relations, or declare war.</p>
             </div>
          )}
       </div>
    </div>
  );
}
