import React from 'react';
import { motion } from 'motion/react';
import { GameEvent } from '../types';

interface Props {
  event: GameEvent;
  onResolve: (choice: any) => void;
}

export const EventModal: React.FC<Props> = ({ event, onResolve }) => {
  const Icon = event.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className={`bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-2xl w-full shadow-2xl`}
      >
        <div className="flex items-center mb-4">
          {Icon && <Icon className={`w-8 h-8 mr-4 text-${event.color || 'purple-500'}`} />}
          <h2 className="text-3xl font-bold text-white">{event.title}</h2>
        </div>
        <p className="text-slate-300 mb-8 text-lg">{event.description}</p>
        
        <div className="space-y-3">
          {event.choices.map(choice => (
            <button 
              key={choice.id}
              onClick={() => onResolve(choice)}
              className="w-full text-left p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <p className="font-semibold text-white">{choice.label}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
