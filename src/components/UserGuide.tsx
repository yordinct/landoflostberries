import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, Castle, Gem, Hammer, Book, Ghost, Trophy, Sword, 
  Map as MapIcon, Globe, Info, Zap, Sparkles, Brain, Compass, 
  Target, Briefcase, Activity
} from 'lucide-react';

export default function UserGuide() {
  const sections = [
    {
      title: "Resources & Economy",
      icon: Gem,
      color: "text-amber-500",
      content: [
        { label: "Gold", detail: "Primary currency. Earned from combat, missions, and the Market." },
        { label: "Wood, Stone & Food", detail: "Construction materials. Essential for upgrading buildings and recruiting." },
        { label: "Market", detail: "Generates 5 Gold per level every minute while you are online." },
      ]
    },
    {
      title: "Squad & Heroes",
      icon: Users,
      color: "text-blue-500",
      content: [
        { label: "Squad Limits", detail: "The Barracks determines your squad capacity. Upgrade it to bring more heroes into combat." },
        { label: "Active Roles", detail: "Assign roles to heroes to gain global buffs: Workers (+Res), Soldiers (+ATK), Guards (+DEF), Scouts (+Luck)." },
        { label: "Soul Link", detail: "Equip a Spirit/Beast to a Hero to grant stat bonuses based on the beast's power." },
      ]
    },
    {
      title: "Sanctuary & Beasts",
      icon: Ghost,
      color: "text-emerald-500",
      content: [
        { label: "Ancient Shrine", detail: "Allows you to invoke spirits using Gold and Luck. A higher level Shrine increases the maximum number of beasts you can hold (10 per level)." },
        { label: "Invocation Choices", detail: "When summoning, you can Accept the spirit, Sell it for a bounty of gold based on rarity, or Release it safely for some Luck." },
        { label: "Bestiary Fusion", detail: "(Coming Soon) Combine 10 beasts of the same type to ascend their rarity and power." }
      ]
    },
    {
      title: "Geopolitics, The League & Exploration",
      icon: Globe,
      color: "text-purple-500",
      content: [
        { label: "Passive Operations", detail: "Idling operations automatically refresh every 10 minutes. Assign unassigned heroes to complete them." },
        { label: "Recruitment Network", detail: "Use Luck to attract Exploration Discovery heroes, or use Food/Wood to hire Trade Network mercenaries." },
        { label: "The League & Command", detail: "(Coming Soon) Heroes will be able to organize as Captains with their own troops and sub-heroes." },
        { label: "Diplomacy", detail: "(Coming Soon) Form alliances, declare wars, and deploy spies against rival factions." }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">User <span className="text-amber-500">Guide</span></h2>
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Mastering the Land of Lost Berries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-xl bg-slate-800 ${section.color} group-hover:scale-110 transition-transform`}>
                <section.icon size={24} />
              </div>
              <h3 className="text-xl font-black text-white italic">{section.title}</h3>
            </div>
            
            <div className="space-y-4">
              {section.content.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-widest text-amber-500/80">{item.label}</div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 text-center space-y-4">
        <Sparkles className="text-amber-500 mx-auto" size={32} />
        <h3 className="text-xl font-black text-amber-500 italic uppercase">Ancient Advice</h3>
        <p className="text-slate-300 text-sm font-medium max-w-lg mx-auto leading-relaxed italic">
          "The path of the Lost Berries is woven with the threads of destiny. Balance your growth, protect your spirits, and may the Luck of the Shrine guide your blades."
        </p>
      </div>
    </motion.div>
  );
}
