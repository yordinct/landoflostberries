import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Skull, Users, Heart, Map as MapIcon, Compass, Target, Shield, Coins, AlertCircle, Ghost } from 'lucide-react';
import { PlayerState } from '../types';

export type EventChoice = {
  id: string;
  label: string;
  requirement?: { type: string, value: number, desc: string }; // e.g., { type: 'stat', value: 15, desc: 'Requires 15 CHA' }
  outcome: (player: PlayerState) => { text: string; action?: string; payload?: any };
};

export type ExplorationEvent = {
  id: string;
  type: 'combat' | 'recruit' | 'rescue' | 'village' | 'pet' | 'spirit' | 'treasure' | 'rumor';
  title: string;
  description: string;
  icon: any;
  color: string;
  choices: EventChoice[];
};

interface EventEncounterProps {
  player: PlayerState;
  event: ExplorationEvent;
  onChoiceResult: (outcome: { text: string, action?: string, payload?: any }) => void;
}

export default function EventEncounter({ player, event, onChoiceResult }: EventEncounterProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<{ text: string, action?: string, payload?: any } | null>(null);

  const handleChoice = (choice: EventChoice) => {
    // Check requirement
    if (choice.requirement) {
      if (choice.requirement.type === 'stat') {
         // simple check against player stats
         // Assuming requirement.desc specifies it
      }
    }
    const outcome = choice.outcome(player);
    setSelectedOutcome(outcome);
  };

  const handleComplete = () => {
    onChoiceResult(selectedOutcome!);
  };

  const Icon = event.icon || Compass;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col justify-center max-w-3xl mx-auto py-12">
       <div className={`bg-slate-900 border border-${event.color || 'white/10'} rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-${event.color || 'black'}/20`}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Icon size={120} />
          </div>

          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl bg-${event.color}/20 text-${event.color}`}>
                   <Icon size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">{event.title}</h2>
                   <span className={`text-[10px] font-black uppercase tracking-widest text-${event.color}`}>{event.type} Event</span>
                </div>
             </div>

             {!selectedOutcome ? (
                <>
                  <p className="text-slate-300 mb-8 leading-relaxed font-medium">{event.description}</p>
                  
                  <div className="space-y-3">
                     <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">How will you proceed?</h3>
                     {event.choices.map((c, i) => (
                        <button 
                          key={`${c.id}_${i}`}
                          onClick={() => handleChoice(c)}
                          className="w-full text-left p-4 rounded-xl bg-slate-950 border border-white/5 hover:border-amber-500/50 hover:bg-slate-800 transition-all group flex flex-col gap-2 relative overflow-hidden"
                        >
                           <span className="text-sm font-bold text-white relative z-10">{c.label}</span>
                           {c.requirement && (
                             <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1 relative z-10">
                               <AlertCircle size={10} /> {c.requirement.desc}
                             </span>
                           )}
                           <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                     ))}
                  </div>
                </>
             ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/10 mb-8">
                     <p className="text-amber-500 font-medium leading-relaxed">{selectedOutcome.text}</p>
                  </div>
                  <button 
                    onClick={handleComplete}
                    className={`w-full py-4 text-slate-950 font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95 ${selectedOutcome.action === 'combat' ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'}`}
                  >
                     {selectedOutcome.action === 'combat' ? 'Enter Combat' : 'Continue Journey'}
                  </button>
                </motion.div>
             )}
          </div>
       </div>
    </motion.div>
  );
}
