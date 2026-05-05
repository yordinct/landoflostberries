import { Skill, Class, Race } from './types';

export const CLASS_SKILLS: Record<Class, Skill[]> = {
    'Mage': [
        { name: 'Fireball', description: 'Hurls a ball of fire dealing 40 INT-based damage.', manaCost: 20, effect: { type: 'Damage', value: 40, target: 'Enemy' } },
        { name: 'Mana Shield', description: 'Absorbs 50 damage, lasting 3 turns.', manaCost: 15, effect: { type: 'Buff', stat: 'def', value: 50, duration: 3, target: 'Self' } },
    ],
    'Knight': [
        { name: 'Shield Bash', description: 'Deals 25 STR-based damage with a 50% chance to stun.', manaCost: 15, effect: { type: 'Stun', value: 25, duration: 1, target: 'Enemy' } },
        { name: 'Guardian Aura', description: 'Increases Defense of all allies by 15 for 3 turns.', manaCost: 30, effect: { type: 'Buff', stat: 'def', value: 15, duration: 3, target: 'AllAllies' } },
    ],
    'Assassin': [
        { name: 'Backstab', description: 'Deals 50 STR-based damage that ignores 50% of enemy defense.', manaCost: 25, effect: { type: 'Damage', value: 50, target: 'Enemy' } },
        { name: 'Vanish', description: 'Become untargetable for 1 turn.', manaCost: 30, effect: { type: 'Buff', duration: 1, target: 'Self' } },
    ],
    'Healer': [
        { name: 'Major Heal', description: 'Restores 70 HP to a single ally.', manaCost: 25, effect: { type: 'Heal', value: 70, target: 'Ally' } },
        { name: 'Regeneration', description: 'Heals all allies for 20 HP for 3 turns.', manaCost: 40, effect: { type: 'Heal', value: 20, duration: 3, target: 'AllAllies' } },
    ],
    'Spellblade': [
        { name: 'Elemental Strike', description: 'An attack imbued with your elemental affinity, dealing 35 mixed damage.', manaCost: 20, effect: { type: 'Damage', value: 35, target: 'Enemy' } },
        { name: 'Runic Barrier', description: 'Gain defense equal to 50% of your Intelligence for 3 turns.', manaCost: 25, effect: { type: 'Buff', stat: 'def', value: 0, duration: 3, target: 'Self' } },
    ],
    'Beast Tamer': [
        { name: 'Go for the Throat!', description: 'Commands your beast to strike with +20 power.', manaCost: 20, effect: { type: 'Buff', stat: 'str', value: 20, duration: 1, target: 'Self' } },
        { name: 'Pack Tactics', description: 'Increases Speed of all allied beasts and beastkin by 15.', manaCost: 30, effect: { type: 'Buff', stat: 'spd', value: 15, duration: 3, target: 'AllAllies' } },
    ],
    'Summoner': [
        { name: 'Summon Wisp', description: 'Summons a wisp that deals 10 damage each turn.', manaCost: 35, effect: { type: 'Summon', value: 10, duration: 3, target: 'Enemy' } },
        { name: 'Sacrificial Pact', description: 'Sacrifice a summon to heal for 50 HP.', manaCost: 10, effect: { type: 'Heal', value: 50, target: 'Self' } },
    ],
    'Ranger': [
        { name: 'Piercing Shot', description: 'A powerful shot that hits two enemies in a line.', manaCost: 25, effect: { type: 'Damage', value: 40, target: 'Enemy' } },
        { name: 'Bear Trap', description: 'Lays a trap that stuns the next enemy to attack you.', manaCost: 20, effect: { type: 'Stun', duration: 1, target: 'Self' } },
    ],
    'Alchemist': [
        { name: 'Acid Vial', description: 'Throws acid that reduces an enemy\'s defense by 30% for 3 turns.', manaCost: 20, effect: { type: 'Debuff', stat: 'def', value: 30, duration: 3, target: 'Enemy' } },
        { name: 'Healing Draught', description: 'Tosses a healing potion to an ally, restoring 50 HP.', manaCost: 20, effect: { type: 'Heal', value: 50, target: 'Ally' } },
    ],
    'Necromancer': [
        { name: 'Raise Zombie', description: 'Raises a defeated enemy to fight for you with 50% stats.', manaCost: 50, effect: { type: 'Summon', target: 'Self' } },
        { name: 'Death Coil', description: 'Deals 30 shadow damage to an enemy or heals an undead ally for 30.', manaCost: 20, effect: { type: 'Damage', value: 30, target: 'Enemy' } },
    ],
    'Royal Strategist': [
        { name: 'Maneuver', description: 'Allows an ally to immediately take their turn.', manaCost: 40, effect: { type: 'Buff', target: 'Ally' } },
        { name: 'Master Plan', description: 'Increases the STR and INT of all allies by 10 for 3 turns.', manaCost: 50, effect: { type: 'Buff', stat: 'str', value: 10, duration: 3, target: 'AllAllies' } },
    ]
};

export const RACE_ABILITIES: Record<Race, Skill> = {
    'Human': { name: 'Rally', description: 'Slightly increases the attack of all allies for 3 turns.', manaCost: 20, effect: { type: 'Buff', stat: 'str', value: 5, duration: 3, target: 'AllAllies' } },
    'Elf': { name: 'Meditate', description: 'Restores a small amount of mana.', manaCost: 0, effect: { type: 'Heal', value: 20, target: 'Self' } },
    'Dark Elf': { name: 'Shadow Cloak', description: 'Temporarily increases evasion.', manaCost: 15, effect: { type: 'Buff', stat: 'spd', value: 20, duration: 2, target: 'Self' } },
    'Beastkin': { name: 'Primal Roar', description: 'Lets out a roar that may stun enemies.', manaCost: 20, effect: { type: 'Stun', value: 15, duration: 1, target: 'AllEnemies' } },
    'Dragonborn': { name: 'Dragon Breath', description: 'Breathes fire, damaging an enemy.', manaCost: 30, effect: { type: 'Damage', value: 45, target: 'Enemy' } },
    'Fairy-blooded': { name: 'Fairy Dust', description: 'Heals a small amount of HP for all allies.', manaCost: 25, effect: { type: 'Heal', value: 15, target: 'AllAllies' } },
    'Dwarf': { name: 'Fortify', description: 'Greatly increases own defense for one turn.', manaCost: 15, effect: { type: 'Buff', stat: 'def', value: 30, duration: 1, target: 'Self' } },
    'Celestial': { name: 'Divine Blessing', description: 'Cures all negative status effects from allies.', manaCost: 30, effect: { type: 'Buff', target: 'AllAllies' } },
    'Demonkin': { name: 'Sacrifice', description: 'Sacrifice some HP to deal massive damage.', manaCost: 10, effect: { type: 'Damage', value: 60, target: 'Enemy' } },
    'Ancient Bloodline': { name: 'Adapt', description: 'Copies the elemental affinity of a target.', manaCost: 40, effect: { type: 'Buff', target: 'Self' } }
};
