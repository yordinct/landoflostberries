import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Swords, Flag, Crown, Crosshair, Map as MapIcon, RotateCw, AlertTriangle, ChevronRight, History, X, Plus } from 'lucide-react';
import { PlayerState, Character, Beast, LeagueDivision, LeagueCampaign } from '../types';
import CharacterAvatar from './CharacterAvatar';
import { getCharacterRank, getDivisionSynergy } from '../utils';

interface LeagueProps {
  player: PlayerState;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerState | null>>;
}

const CAMPAIGN_TEMPLATES = [
  { name: 'Operation Iron Vanguard', type: 'War' as const, duration: 60000 * 5, difficulty: 50 },
  { name: 'Lost City Recon', type: 'Exploration' as const, duration: 60000 * 2, difficulty: 20 },
  { name: 'Defend the Borders', type: 'Defense' as const, duration: 60000 * 3, difficulty: 80 },
  { name: 'Subjugate the Wilds', type: 'Subjugation' as const, duration: 60000 * 10, difficulty: 150 },
  { name: 'Ancient Dragon Hunt', type: 'War' as const, duration: 60000 * 20, difficulty: 500 },
];

export default function League({ player, setPlayer }: LeagueProps) {
  const [activeTab, setActiveTab] = useState<'troops' | 'campaigns' | 'logs'>('troops');
  const [showAutoAssign, setShowAutoAssign] = useState(false);
  const [assignDropdownId, setAssignDropdownId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<LeagueCampaign | null>(null);
  const [selectedCaptainForCampaign, setSelectedCaptainForCampaign] = useState<string>('');
  
  const squad = player.squad || [];
  const beasts = player.beasts || [];
  const divisions = player.leagueDivisions || [];
  const campaigns = player.leagueCampaigns || [];
  const logs = player.leagueCaptainsLog || {};
  const merit = player.leagueMerit || {};

  // Initialize Divisions if empty
  useEffect(() => {
    if (divisions.length === 0 && squad.length > 0) {
       const initialDivisions: LeagueDivision[] = [];
       // Make up to first 2 heroes captains.
       squad.slice(0, 2).forEach(c => {
          initialDivisions.push({ captainId: c.id, subordinateIds: [] });
       });
       if (initialDivisions.length > 0) {
          setPlayer(prev => prev ? ({ ...prev, leagueDivisions: initialDivisions }) : null);
       }
    }
  }, []);

  // Update loop for campaigns & autonomy
  useEffect(() => {
     const interval = setInterval(() => {
        setPlayer(prev => {
           if (!prev) return prev;
           let updatedCampaigns = [...(prev.leagueCampaigns || [])];
           const currentLogs = { ...(prev.leagueCaptainsLog || {}) };
           const currentMerit = { ...(prev.leagueMerit || {}) };
           let changed = false;

           const now = Date.now();

           updatedCampaigns = updatedCampaigns.map(camp => {
              if (camp.status === 'In Progress') {
                 const elapsed = now - camp.startTime;
                 if (elapsed >= camp.duration) {
                    changed = true;
                    // Resolve campaign
                    if (!currentLogs[camp.assignedCaptainId]) currentLogs[camp.assignedCaptainId] = [];
                    currentLogs[camp.assignedCaptainId] = [`Campaign ${camp.name} Completed successfully!`, ...currentLogs[camp.assignedCaptainId]].slice(0, 20);
                    currentMerit[camp.assignedCaptainId] = (currentMerit[camp.assignedCaptainId] || 0) + camp.difficulty;
                    
                    return { ...camp, status: 'Success' };
                 } else {
                    // Check logic failure conditions
                    // For realism: calculate relative power of division vs difficulty.
                    const division = (prev.leagueDivisions || []).find(d => d.captainId === camp.assignedCaptainId);
                    if (division) {
                       const captain = prev.squad.find(s => s.id === division.captainId);
                       let basePower = (captain?.level || 1) * 10;
                       let subHeroes: any[] = [];
                       let subBeasts: any[] = [];
                       division.subordinateIds.forEach(id => {
                          const subHero = prev.squad.find(s => s.id === id);
                          if (subHero) { basePower += subHero.level * 5; subHeroes.push(subHero); }
                          const subBeast = prev.beasts.find(b => b.id === id);
                          if (subBeast) { basePower += subBeast.level * 3; subBeasts.push(subBeast); }
                       });
                       const synergy = getDivisionSynergy(captain, subHeroes, subBeasts);
                       let power = Math.floor(basePower * synergy.bonus);
                       
                       // If power is severely lacking, early failure.
                       if (power < camp.difficulty * 0.5 && elapsed > camp.duration * 0.3) {
                          changed = true;
                          if (!currentLogs[camp.assignedCaptainId]) currentLogs[camp.assignedCaptainId] = [];
                          currentLogs[camp.assignedCaptainId] = [`WARNING: Campaign ${camp.name} FAILED! The assigned forces were too weak and were overwhelmed in the field.`, ...currentLogs[camp.assignedCaptainId]].slice(0, 20);
                          return { ...camp, status: 'Failed', failReason: 'Forces overwhelmed due to insufficient power.' };
                       }
                    }
                 }
              }
              return camp;
           });

           // Random autonomous events for idle captains (1% chance every 2s)
           (prev.leagueDivisions || []).forEach(div => {
              const activeCamp = updatedCampaigns.find(c => c.assignedCaptainId === div.captainId && c.status === 'In Progress');
              if (!activeCamp && Math.random() < 0.05) {
                 changed = true;
                 if (!currentLogs[div.captainId]) currentLogs[div.captainId] = [];
                 
                 const actionVerbs = ["Drilled", "Scouted", "Reorganized", "Resolved", "Studied", "Investigated", "Negotiated", "Captured", "Liberated", "Repaired", "Deciphered", "Patrolled", "Interrogated", "Forged", "Meditated", "Hunted", "Mapped", "Purified", "Guarded", "Assessed", "Ambushed", "Tracked", "Fortified", "Inspected", "Rallied"];
                 const targets = ["subordinates", "nearby territories", "supply chains", "a dispute", "ancient tactics", "a local resource node", "a trade disagreement", "a rogue beast", "a captured spy", "an ancient ruin", "the armory", "the barracks", "local merchants", "the perimeter", "a mysterious crystal", "the kingdom's borders", "enemy movements", "the local populace", "a magical anomaly", "rebel encampments", "mercenary contracts", "the treasury", "old battlefields", "the inner sanctum"];
                 const results = ["to increase discipline.", "gaining merit.", "for better efficiency.", "learning new secrets, gaining merit.", "securing the area.", "finding hidden resources, gaining merit.", "preventing an ambush.", "improving squad morale.", "discovering a forgotten technique.", "earning the respect of the locals, gaining merit.", "revealing hidden enemies.", "strengthening our defenses.", "optimizing resource flow.", "uncovering a plot.", "to better serve the kingdom, gaining merit.", "avoiding potential disaster.", "boosting local economy.", "understanding enemy weaknesses, gaining merit."];

                 const v = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
                 const t = targets[Math.floor(Math.random() * targets.length)];
                 const r = results[Math.floor(Math.random() * results.length)];
                 
                 const ev = `${v} ${t} ${r}`;
                 currentLogs[div.captainId] = [ev, ...currentLogs[div.captainId]].slice(0, 20);
                 if (ev.includes("merit")) {
                    currentMerit[div.captainId] = (currentMerit[div.captainId] || 0) + 5;
                 }
              }
           });

           // Generate new campaigns if none available
           if (updatedCampaigns.length < 3 && Math.random() < 0.1) {
               changed = true;
               const tpl = CAMPAIGN_TEMPLATES[Math.floor(Math.random() * CAMPAIGN_TEMPLATES.length)];
               updatedCampaigns.push({
                   id: `camp_${Date.now()}_${Math.random()}`,
                   name: tpl.name,
                   type: tpl.type,
                   duration: tpl.duration,
                   difficulty: tpl.difficulty,
                   startTime: 0,
                   assignedCaptainId: '',
                   assignedSubordinateIds: [],
                   status: 'Pending',
                   logs: [],
                   reward: `${tpl.difficulty * 10} Gold & ${tpl.difficulty} EXP`
               });
           }

           if (changed) {
              return { ...prev, leagueCampaigns: updatedCampaigns, leagueCaptainsLog: currentLogs, leagueMerit: currentMerit };
           }
           return prev;
        });
     }, 2000);
     return () => clearInterval(interval);
  }, []);

  const handleAutoAssign = () => {
     setShowAutoAssign(true);
     setPlayer(prev => {
        if (!prev) return prev;
        
        let currentDivisions = [...(prev.leagueDivisions || [])].map(d => ({...d, subordinateIds: [...d.subordinateIds]}));
        const assignedIds = new Set<string>();
        currentDivisions.forEach(d => {
            assignedIds.add(d.captainId);
            d.subordinateIds.forEach(id => assignedIds.add(id));
        });

        const availHeroes = prev.squad.filter(s => !assignedIds.has(s.id));
        const availBeasts = prev.beasts.filter(b => !assignedIds.has(b.id));

        const getDivMaxSubs = (d: any) => {
            const captain = prev.squad.find(s => s.id === d.captainId);
            if (!captain) return 4;
            const rank = getCharacterRank(captain.level);
            return rank === 'SSS' ? 10 : rank === 'SS' ? 8 : rank === 'S' ? 6 : 4;
        };

        if (currentDivisions.length > 0) {
            let changed = true;
            while(changed && (availHeroes.length > 0 || availBeasts.length > 0)) {
               changed = false;
               for (let i = 0; i < currentDivisions.length; i++) {
                   const div = currentDivisions[i];
                   const max = getDivMaxSubs(div);
                   if (div.subordinateIds.length < max) {
                       if (availHeroes.length > 0) {
                           div.subordinateIds.push(availHeroes.shift()!.id);
                           changed = true;
                       } else if (availBeasts.length > 0) {
                           div.subordinateIds.push(availBeasts.shift()!.id);
                           changed = true;
                       }
                   }
               }
            }
        }
        
        return { ...prev, leagueDivisions: currentDivisions };
     });
     
     setTimeout(() => setShowAutoAssign(false), 1000);
  };

  const dispatchCampaign = (campaignId: string) => {
      if (!selectedCaptainForCampaign) return;
      setPlayer(prev => {
          if(!prev) return prev;
          
          // Check if already in progress
          const isBusy = (prev.leagueCampaigns || []).some(c => c.assignedCaptainId === selectedCaptainForCampaign && c.status === 'In Progress' && c.startTime > 0);
          if (isBusy) {
             return prev;
          }

          const camp = prev.leagueCampaigns?.find(c => c.id === campaignId);
          if(!camp) return prev;
          const div = prev.leagueDivisions?.find(d => d.captainId === selectedCaptainForCampaign);
          if(!div) return prev;

          const updated = (prev.leagueCampaigns || []).map(c => 
             c.id === campaignId ? { ...c, status: 'In Progress', startTime: Date.now(), assignedCaptainId: selectedCaptainForCampaign, assignedSubordinateIds: div.subordinateIds } : c
          );
          
          const currentLogs = { ...(prev.leagueCaptainsLog || {}) };
          if (!currentLogs[selectedCaptainForCampaign]) currentLogs[selectedCaptainForCampaign] = [];
          currentLogs[selectedCaptainForCampaign] = [`Deployed to campaign: ${camp.name}`, ...currentLogs[selectedCaptainForCampaign]];

          return { ...prev, leagueCampaigns: updated, leagueCaptainsLog: currentLogs };
      });
      setSelectedCampaign(null);
      setSelectedCaptainForCampaign('');
  };

  const claimCampaign = (campaignId: string) => {
      setPlayer(prev => {
          if(!prev) return prev;
          const camp = prev.leagueCampaigns?.find(c => c.id === campaignId);
          if(!camp) return prev;

          let gold = 0;
          if (camp.status === 'Success') {
              gold = camp.difficulty * 10;
          }

          const updated = (prev.leagueCampaigns || []).filter(c => c.id !== campaignId);
          return {
             ...prev, 
             leagueCampaigns: updated, 
             resources: { ...prev.resources, gold: prev.resources.gold + gold }
          };
      });
  };

  const claimAllCampaigns = () => {
      setPlayer(prev => {
          if(!prev) return prev;
          let gold = 0;
          const remaining = (prev.leagueCampaigns || []).filter(c => {
             if (c.status === 'Success') {
                gold += c.difficulty * 10;
                return false;
             }
             if (c.status === 'Failed') return false;
             return true;
          });

          return {
             ...prev, 
             leagueCampaigns: remaining, 
             resources: { ...prev.resources, gold: prev.resources.gold + gold }
          };
      });
  };

  const promoteToCaptain = (characterId: string) => {
      setPlayer(prev => {
          if(!prev) return prev;
          const currentDivisions = [...(prev.leagueDivisions || [])];
          if (currentDivisions.some(d => d.captainId === characterId)) return prev;
          currentDivisions.forEach(d => {
             d.subordinateIds = d.subordinateIds.filter(id => id !== characterId);
          });
          currentDivisions.push({ captainId: characterId, subordinateIds: [] });
          return { ...prev, leagueDivisions: currentDivisions };
      });
  };

  const commendCaptain = (characterId: string) => {
      setPlayer(prev => {
          if(!prev) return prev;
          if (prev.resources.gold < 100) return prev;
          const currentMerit = { ...(prev.leagueMerit || {}) };
          currentMerit[characterId] = (currentMerit[characterId] || 0) + 50;
          return { 
              ...prev, 
              leagueMerit: currentMerit,
              resources: { ...prev.resources, gold: prev.resources.gold - 100 }
          };
      });
  };

  const demoteCaptain = (characterId: string) => {
      setPlayer(prev => {
          if(!prev) return prev;
          const currentDivisions = (prev.leagueDivisions || []).filter(d => d.captainId !== characterId);
          return { ...prev, leagueDivisions: currentDivisions };
      });
  };

  const removeAllAssignments = () => {
      setPlayer(prev => ({ ...prev, leagueDivisions: [] }));
  };

  const assignSubordinate = (divisionId: string, subId: string) => {
      setPlayer(prev => {
          if (!prev) return prev;
          const currentDivisions = [...(prev.leagueDivisions || [])];
          const div = currentDivisions.find(d => d.captainId === divisionId);
          if (div && !div.subordinateIds.includes(subId)) {
             const captain = prev.squad.find(s => s.id === divisionId);
             const rank = captain ? getCharacterRank(captain.level) : 'F';
             const maxSubs = rank === 'SSS' ? 10 : rank === 'SS' ? 8 : rank === 'S' ? 6 : 4;
             if (div.subordinateIds.length >= maxSubs) {
                 return prev;
             }
             div.subordinateIds.push(subId);
          }
          return { ...prev, leagueDivisions: currentDivisions };
      });
  };

  const removeSubordinate = (divisionId: string, subId: string) => {
      setPlayer(prev => {
          if (!prev) return prev;
          const currentDivisions = [...(prev.leagueDivisions || [])].map(d => {
             if (d.captainId === divisionId) {
                return { ...d, subordinateIds: d.subordinateIds.filter(id => id !== subId) };
             }
             return d;
          });
          return { ...prev, leagueDivisions: currentDivisions };
      });
  };

  const unassignedHeroes = squad.filter(s => !divisions.some(d => d.captainId === s.id || d.subordinateIds.includes(s.id)));
  const unassignedBeasts = beasts.filter(b => !divisions.some(d => d.subordinateIds.includes(b.id)));

  const getCaptainName = (id: string) => squad.find(s => s.id === id)?.name || 'Unknown Captain';

  const getDivisionPower = (div: LeagueDivision) => {
      const captain = squad.find(s => s.id === div.captainId);
      let basePower = (captain?.level || 1) * 10;
      let subHeroes: any[] = [];
      let subBeasts: any[] = [];
      div.subordinateIds.forEach(id => {
         const subHero = squad.find(s => s.id === id);
         if (subHero) { basePower += subHero.level * 5; subHeroes.push(subHero); }
         const subBeast = beasts.find(b => b.id === id);
         if (subBeast) { basePower += subBeast.level * 3; subBeasts.push(subBeast); }
      });
      const synergy = getDivisionSynergy(captain, subHeroes, subBeasts);
      return Math.floor(basePower * synergy.bonus);
  };

  const toRoman = (num: number) => {
      const roman = ["","I","II","III","IV","V","VI","VII","VIII","IX","X"];
      return roman[num] || num.toString();
  };

  const sortedDivisions = [...divisions].sort((a, b) => getDivisionPower(b) - getDivisionPower(a));

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">The League</h2>
          <p className="text-slate-500 text-sm font-medium tracking-wide">Command independent divisions, dispatch troops into campaigns, track division autonomy.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-slate-900 p-1 rounded-2xl border border-white/5">
           <button 
             onClick={() => setActiveTab('troops')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'troops' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-amber-500'}`}
           >
              Divisions
           </button>
           <button 
             onClick={() => setActiveTab('campaigns')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'campaigns' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-amber-500'}`}
           >
              Campaigns
           </button>
           <button 
             onClick={() => setActiveTab('logs')}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-amber-500'}`}
           >
              Captain Logs
           </button>
        </div>
      </header>

      {activeTab === 'troops' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Active Divisions ({sortedDivisions.length})</h3>
                 <div className="flex flex-wrap gap-2">
                    <button onClick={handleAutoAssign} disabled={sortedDivisions.length === 0} className={`text-[10px] font-black tracking-widest text-emerald-500 uppercase flex items-center gap-2 hover:bg-emerald-500/10 px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${showAutoAssign ? 'animate-pulse' : ''}`}>
                       <Crosshair size={14} /> Auto-Assign
                    </button>
                    <button onClick={removeAllAssignments} disabled={sortedDivisions.length === 0} className="text-[10px] font-black tracking-widest text-rose-500 uppercase flex items-center gap-2 hover:bg-rose-500/10 px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                       <X size={14} /> Remove All
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                 {sortedDivisions.map((div, idx) => {
                    const captain = squad.find(s => s.id === div.captainId);
                    if (!captain) return null;
                    const power = getDivisionPower(div);
                    const meritVal = merit[div.captainId] || 0;
                    
                    let rankLevel = "Lieutenant";
                    if (meritVal > 50) rankLevel = "Captain";
                    if (meritVal > 200) rankLevel = "Commander";
                    if (meritVal > 500) rankLevel = "General";

                    const maxSubs = getCharacterRank(captain.level) === 'SSS' ? 10 : getCharacterRank(captain.level) === 'SS' ? 8 : getCharacterRank(captain.level) === 'S' ? 6 : 4;

                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;

                    let borderClass = 'border-white/5 hover:border-slate-700';
                    let rankColor = 'text-white/[0.03]';
                    let bgOverlay = null;

                    if (isTop1) {
                        borderClass = 'border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] ring-2 ring-amber-500/50 bg-gradient-to-br from-slate-900 to-amber-900/40 relative z-20 transform scale-[1.02]';
                        rankColor = 'text-amber-500/20 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]';
                        bgOverlay = <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-500/30 blur-[60px] rounded-full pointer-events-none" />;
                    } else if (isTop2) {
                        borderClass = 'border-slate-300/60 shadow-[0_0_20px_rgba(203,213,225,0.15)] ring-1 ring-slate-300/30 bg-gradient-to-br from-slate-900 to-slate-700/40 relative z-10 transform scale-[1.01]';
                        rankColor = 'text-slate-300/20 drop-shadow-[0_0_10px_rgba(203,213,225,0.3)]';
                        bgOverlay = <div className="absolute -top-10 -right-10 w-56 h-56 bg-slate-300/20 blur-[50px] rounded-full pointer-events-none" />;
                    } else if (isTop3) {
                        borderClass = 'border-orange-700/60 shadow-[0_0_20px_rgba(194,65,12,0.2)] ring-1 ring-orange-700/30 bg-gradient-to-br from-slate-900 to-orange-900/30';
                        rankColor = 'text-orange-600/20 drop-shadow-[0_0_10px_rgba(194,65,12,0.4)]';
                        bgOverlay = <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-700/20 blur-[40px] rounded-full pointer-events-none" />;
                    } else {
                        borderClass = 'border-white/5 bg-slate-900 hover:border-slate-700 opacity-80';
                    }

                    return (
                       <div key={`${div.captainId}_${idx}`} className={`border p-6 rounded-3xl relative overflow-hidden transition-all duration-300 ${borderClass}`}>
                          {bgOverlay}
                          <div className="flex md:items-center flex-col md:flex-row gap-6 relative z-10">
                             <div className="flex items-center gap-4 border-r border-white/5 pr-6 w-full md:w-1/3 shrink-0 relative">
                                <div className={`absolute top-2 right-4 text-3xl font-black italic pointer-events-none tracking-tighter ${rankColor}`}>
                                   {isTop1 ? '👑 ' : ''}DIV {toRoman(idx + 1)}
                                </div>
                                <CharacterAvatar race={captain.race} characterClass={captain.class} affinity={captain.affinity} size="sm" />
                                <div className="relative z-10">
                                    <div className="text-sm font-black text-white italic uppercase tracking-tighter">{captain.name} <span className={`text-[10px] ml-1 px-1 rounded bg-black/50 ${getCharacterRank(captain.level) === 'SSS' ? 'text-amber-300' : 'text-emerald-400'}`}>Rank {getCharacterRank(captain.level)}</span></div>
                                   <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-tight">{rankLevel} <br/><span className="text-slate-500">{meritVal} Merit</span></div>
                                   <div className="text-[9px] font-black uppercase tracking-widest mt-1 shadow-sm px-1.5 py-0.5 rounded inline-block bg-black/40 border border-white/5">
                                      <span className="text-slate-500 mr-1">PWR:</span>
                                      <span className={isTop1 ? "text-amber-400 font-extrabold" : isTop2 ? "text-slate-200 font-bold" : isTop3 ? "text-orange-400 font-bold" : "text-indigo-400"}>{power}</span>
                                   </div>
                                </div>
                             </div>
                             
      {(() => {
          let hList: any[] = [];
          let bList: any[] = [];
          div.subordinateIds.forEach(id => {
             const subH = squad.find(s => s.id === id);
             if (subH) hList.push(subH);
             const subB = beasts.find(b => b.id === id);
             if (subB) bList.push(subB);
          });
          const syn = getDivisionSynergy(captain, hList, bList);
          return (
             <div className="absolute top-4 right-20 text-right z-10 hidden md:block">
                <div className="text-[10px] font-black uppercase text-amber-500 tracking-widest">{syn.label}</div>
                <div className="text-[8px] text-slate-400 max-w-[120px] leading-tight">{syn.description}</div>
             </div>
          );
      })()}
      <div className="flex-1 w-full pl-2">
                                <div className="flex justify-between items-center mb-2">
                                   <span className={`text-[10px] font-black uppercase tracking-widest ${div.subordinateIds.length >= maxSubs ? 'text-rose-500' : 'text-slate-500'}`}>Assigned Subordinates ({div.subordinateIds.length}/{maxSubs})</span>
                                   <div className="flex gap-2">
                                      <button 
                                         onClick={() => commendCaptain(div.captainId)}
                                         disabled={player.resources.gold < 100}
                                         title="Reward Captain with 100 Gold to give 50 Merit"
                                         className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 uppercase font-black tracking-widest hover:bg-amber-500 hover:text-slate-900 flex items-center gap-1 disabled:opacity-50 transition-all z-20">
                                         <Crown size={10} /> Commend
                                      </button>
                                      <button onClick={() => demoteCaptain(div.captainId)} className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20 uppercase font-black tracking-widest hover:bg-red-500 hover:text-white flex items-center gap-1 z-20">
                                         <X size={10} /> Demote
                                      </button>
                                      <div className="relative inline-block z-30">
                                          <button 
                                             onClick={() => setAssignDropdownId(assignDropdownId === div.captainId ? null : div.captainId)}
                                             disabled={div.subordinateIds.length >= maxSubs} 
                                             className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 uppercase font-black tracking-widest hover:bg-indigo-500/30 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                             <Plus size={10} /> Assign
                                          </button>
                                       {div.subordinateIds.length < maxSubs && assignDropdownId === div.captainId && (
                                         <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded z-50 shadow-xl p-2 w-48 max-h-48 overflow-y-auto">
                                            <div className="flex justify-between items-center mb-1">
                                               <div className="text-[8px] uppercase font-bold text-slate-500">Available Heroes</div>
                                               <button onClick={() => setAssignDropdownId(null)} className="text-slate-500 hover:text-white"><X size={10}/></button>
                                            </div>
                                           {unassignedHeroes.map((h, i) => (
                                              <div key={`hero_${h.id}_${i}`} onClick={() => assignSubordinate(div.captainId, h.id)} className="text-[9px] font-black uppercase text-slate-300 p-1 hover:bg-indigo-500 hover:text-white cursor-pointer rounded flex justify-between">
                                                 <span>{h.name}</span>
                                                 <span className="text-emerald-400">R:{getCharacterRank(h.level)}</span>
                                              </div>
                                           ))}
                                           <div className="text-[8px] uppercase font-bold text-slate-500 mt-2 mb-1">Available Beasts</div>
                                           {unassignedBeasts.map((b, i) => (
                                              <div key={`beast_${b.id}_${i}`} onClick={() => assignSubordinate(div.captainId, b.id)} className="text-[9px] font-black uppercase text-amber-300 p-1 hover:bg-amber-500 hover:text-white cursor-pointer rounded">
                                                 {b.name || b.species}
                                              </div>
                                           ))}
                                           {unassignedHeroes.length === 0 && unassignedBeasts.length === 0 && <div className="text-[8px] text-slate-500 italic">None available</div>}
                                        </div>
                                      )}
                                   </div>
                                       </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                   {div.subordinateIds.length === 0 ? (
                                      <span className="text-xs text-slate-600 font-medium italic">No subordinates assigned yet.</span>
                                   ) : (
                                      div.subordinateIds.map((subId, i) => {
                                         const subHero = squad.find(s => s.id === subId);
                                         const subBeast = beasts.find(b => b.id === subId);
                                         const name = subHero?.name || subBeast?.name || 'Unknown';
                                         const isBeast = !!subBeast;
                                         return (
                                            <span key={`sub_${subId}_${i}`} className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 font-black uppercase tracking-widest ${isBeast ? 'bg-amber-900/20 text-amber-500 border border-amber-500/20' : 'bg-blue-900/20 text-blue-400 border border-blue-500/20'}`}>
                                               {name} {subHero && `(R:${getCharacterRank(subHero.level)})`}
                                               <button onClick={() => removeSubordinate(div.captainId, subId)} className="hover:text-white ml-1 opacity-50 hover:opacity-100"><X size={10} /></button>
                                            </span>
                                         );
                                      })
                                   )}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={() => demoteCaptain(div.captainId)} className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-slate-950 px-2 py-1 rounded transition-colors flex items-center gap-1"><X size={10}/> Demote Captain</button>
                                </div>
                             </div>
                          </div>
                          
                          {/* Active Campaign Status */}
                          {campaigns.find(c => c.assignedCaptainId === div.captainId && c.status === 'In Progress') && (
                             <div className="absolute top-0 right-0 px-4 py-1 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest transform translate-x-2 -translate-y-0.5 rounded-bl-lg">
                                On Mission
                             </div>
                          )}
                       </div>
                    );
                 })}
                 
                 {divisions.length === 0 && (
                     <div className="py-12 text-center border-2 border-slate-800 border-dashed rounded-3xl">
                        <div className="text-xs text-slate-500 font-black uppercase tracking-widest">No divisions actively structured.</div>
                     </div>
                 )}
              </div>
           </div>

           <div className="space-y-6">
             <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 space-y-6">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-[0.3em]">Reserves Pool</h3>
                <div className="space-y-4">
                   <div className="p-4 border-2 border-dashed border-white/5 rounded-2xl">
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-white/10 pb-2">Unassigned Heroes ({unassignedHeroes.length})</div>
                     {unassignedHeroes.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">No available heroes.</p>
                     ) : (
                        <div className="flex flex-col gap-2">
                           {unassignedHeroes.map((h, i) => (
                              <div key={`uh_${h.id}_${i}`} className="flex justify-between items-center text-[10px] bg-slate-950 p-2 rounded">
                                 <span className="font-bold text-slate-300">{h.name} <span className="text-emerald-400 ml-1">R:{getCharacterRank(h.level)}</span></span>
                                 <button onClick={() => promoteToCaptain(h.id)} className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase font-black tracking-widest hover:bg-emerald-500 hover:text-slate-950 transition-colors">Promote</button>
                              </div>
                           ))}
                        </div>
                     )}
                   </div>

                   <div className="p-4 border-2 border-dashed border-white/5 rounded-2xl">
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-white/10 pb-2">Unassigned Beasts ({unassignedBeasts.length})</div>
                     {unassignedBeasts.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">No available beasts.</p>
                     ) : (
                        <div className="flex flex-wrap gap-1">
                           {unassignedBeasts.map((b, i) => (
                              <span key={`ub_${b.id}_${i}`} className="text-[9px] px-1.5 py-0.5 bg-amber-900/20 text-amber-500 border border-amber-500/20 rounded font-black tracking-widest uppercase">
                                 {b.name || b.species}
                              </span>
                           ))}
                        </div>
                     )}
                   </div>
                </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
           <div className="flex justify-end">
              {campaigns.some(c => c.status === 'Success') && (
                 <button onClick={claimAllCampaigns} className="px-6 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                    Claim All Rewards
                 </button>
              )}
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((c) => {
                 let progress = 0;
                 if (c.startTime > 0 && c.status === 'In Progress') {
                    const elapsed = Date.now() - c.startTime;
                    progress = Math.min(100, (elapsed / c.duration) * 100);
                 }

                 return (
                    <div key={c.id} className={`bg-slate-900 border transition-all rounded-3xl p-6 relative overflow-hidden ${c.status === 'Success' ? 'border-emerald-500/30 ring-1 ring-emerald-500/10' : c.status === 'Failed' ? 'border-red-500/30' : 'border-white/5 hover:border-slate-700'}`}>
                       <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                         {c.type === 'War' ? <Swords size={48} /> : 
                          c.type === 'Defense' ? <Shield size={48} /> : <MapIcon size={48} />}
                       </div>
                       
                       <div className="inline-flex items-center gap-2 mb-4">
                         <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded border ${c.type === 'War' ? 'text-red-400 border-red-500/30 bg-red-500/10' : c.type === 'Defense' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-blue-400 border-blue-500/30 bg-blue-500/10'}`}>{c.type}</span>
                         <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Flag size={10} /> {(c.duration / 60000).toFixed(1)}m</span>
                       </div>
                       
                       <h4 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">{c.name}</h4>
                       <div className="flex flex-col gap-2 mb-6">
                          <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase items-center flex gap-1"><Crown size={12}/> Reward: {c.reward}</span>
                          <span className="text-[10px] font-black text-rose-400 tracking-widest uppercase">Target Difficulty: {c.difficulty} PWR</span>
                       </div>

                       {c.status === 'In Progress' && c.startTime > 0 && (
                          <div className="space-y-2">
                             <div className="w-full bg-slate-950 h-2 flex rounded-full overflow-hidden border border-white/5">
                                <div className="bg-indigo-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">In Progress</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{Math.floor(progress)}%</span>
                             </div>
                          </div>
                       )}

                       {c.status === 'Pending' && c.startTime === 0 && (
                          <button onClick={() => setSelectedCampaign(c)} className="w-full py-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                             Select Division to Dispatch
                          </button>
                       )}

                       {c.status === 'Success' && (
                           <div className="space-y-4 text-center">
                              <span className="block text-emerald-500 text-sm font-black uppercase tracking-widest">Victory Configured</span>
                              <button onClick={() => claimCampaign(c.id)} className="w-full py-3 bg-emerald-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                                 Claim Rewards
                              </button>
                           </div>
                       )}

                       {c.status === 'Failed' && (
                           <div className="space-y-4 text-center">
                              <span className="block text-red-500 text-sm font-black uppercase tracking-widest flex justify-center items-center gap-1"><AlertTriangle size={14}/> Campaign Failed</span>
                              <p className="text-[10px] text-slate-400 italic">"{c.failReason}"</p>
                              <button onClick={() => claimCampaign(c.id)} className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                                 Acknowledge Defeat
                              </button>
                           </div>
                       )}
                    </div>
                 );
              })}
              
              {campaigns.length === 0 && (
                  <div className="col-span-3 py-20 text-center border-2 border-slate-800 border-dashed rounded-3xl">
                     <MapIcon size={48} className="mx-auto text-slate-700 mb-4" />
                     <div className="text-sm font-black uppercase tracking-widest text-slate-500">No active operational theaters found.</div>
                     <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2">New campaigns will appear based on scout reports.</p>
                  </div>
              )}
           </div>

           {/* Dispatch Modal UI handled inline for simplicity */}
           <AnimatePresence>
              {selectedCampaign && (
                 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-slate-900 border border-white/10 p-6 sm:p-8 rounded-3xl max-w-lg w-full relative overflow-hidden shadow-2xl"
                    >
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                       <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-2">Deploy Vanguard</h3>
                       <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">Select a division capable of surviving {selectedCampaign.difficulty} PWR threat.</p>
                       
                       <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                          {sortedDivisions.map((div, idx) => {
                             const power = getDivisionPower(div);
                             const isBusy = campaigns.some(c => c.assignedCaptainId === div.captainId && c.status === 'In Progress' && c.startTime > 0);
                             const warning = power < selectedCampaign.difficulty * 0.8;
                             
                             return (
                                <button
                                   key={`${div.captainId}_${idx}`}
                                   disabled={isBusy}
                                   onClick={() => setSelectedCaptainForCampaign(div.captainId)}
                                   className={`w-full text-left flex justify-between items-center p-4 rounded-xl border transition-all ${isBusy ? 'opacity-50 border-white/5 bg-black/20 cursor-not-allowed' : selectedCaptainForCampaign === div.captainId ? 'bg-indigo-500/20 border-indigo-500 shadow-inner' : 'bg-slate-950 border-white/5 hover:border-white/20'}`}
                                >
                                   <div>
                                      <div className="text-sm font-black text-white italic uppercase tracking-tighter">DIV {toRoman(idx + 1)} · {getCaptainName(div.captainId)}</div>
                                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">{div.subordinateIds.length} Subs Assigned</div>
                                   </div>
                                   <div className="text-right">
                                      <div className={`text-xs font-black uppercase tracking-widest ${power >= selectedCampaign.difficulty ? 'text-emerald-400' : 'text-amber-500'}`}>{power} PWR</div>
                                      {warning && <div className="text-[8px] text-rose-500 uppercase font-bold flex items-center gap-1 justify-end mt-1"><AlertTriangle size={10}/> Underpowered</div>}   
                                      {isBusy && <div className="text-[8px] text-slate-500 uppercase font-bold mt-1">Deploying</div>}
                                   </div>
                                </button>
                             );
                          })}
                          {divisions.length === 0 && (
                             <div className="text-xs text-center p-4 text-rose-400 font-bold uppercase tracking-widest">
                                No divisions structured. Assign heroes first.
                             </div>
                          )}
                       </div>

                       <div className="flex gap-4">
                          <button onClick={() => setSelectedCampaign(null)} className="flex-1 py-3 bg-slate-950 border border-white/5 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                          <button 
                             disabled={!selectedCaptainForCampaign}
                             onClick={() => dispatchCampaign(selectedCampaign.id)} 
                             className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!selectedCaptainForCampaign ? 'bg-slate-800 text-slate-600' : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 border border-amber-400'}`}
                          >
                             Commence Order
                          </button>
                       </div>
                    </motion.div>
                 </div>
              )}
           </AnimatePresence>
        </div>
      )}

      {activeTab === 'logs' && (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDivisions.map((div, idx) => {
               const capLogs = logs[div.captainId] || [];
               return (
                  <div key={`${div.captainId}_${idx}`} className="bg-slate-900 border border-white/5 rounded-3xl p-6 max-h-96 flex flex-col relative overflow-hidden group">
                     <div className="absolute -left-6 -top-6 text-slate-800/10 opacity-20 pointer-events-none transition-all group-hover:opacity-30 group-hover:scale-110">
                        <History size={150} />
                     </div>
                     <div className="border-b border-white/5 pb-4 mb-4 relative z-10">
                        <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">DIV {toRoman(idx + 1)} · {getCaptainName(div.captainId)}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Division Log Chronicle</p>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide relative z-10">
                        {capLogs.length === 0 ? (
                           <div className="text-xs text-slate-600 italic">No history recorded yet. Captian is awaiting orders or idle.</div>
                        ) : (
                           capLogs.map((logStr, i) => (
                              <div key={i} className="text-[10px] leading-relaxed border-l-2 border-indigo-500/30 pl-3">
                                 {logStr.includes('WARNING') || logStr.includes('FAILED') ? (
                                    <span className="text-rose-400 font-bold">{logStr}</span>
                                 ) : logStr.includes('Completed') ? (
                                    <span className="text-emerald-400 font-medium">{logStr}</span>
                                 ) : logStr.includes('merit') ? (
                                    <span className="text-amber-500 italic font-semibold">{logStr}</span>
                                 ) : (
                                    <span className="text-slate-400">{logStr}</span>
                                 )}
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               );
            })}
            {divisions.length === 0 && (
               <div className="col-span-3 py-12 text-center text-slate-500 font-black text-sm uppercase tracking-widest">
                  Assign divisions to view their autonomous chronicles.
               </div>
            )}
         </div>
      )}
    </div>
  );
}

