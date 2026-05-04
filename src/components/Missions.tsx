import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Clock, Play, Timer, RefreshCw, Star } from 'lucide-react';
import { PlayerState, PassiveMission } from '../types';
import CharacterAvatar from './CharacterAvatar';

interface MissionsProps {
  player: PlayerState;
  onDeploy: (mission: any) => void;
  onClaimRewards: (id: string) => void;
}

const generateMissions = () => {
  const durations = [1, 2, 5]; // minutes
  return durations.map((mins, i) => {
    const isRare = Math.random() > 0.8;
    const goldReward = mins * (isRare ? 150 : 50) + Math.floor(Math.random() * 20);
    const expReward = mins * (isRare ? 600 : 200);
    const hasLuck = isRare && mins >= 2;
    const luckReward = hasLuck ? Math.floor(Math.random() * 3) + 1 : 0;
    
    return {
      id: `m_${Date.now()}_${i}`,
      name: `Operation ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Zero'][Math.floor(Math.random() * 5)]}-${Math.floor(Math.random() * 100)}`,
      description: isRare ? 'High-risk covert operation.' : 'Standard reconnaissance and foraging.',
      type: 'Exploration' as const,
      duration: 1000 * 60 * mins,
      reward: { exp: expReward, gold: goldReward, luck: luckReward }
    } as Partial<PassiveMission>;
  });
};

export default function MissionsView({ player, onDeploy, onClaimRewards }: MissionsProps) {
  const [availableMissions, setAvailableMissions] = useState<Partial<PassiveMission>[]>([]);
  const [refreshTimer, setRefreshTimer] = useState(600);
  
  useEffect(() => {
    setAvailableMissions(generateMissions());
    const timer = setInterval(() => {
      setRefreshTimer(prev => {
        if (prev <= 1) {
          setAvailableMissions(generateMissions());
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const squadMembers = player.squad || [];
  const activeMissions = player.activeMissions || [];

  const handleDeploy = (mission: Partial<PassiveMission>) => {
    // Basic auto-assignment - first unassigned member
    const assignee = squadMembers.find(m => !activeMissions.some(am => am.assignedCharacterIds.includes(m.id)));
    
    if (!assignee) {
      alert("No available members to deploy!");
      return;
    }

    onDeploy(mission);
    setAvailableMissions(prev => prev.filter(m => m.id !== mission.id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Passive Operations</h2>
          <p className="text-slate-500 text-sm font-medium tracking-wide">Assign idle members to missions to gain rewards over time.</p>
        </div>
        <div className="bg-blue-500/10 px-6 py-3 rounded-2xl border border-blue-500/20 flex items-center gap-4">
           <Activity size={24} className="text-blue-400 animate-pulse" />
           <div className="text-right">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Missions</div>
              <div className="text-2xl font-black text-white">{activeMissions.length} / 3</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
           <div className="flex items-center justify-between mb-4">
               <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.3em]">Available Deployments</h3>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <RefreshCw size={12} className="opacity-50" /> 
                  Refreshes in {Math.floor(refreshTimer / 60)}:{(refreshTimer % 60).toString().padStart(2, '0')}
               </div>
           </div>
           {availableMissions.length === 0 ? (
             <div className="h-64 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600 gap-4">
                 <span className="font-black uppercase tracking-[0.2em] italic">No deployments available</span>
                 <button onClick={() => setAvailableMissions(generateMissions())} className="text-[10px] text-blue-500 uppercase font-black underline">Search for Ops</button>
             </div>
           ) : (
             <div className="grid gap-4">
                {availableMissions.map((mission, i) => (
                  <div key={`${mission.id}_${i}`} className="bg-slate-900 border border-white/5 rounded-3xl p-6 group hover:bg-slate-800 transition-all hover:ring-1 hover:ring-white/10">
                     <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <h4 className="text-xl font-black italic uppercase tracking-tight text-white">{mission.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">{mission.description}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest border border-white/5">
                          <Clock size={12} /> {Math.floor((mission.duration || 0) / 60000)}m
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <div className="flex gap-4">
                           <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">+{mission.reward?.exp} EXP</div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">+{mission.reward?.gold} G</div>
                           {mission.reward?.luck && mission.reward.luck > 0 && (
                             <div className="text-[10px] font-black uppercase tracking-widest text-purple-400">+{mission.reward.luck} LCK</div>
                           )}
                        </div>
                        <button 
                          onClick={() => handleDeploy(mission)}
                          className="px-6 py-2 bg-white text-slate-950 hover:bg-blue-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2 group-hover:shadow-blue-500/10"
                        >
                          <Play size={12} fill="currentColor" /> Deploy Random Squadmember
                        </button>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        <div className="space-y-6">
           <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.3em] mb-4">Active Operations</h3>
           {!activeMissions || activeMissions.length === 0 ? (
             <div className="h-64 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600 gap-4">
                <Timer size={48} className="opacity-10" />
                <span className="font-black uppercase tracking-[0.2em] italic">No active missions in progress</span>
             </div>
           ) : (
             <div className="grid gap-4">
                {activeMissions.map((mission, i) => {
                   const elapsed = Date.now() - mission.startTime;
                   const progress = mission.duration > 0 ? Math.min(100, (elapsed / mission.duration) * 100) : 100;
                   const isDone = progress === 100;
                   
                   return (
                     <div key={`${mission.id}_${i}`} className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                           <div>
                              <h5 className="font-black italic uppercase text-white tracking-widest">{mission.name}</h5>
                              <div className="flex gap-2 mt-2">
                                 {(mission.assignedCharacterIds || []).map((id, cIdx) => {
                                    const char = squadMembers.find(m => m.id === id);
                                    if (!char) return null;
                                    return (
                                       <div key={`${id}_${cIdx}`} className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-lg border border-white/5">
                                          <CharacterAvatar race={char.race} characterClass={char.class} affinity={char.affinity} size="sm" />
                                          <span className="text-[8px] font-black uppercase text-slate-500">{char.name}</span>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                           <span className={`text-[10px] font-black uppercase ${isDone ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                              {isDone ? 'Deployment Complete' : 'In Progress'}
                           </span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progress}%` }}
                             className={`h-full ${isDone ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                           />
                        </div>
                        {isDone && (
                           <button 
                             onClick={() => onClaimRewards(mission.id)}
                             className="w-full py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
                           >
                              Claim Rewards
                           </button>
                        )}
                     </div>
                   );
                })}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
