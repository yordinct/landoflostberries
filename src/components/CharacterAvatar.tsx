import React from 'react';
import { motion } from 'motion/react';
import { Race, Class, Element } from '../types';
import { RACE_VISUALS, CLASS_VISUALS, ELEMENT_VISUALS } from '../constants';

interface CharacterAvatarProps {
  race: Race;
  characterClass: Class;
  affinity: Element;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function CharacterAvatar({ race, characterClass, affinity, size = 'md', className = '' }: CharacterAvatarProps) {
  const raceVisual = RACE_VISUALS[race];
  const classVisual = CLASS_VISUALS[characterClass];
  const elementVisual = ELEMENT_VISUALS[affinity];
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-64 h-80'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 48,
    xl: 80
  };

  const ClassIcon = classVisual.icon;
  const ElementIcon = elementVisual.icon;

  return (
    <div className={`relative ${sizeClasses[size]} rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 group ${className}`}>
      {/* Background Image (Race Based) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${raceVisual.bg})` }}
      >
        <div className="absolute inset-0 bg-slate-950/40 mix-blend-multiply" />
      </div>

      {/* Layered Gradients (Affinity Based) */}
      <div className={`absolute inset-0 opacity-40 mix-blend-overlay animate-pulse bg-gradient-to-br transition-colors duration-1000 ${elementVisual.color.replace('text-', 'bg-')}`} />
      
      {/* Visual Accents */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

      {/* Main Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          {/* Class Icon */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-xl">
             <ClassIcon size={iconSizes[size]} className="text-white drop-shadow-lg" />
          </div>
          
          {/* Element Floating Icon */}
          <motion.div 
            animate={{ 
              y: [-2, 2, -2],
              x: [-1, 1, -1]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
            className={`absolute -top-2 -right-2 bg-slate-900 rounded-full p-1.5 border border-white/10 shadow-lg ${elementVisual.color}`}
          >
             <ElementIcon size={iconSizes[size] / 2} />
          </motion.div>
        </motion.div>

        {size === 'xl' && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center"
          >
             <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/10 text-white mb-2`}>
               {race}
             </div>
             <div className="text-2xl font-black italic uppercase tracking-tighter text-white">
               {characterClass}
             </div>
          </motion.div>
        )}
      </div>

      {/* Gloss Effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-50" />
    </div>
  );
}
