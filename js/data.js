/* ============================================================
   PHANTASIE III - GAME DATA
   Static definitions: races, classes, spells, items, enemies, maps
   ============================================================ */

const DATA = {

  /* ==========================================================
     RACES
     ========================================================== */
  races: [
    {
      id: 'human', name: 'Human',
      desc: 'Versatile and adaptable. No restrictions on class.',
      statBonus: { str: 0, dex: 0, con: 0, int: 0, cha: 1 },
      availableClasses: ['fighter','priest','wizard','monk','ranger','thief'],
      beast: false
    },
    {
      id: 'elf', name: 'Elf',
      desc: 'Agile and intelligent. Natural spellcasters.',
      statBonus: { str: -1, dex: 2, con: -1, int: 2, cha: 1 },
      availableClasses: ['fighter','wizard','ranger','thief'],
      beast: false
    },
    {
      id: 'dwarf', name: 'Dwarf',
      desc: 'Hardy and strong. Resistant to magic.',
      statBonus: { str: 2, dex: -1, con: 3, int: -1, cha: -1 },
      availableClasses: ['fighter','priest','thief'],
      beast: false
    },
    {
      id: 'gnome', name: 'Gnome',
      desc: 'Small but clever. Skilled in trickery.',
      statBonus: { str: -1, dex: 1, con: 1, int: 2, cha: 0 },
      availableClasses: ['fighter','wizard','thief','monk'],
      beast: false
    },
    {
      id: 'halfling', name: 'Halfling',
      desc: 'Quick and stealthy. Expert thieves.',
      statBonus: { str: -2, dex: 3, con: 1, int: 0, cha: 2 },
      availableClasses: ['fighter','thief','ranger'],
      beast: false
    },
    {
      id: 'orc', name: 'Orc',
      desc: 'Brutish and powerful. Feared warriors.',
      statBonus: { str: 4, dex: -2, con: 2, int: -3, cha: -3 },
      availableClasses: ['fighter','thief'],
      beast: true
    },
    {
      id: 'troll', name: 'Troll',
      desc: 'Massive and regenerating. Almost unstoppable in battle.',
      statBonus: { str: 5, dex: -3, con: 4, int: -4, cha: -4 },
      availableClasses: ['fighter'],
      beast: true
    },
    {
      id: 'gnoll', name: 'Gnoll',
      desc: 'Savage hyena-men. Ferocious fighters.',
      statBonus: { str: 3, dex: 1, con: 2, int: -2, cha: -3 },
      availableClasses: ['fighter','thief'],
      beast: true
    },
    {
      id: 'goblin', name: 'Goblin',
      desc: 'Small but cunning. Skilled at ambushes.',
      statBonus: { str: -1, dex: 3, con: -1, int: 0, cha: -2 },
      availableClasses: ['fighter','thief'],
      beast: true
    },
    {
      id: 'minotaur', name: 'Minotaur',
      desc: 'Half-man, half-bull. Fearsome in melee.',
      statBonus: { str: 5, dex: -1, con: 3, int: -3, cha: -4 },
      availableClasses: ['fighter'],
      beast: true
    }
  ],

  /* ==========================================================
     CLASSES
     ========================================================== */
  classes: [
    {
      id: 'fighter', name: 'Fighter',
      desc: 'Master of melee combat. High HP and attack power.',
      hpDie: 10, mpDie: 0,
      hitBonus: 3, acBonus: 0,
      goldMult: 1.0, trainCost: 100,
      startSpells: [],
      classSpells: []
    },
    {
      id: 'priest', name: 'Priest',
      desc: 'Holy warrior. Heals allies and smites undead.',
      hpDie: 8, mpDie: 6,
      hitBonus: 1, acBonus: 0,
      goldMult: 1.2, trainCost: 120,
      startSpells: ['cure1', 'holyword'],
      classSpells: ['cure1','cure2','cure3','cure4','holyword','bless','raise','dispel']
    },
    {
      id: 'wizard', name: 'Wizard',
      desc: 'Powerful mage. Devastating offensive magic.',
      hpDie: 4, mpDie: 10,
      hitBonus: 0, acBonus: 0,
      goldMult: 1.5, trainCost: 150,
      startSpells: ['fireflash1', 'weakspot'],
      classSpells: ['fireflash1','fireflash2','fireflash3','mindblast1','mindblast2','weakness1','weakness2','weakness3','confusion','lightning','icestorm','fireball','summon','teleport']
    },
    {
      id: 'monk', name: 'Monk',
      desc: 'Disciplined fighter. Can fight without weapons.',
      hpDie: 8, mpDie: 4,
      hitBonus: 2, acBonus: 2,
      goldMult: 0.8, trainCost: 100,
      startSpells: ['meditate'],
      classSpells: ['meditate','mindblock','bless','cure1']
    },
    {
      id: 'ranger', name: 'Ranger',
      desc: 'Skilled tracker and archer. Effective at range.',
      hpDie: 8, mpDie: 4,
      hitBonus: 2, acBonus: 0,
      goldMult: 1.0, trainCost: 110,
      startSpells: ['track'],
      classSpells: ['track','camouflage','cure1','fireflash1']
    },
    {
      id: 'thief', name: 'Thief',
      desc: 'Expert at stealth and disarming traps.',
      hpDie: 6, mpDie: 2,
      hitBonus: 1, acBonus: 1,
      goldMult: 1.3, trainCost: 90,
      startSpells: ['steal'],
      classSpells: ['steal','hide','picklock','detect']
    }
  ],

  /* ==========================================================
     SOCIAL CLASSES
     ========================================================== */
  socialClasses: [
    { id: 'peasant',   name: 'Peasant',   goldPerLevel: 20 },
    { id: 'laborer',   name: 'Laborer',   goldPerLevel: 40 },
    { id: 'craftsman', name: 'Craftsman', goldPerLevel: 80 },
    { id: 'noble',     name: 'Noble',     goldPerLevel: 150 }
  ],

  /* ==========================================================
     SPELLS
     ========================================================== */
  spells: [
    // --- Healing ---
    { id: 'cure1', name: 'Cure Light', cat: 'healing', mp: 3, level: 1,
      desc: 'Restores 1-8 HP to one ally.',
      effect: (caster, target) => ({ type: 'heal', amount: roll(1,8) + 2 }) },
    { id: 'cure2', name: 'Cure Moderate', cat: 'healing', mp: 6, level: 3,
      desc: 'Restores 2-16 HP to one ally.',
      effect: (caster, target) => ({ type: 'heal', amount: roll(2,8) + 4 }) },
    { id: 'cure3', name: 'Cure Serious', cat: 'healing', mp: 10, level: 5,
      desc: 'Restores 3-24 HP to one ally.',
      effect: (caster, target) => ({ type: 'heal', amount: roll(3,8) + 8 }) },
    { id: 'cure4', name: 'Cure Critical', cat: 'healing', mp: 16, level: 7,
      desc: 'Restores massive HP to one ally.',
      effect: (caster, target) => ({ type: 'heal', amount: roll(5,8) + 15 }) },
    { id: 'raise', name: 'Raise Dead', cat: 'healing', mp: 25, level: 9,
      desc: 'Revives a slain party member with 1 HP.',
      effect: (caster, target) => ({ type: 'raise', amount: 1 }) },

    // --- Combat Offensive ---
    { id: 'fireflash1', name: 'Fireflash I', cat: 'combat', mp: 4, level: 1,
      desc: 'Hurls a bolt of fire at one enemy. 3-18 damage.',
      effect: (caster, target) => ({ type: 'damage', amount: roll(3,6) + caster.level }) },
    { id: 'fireflash2', name: 'Fireflash II', cat: 'combat', mp: 8, level: 3,
      desc: 'Intense fireball at one enemy. 5-30 damage.',
      effect: (caster, target) => ({ type: 'damage', amount: roll(5,6) + caster.level * 2 }) },
    { id: 'fireflash3', name: 'Fireflash III', cat: 'combat', mp: 14, level: 6,
      desc: 'Massive inferno. 8-48 damage to all enemies.',
      effect: (caster, target) => ({ type: 'damage_all', amount: roll(8,6) + caster.level * 3 }) },
    { id: 'mindblast1', name: 'Mindblast I', cat: 'combat', mp: 5, level: 2,
      desc: 'Psychic assault on one enemy. 4-24 damage.',
      effect: (caster, target) => ({ type: 'damage', amount: roll(4,6) + caster.int }) },
    { id: 'mindblast2', name: 'Mindblast II', cat: 'combat', mp: 10, level: 5,
      desc: 'Devastating mental attack. 7-42 damage.',
      effect: (caster, target) => ({ type: 'damage', amount: roll(7,6) + caster.int * 2 }) },
    { id: 'lightning', name: 'Lightning', cat: 'combat', mp: 12, level: 4,
      desc: 'Chain lightning hits all enemies for 5-30 damage.',
      effect: (caster, target) => ({ type: 'damage_all', amount: roll(5,6) + caster.level * 2 }) },
    { id: 'icestorm', name: 'Ice Storm', cat: 'combat', mp: 10, level: 4,
      desc: 'Freezing blizzard. 6-36 damage, may slow enemies.',
      effect: (caster, target) => ({ type: 'damage', amount: roll(6,6) + 5, status: 'slowed' }) },
    { id: 'fireball', name: 'Fireball', cat: 'combat', mp: 18, level: 7,
      desc: 'Explosive fireball hits all enemies for 10-60 damage.',
      effect: (caster, target) => ({ type: 'damage_all', amount: roll(10,6) + caster.level * 4 }) },

    // --- Debuff/Status ---
    { id: 'weakness1', name: 'Weakness I', cat: 'combat', mp: 5, level: 2,
      desc: 'Weakens one enemy, reducing its attack power.',
      effect: (caster, target) => ({ type: 'status', status: 'weak1' }) },
    { id: 'weakness2', name: 'Weakness II', cat: 'combat', mp: 8, level: 4,
      desc: 'Severely weakens one enemy.',
      effect: (caster, target) => ({ type: 'status', status: 'weak2' }) },
    { id: 'weakness3', name: 'Weakness III', cat: 'combat', mp: 12, level: 6,
      desc: 'Completely saps enemy strength.',
      effect: (caster, target) => ({ type: 'status', status: 'weak3' }) },
    { id: 'confusion', name: 'Confusion', cat: 'combat', mp: 9, level: 4,
      desc: 'Confuses an enemy, causing erratic behavior.',
      effect: (caster, target) => ({ type: 'status', status: 'confused' }) },
    { id: 'weakspot', name: 'Detect Weakness', cat: 'combat', mp: 3, level: 1,
      desc: 'Reveals enemy weakness, increasing party attack.',
      effect: (caster, target) => ({ type: 'party_buff', stat: 'hitBonus', amount: 2 }) },

    // --- Buff ---
    { id: 'bless', name: 'Bless', cat: 'combat', mp: 6, level: 2,
      desc: 'Blesses entire party, +2 to attacks for 3 turns.',
      effect: (caster, target) => ({ type: 'party_buff', stat: 'hitBonus', amount: 2, turns: 3 }) },
    { id: 'meditate', name: 'Meditate', cat: 'healing', mp: 4, level: 1,
      desc: 'Restores 2-12 MP to caster.',
      effect: (caster, target) => ({ type: 'restore_mp', amount: roll(2,6) }) },
    { id: 'mindblock', name: 'Mind Block', cat: 'combat', mp: 6, level: 3,
      desc: 'Protects caster from mental attacks.',
      effect: (caster, target) => ({ type: 'self_buff', stat: 'magicResist', amount: 50, turns: 5 }) },

    // --- Special/Utility ---
    { id: 'dispel', name: 'Dispel Magic', cat: 'combat', mp: 8, level: 3,
      desc: 'Removes all magical effects from target.',
      effect: (caster, target) => ({ type: 'dispel' }) },
    { id: 'holyword', name: 'Holy Word', cat: 'combat', mp: 12, level: 4,
      desc: 'Devastates undead creatures. 20-80 damage to undead.',
      effect: (caster, target) => {
        if (target && target.type === 'undead') return { type: 'damage', amount: roll(10,8) };
        return { type: 'damage', amount: roll(2,6) };
      }
    },
    { id: 'summon', name: 'Summon Elemental', cat: 'combat', mp: 20, level: 8,
      desc: 'Summons an elemental ally to fight alongside the party.',
      effect: (caster, target) => ({ type: 'summon', summonId: 'elemental' }) },
    { id: 'teleport', name: 'Teleport', cat: 'combat', mp: 15, level: 6,
      desc: 'Instantly escapes from combat.',
      effect: (caster, target) => ({ type: 'flee_success' }) },
    { id: 'track', name: 'Track', cat: 'dungeon', mp: 3, level: 1,
      desc: 'Reveals nearby enemies on the dungeon map.',
      effect: (caster, target) => ({ type: 'reveal_map', radius: 5 }) },
    { id: 'camouflage', name: 'Camouflage', cat: 'dungeon', mp: 5, level: 2,
      desc: 'Reduces random encounter rate for several steps.',
      effect: (caster, target) => ({ type: 'reduce_encounters', turns: 10 }) },
    { id: 'steal', name: 'Steal', cat: 'combat', mp: 3, level: 1,
      desc: 'Attempts to steal gold from an enemy.',
      effect: (caster, target) => ({ type: 'steal', amount: roll(5,10) }) },
    { id: 'hide', name: 'Hide in Shadows', cat: 'combat', mp: 4, level: 2,
      desc: 'Hides thief, preventing targeting for one turn.',
      effect: (caster, target) => ({ type: 'self_buff', stat: 'hidden', amount: 1, turns: 1 }) },
    { id: 'picklock', name: 'Pick Lock', cat: 'dungeon', mp: 2, level: 1,
      desc: 'Opens locked doors and chests.',
      effect: (caster, target) => ({ type: 'open_lock' }) },
    { id: 'detect', name: 'Detect Traps', cat: 'dungeon', mp: 3, level: 1,
      desc: 'Reveals hidden traps nearby.',
      effect: (caster, target) => ({ type: 'reveal_traps' }) }
  ],

  /* ==========================================================
     WEAPONS
     ========================================================== */
  weapons: [
    { id: 'fists',     name: 'Bare Hands', damage: '1d3',  strReq: 0,  price: 0,   aug: 0 },
    { id: 'dagger',    name: 'Dagger',     damage: '1d4',  strReq: 4,  price: 20,  aug: 0 },
    { id: 'shortsw',   name: 'Short Sword',damage: '1d6',  strReq: 7,  price: 60,  aug: 0 },
    { id: 'mace',      name: 'Mace',       damage: '1d6+1',strReq: 8,  price: 80,  aug: 0 },
    { id: 'staff',     name: 'Staff',      damage: '1d6',  strReq: 6,  price: 40,  aug: 0 },
    { id: 'longsw',    name: 'Long Sword', damage: '1d8',  strReq: 10, price: 150, aug: 0 },
    { id: 'battleaxe', name: 'Battle Axe', damage: '1d8+2',strReq: 13, price: 200, aug: 0 },
    { id: 'flail',     name: 'Flail',      damage: '1d8+1',strReq: 12, price: 180, aug: 0 },
    { id: 'greatsw',   name: 'Great Sword',damage: '2d6',  strReq: 16, price: 350, aug: 0 },
    { id: 'warhammer', name: 'War Hammer', damage: '2d6+1',strReq: 17, price: 400, aug: 0 },
    { id: 'halberd',   name: 'Halberd',    damage: '2d8',  strReq: 18, price: 600, aug: 0 },
    // Magic weapons
    { id: 'mgdagger',  name: 'Magic Dagger',   damage: '1d4+3', strReq: 3, price: 300,  aug: 3 },
    { id: 'mgsword',   name: 'Magic Sword',    damage: '1d8+3', strReq: 8, price: 600,  aug: 3 },
    { id: 'mace2',     name: 'Silver Mace',    damage: '1d6+4', strReq: 7, price: 500,  aug: 4 },
    { id: 'vorpal',    name: 'Vorpal Blade',   damage: '2d6+5', strReq: 12,price: 2000, aug: 5 }
  ],

  /* ==========================================================
     ARMOR
     ========================================================== */
  armors: [
    { id: 'none',      name: 'None',          ac: 0,  strReq: 0,  price: 0    },
    { id: 'cloth',     name: 'Cloth',         ac: 1,  strReq: 0,  price: 10   },
    { id: 'leather',   name: 'Leather',       ac: 3,  strReq: 5,  price: 80   },
    { id: 'studded',   name: 'Studded Leather',ac: 4, strReq: 7,  price: 150  },
    { id: 'ringmail',  name: 'Ring Mail',     ac: 5,  strReq: 10, price: 250  },
    { id: 'chainmail', name: 'Chain Mail',    ac: 7,  strReq: 13, price: 400  },
    { id: 'scalemail', name: 'Scale Mail',    ac: 8,  strReq: 14, price: 550  },
    { id: 'platemail', name: 'Plate Mail',    ac: 10, strReq: 17, price: 900  },
    { id: 'fullplate', name: 'Full Plate',    ac: 12, strReq: 18, price: 1500 },
    // Magic armor
    { id: 'mgchain',   name: 'Chain +2',      ac: 9,  strReq: 11, price: 800  },
    { id: 'mgplate',   name: 'Plate +3',      ac: 13, strReq: 15, price: 2000 },
    { id: 'dragonscale',name: 'Dragon Scale', ac: 15, strReq: 14, price: 5000 }
  ],

  /* ==========================================================
     SHIELDS
     ========================================================== */
  shields: [
    { id: 'none',      name: 'None',          ac: 0, strReq: 0,  price: 0   },
    { id: 'buckler',   name: 'Buckler',       ac: 1, strReq: 5,  price: 50  },
    { id: 'smallshld', name: 'Small Shield',  ac: 2, strReq: 8,  price: 120 },
    { id: 'largeshld', name: 'Large Shield',  ac: 3, strReq: 11, price: 250 },
    { id: 'towershld', name: 'Tower Shield',  ac: 4, strReq: 15, price: 500 },
    { id: 'mgshld',    name: 'Magic Shield',  ac: 5, strReq: 10, price: 1000}
  ],

  /* ==========================================================
     POTIONS (items)
     ========================================================== */
  potions: [
    { id: 'pot_hp1',  name: 'Healing Potion',       price: 50,  desc: 'Restores 2-12 HP.',        effect: { type: 'heal', amount: [2,6] } },
    { id: 'pot_hp2',  name: 'Strong Healing Potion', price: 150, desc: 'Restores 5-30 HP.',        effect: { type: 'heal', amount: [5,6] } },
    { id: 'pot_mp1',  name: 'Mana Potion',           price: 80,  desc: 'Restores 2-12 MP.',        effect: { type: 'restore_mp', amount: [2,6] } },
    { id: 'pot_str',  name: 'Strength Elixir',       price: 200, desc: '+2 STR for current battle.',effect: { type: 'buff', stat: 'str', amount: 2 } },
    { id: 'pot_antidote', name: 'Antidote',          price: 30,  desc: 'Cures poison.',             effect: { type: 'cure_status', status: 'poisoned' } },
    { id: 'pot_revive',  name: 'Phoenix Down',       price: 300, desc: 'Revives fallen ally.',      effect: { type: 'raise', amount: 5 } }
  ],

  /* ==========================================================
     ENEMY TYPES
     ========================================================== */
  enemies: [
    // Early game
    { id: 'goblin',    name: 'Goblin',       hp: [1,6],   str: 5,  dex: 8,  ac: 2,  dmg: '1d4',  xp: 10,  gold: [1,8],  type: 'normal', rank: 'front' },
    { id: 'orc',       name: 'Orc',          hp: [2,8],   str: 10, dex: 6,  ac: 4,  dmg: '1d6',  xp: 20,  gold: [2,8],  type: 'normal', rank: 'front' },
    { id: 'wolf',      name: 'Wolf',         hp: [2,6],   str: 9,  dex: 12, ac: 3,  dmg: '1d6',  xp: 15,  gold: [0,4],  type: 'beast',  rank: 'front' },
    { id: 'skeleton',  name: 'Skeleton',     hp: [1,8],   str: 8,  dex: 7,  ac: 5,  dmg: '1d6',  xp: 18,  gold: [0,6],  type: 'undead', rank: 'front' },
    { id: 'bandit',    name: 'Bandit',        hp: [2,8],   str: 9,  dex: 9,  ac: 3,  dmg: '1d6',  xp: 25,  gold: [3,10], type: 'human',  rank: 'front' },
    { id: 'giant_rat', name: 'Giant Rat',    hp: [1,4],   str: 4,  dex: 14, ac: 2,  dmg: '1d4',  xp: 8,   gold: [0,2],  type: 'beast',  rank: 'front' },

    // Mid game
    { id: 'troll',     name: 'Troll',        hp: [4,10],  str: 16, dex: 8,  ac: 6,  dmg: '2d6',  xp: 80,  gold: [5,20], type: 'beast',  rank: 'front',
      special: 'regenerate' },
    { id: 'zombie',    name: 'Zombie',       hp: [3,8],   str: 12, dex: 4,  ac: 5,  dmg: '1d8',  xp: 40,  gold: [0,8],  type: 'undead', rank: 'front' },
    { id: 'gnoll',     name: 'Gnoll',        hp: [3,8],   str: 13, dex: 9,  ac: 5,  dmg: '1d8',  xp: 50,  gold: [4,12], type: 'normal', rank: 'front' },
    { id: 'ogre',      name: 'Ogre',         hp: [5,10],  str: 17, dex: 5,  ac: 4,  dmg: '2d6+2',xp: 100, gold: [8,30], type: 'giant',  rank: 'front' },
    { id: 'minotaur',  name: 'Minotaur',     hp: [6,10],  str: 18, dex: 8,  ac: 6,  dmg: '2d8',  xp: 150, gold: [10,40],type: 'beast',  rank: 'front' },
    { id: 'wizard_e',  name: 'Dark Wizard',  hp: [2,8],   str: 6,  dex: 12, ac: 3,  dmg: '2d8',  xp: 120, gold: [10,30],type: 'human',  rank: 'rear',
      spells: ['fireflash1','weakness1'] },
    { id: 'vampire',   name: 'Vampire',      hp: [5,10],  str: 16, dex: 14, ac: 7,  dmg: '1d8',  xp: 200, gold: [20,50],type: 'undead', rank: 'front',
      special: 'drain_hp' },

    // Late game
    { id: 'dragon',    name: 'Dragon',       hp: [8,12],  str: 20, dex: 10, ac: 12, dmg: '3d10', xp: 500, gold: [50,200],type: 'dragon', rank: 'front',
      special: 'breathe_fire' },
    { id: 'lich',      name: 'Lich',         hp: [6,10],  str: 10, dex: 14, ac: 10, dmg: '3d8',  xp: 600, gold: [40,150],type: 'undead', rank: 'rear',
      spells: ['fireflash3','weakness3','confusion'] },
    { id: 'demon',     name: 'Demon',        hp: [7,12],  str: 18, dex: 12, ac: 11, dmg: '2d10', xp: 450, gold: [30,100],type: 'demon',  rank: 'front' },
    { id: 'specter',   name: 'Specter',      hp: [4,8],   str: 14, dex: 16, ac: 8,  dmg: '2d6',  xp: 300, gold: [15,60], type: 'undead', rank: 'front',
      special: 'phase' },
    { id: 'golem',     name: 'Stone Golem',  hp: [10,12], str: 20, dex: 3,  ac: 14, dmg: '3d8',  xp: 400, gold: [0,50],  type: 'construct', rank: 'front' },
    { id: 'dark_knight',name: 'Dark Knight', hp: [6,10],  str: 17, dex: 12, ac: 10, dmg: '2d8+3',xp: 350, gold: [30,80], type: 'human',  rank: 'front' },
    { id: 'demon_lord', name: 'Demon Lord',  hp: [12,12], str: 22, dex: 14, ac: 14, dmg: '3d10', xp: 1000,gold: [100,400],type: 'demon', rank: 'front' },

    // Final Boss
    {
      id: 'nikademus', name: 'Nikademus the Dark',
      hp: [20, 10], str: 25, dex: 18, ac: 18, dmg: '4d10+5',
      xp: 5000, gold: [500,1000], type: 'demon', rank: 'rear',
      spells: ['fireflash3','mindblast2','weakness3','confusion','lightning'],
      special: 'final_boss',
      desc: 'The dark lord himself. Ancient and terrible.'
    }
  ],

  /* ==========================================================
     DUNGEON ENCOUNTER TABLES
     ========================================================== */
  dungeonEncounters: {
    // Giant Caves (floor 1-5)
    giant_caves: {
      1: ['goblin','wolf','giant_rat','orc','bandit'],
      2: ['orc','bandit','wolf','goblin','skeleton'],
      3: ['gnoll','zombie','orc','skeleton','wizard_e'],
      4: ['gnoll','ogre','zombie','vampire','wizard_e'],
      5: ['ogre','troll','vampire','demon','dragon']
    },
    // Dwarven Burial Grounds
    dwarven_burial: {
      1: ['skeleton','zombie','goblin','orc','bandit'],
      2: ['zombie','skeleton','gnoll','wizard_e','vampire'],
      3: ['vampire','zombie','lich','demon','specter'],
      4: ['lich','specter','demon','vampire','dark_knight'],
      5: ['lich','demon_lord','golem','dark_knight','demon']
    },
    // Nikademus's Castle
    nikademus_castle: {
      1: ['dark_knight','demon','lich','golem','specter'],
      2: ['demon','dark_knight','lich','golem','dragon'],
      3: ['demon_lord','dragon','lich','golem','dark_knight'],
      4: ['demon_lord','dragon','demon','golem','specter'],
      5: ['nikademus'] // Final boss
    }
  },

  /* ==========================================================
     OVERWORLD MAP  (25 wide × 20 tall)
     Tile codes:
       .  = plains/grass
       f  = forest
       ^  = mountain
       ~  = water
       =  = road
       T  = town
       D  = dungeon entrance
       P  = plains (open)
     ========================================================== */
  overworldMap: [
    // Row 0
    '~~~~~~~~~~~~~~~~~~~~~~~~~~',
    '~.....f.....^^^^^........~',
    '~..T..f....^^..^.....T...~',
    '~.....f....^...^.........~',
    '~....fff...^...^..fff....~',
    '~....fff...^...^..fff.D..~',
    '~....fff....^^^....ff....~',
    '~=====.....P.P.....=====.~',
    '~.....T....P.P....T......~',
    '~.....P....P.P...........~',
    '~....PP....P.P....PPP....~',
    '~...PPP.....P......PP....~',
    '~...PP....P.P......P.D...~',
    '~....P....P.P............~',
    '~....f.....P.....fff.....~',
    '~T...f.....P.....fff...T.~',
    '~....f.....P.....fff.....~',
    '~.....D....=====.........~',
    '~...........P.T..........~',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~'
  ],

  /* ==========================================================
     TOWN DEFINITIONS
     ========================================================== */
  towns: [
    { id: 'pendragon',  name: 'Pendragon',   x: 2,  y: 2,  desc: 'The seat of the realm. A bastion of hope against Nikademus.' },
    { id: 'stonehaven', name: 'Stonehaven',  x: 22, y: 2,  desc: 'A dwarven trading post carved into the mountainside.' },
    { id: 'ashford',    name: 'Ashford',     x: 6,  y: 8,  desc: 'A farming village on the ancient road.' },
    { id: 'grimport',   name: 'Grimport',    x: 17, y: 8,  desc: 'A gloomy port town. Rumors abound of dark dealings.' },
    { id: 'nethergate', name: 'Nethergate',  x: 18, y: 18, desc: 'A forsaken village near the entrance to the Netherworld.' },
    { id: 'lighthouse', name: 'Lighthouse',  x: 1,  y: 15, desc: 'A lonely lighthouse keeper offers refuge to weary travelers.' },
    { id: 'eastwatch',  name: 'Eastwatch',   x: 23, y: 15, desc: 'A military outpost watching the eastern passes.' }
  ],

  /* ==========================================================
     DUNGEON DEFINITIONS
     ========================================================== */
  dungeons: [
    {
      id: 'giant_caves',
      name: 'Giant Caves',
      x: 22, y: 5,
      floors: 5,
      desc: 'Ancient caverns inhabited by brutish giants and their minions.',
      questItem: 'giant_eye',
      questItemFloor: 3
    },
    {
      id: 'dwarven_burial',
      name: 'Dwarven Burial Grounds',
      x: 23, y: 12,
      floors: 5,
      desc: 'The sacred tombs of the dwarven ancestors, now defiled by undead.',
      questItem: 'dwarven_rune',
      questItemFloor: 4
    },
    {
      id: 'nikademus_castle',
      name: "Nikademus's Castle",
      x: 18, y: 17,
      floors: 5,
      desc: 'The dark fortress of Nikademus. Evil radiates from its black towers.',
      questItem: null,
      questItemFloor: null,
      requiresItems: ['giant_eye', 'dwarven_rune', 'light_crystal', 'dark_shard']
    }
  ],

  /* ==========================================================
     QUEST ITEMS
     ========================================================== */
  questItems: [
    { id: 'giant_eye',     name: "Giant's Eye",       desc: 'A massive crystalline eye that sees through illusions.' },
    { id: 'dwarven_rune',  name: 'Dwarven Rune Stone', desc: 'An ancient rune granting power over stone and earth.' },
    { id: 'light_crystal', name: 'Crystal of Light',  desc: 'A shard of pure light from the Plane of Light.' },
    { id: 'dark_shard',    name: 'Shard of Darkness',  desc: 'A fragment of pure darkness from the Plane of Dark.' }
  ],

  /* ==========================================================
     MYSTIC MESSAGES (quest hints)
     ========================================================== */
  mysticMessages: [
    'The darkness spreads across Scandor. Nikademus grows stronger each day.',
    'Seek the four relics scattered across the land. Only with them can you breach Nikademus\'s fortress.',
    'In the Giant Caves lies an eye that pierces all deceptions.',
    'The Dwarven Burial Grounds hold an ancient rune stone. Beware the risen dead.',
    'Two more relics wait in the Planes of Light and Dark. Venture beyond the mortal world.',
    'With all four relics, the gates of Nikademus\'s Castle shall open to you.',
    'Nikademus offers you a choice at the end. Choose wisely — or boldly.',
    'Rest, train your warriors, and strengthen your resolve. The final battle will test all.'
  ],

  /* ==========================================================
     DUNGEON MAP TEMPLATES (15 wide × 10 tall)
     # = wall, . = floor, D = door, S = stairs down, U = stairs up
     T = treasure chest, E = enemy spawn
     ========================================================== */
  dungeonLayouts: {
    floor1: [
      '###############',
      '#.............#',
      '#.####.####.#.#',
      '#.#..#.#..#.#.#',
      '#.#..D.#..D.#.#',
      '#.#..#.#..#...#',
      '#.####.####.###',
      '#T.........E..#',
      '#.............S',
      '###############'
    ],
    floor2: [
      '###############',
      'U.............#',
      '#.####.####.#.#',
      '#.#.T#.#.E#.#.#',
      '#.#..D.D..#...#',
      '#.#..#.#..#.###',
      '#.##.#.#.##.#.#',
      '#....#.#....#.#',
      '#.E........E..S',
      '###############'
    ],
    floor3: [
      '###############',
      'U.............#',
      '#.####.####.###',
      '#.#....#....#.#',
      '#D####.####.D.#',
      '#.#....#....#.#',
      '#.####.####.#.#',
      '#.T....#..E.T.#',
      '#.............S',
      '###############'
    ],
    floor4: [
      '###############',
      'U.............#',
      '#.############',
      '#.....T.....#.#',
      '#.###.###.###.#',
      '#.#.E.#.E.#...#',
      '#.###.###.#####',
      '#...........T.#',
      '#.E.........E.S',
      '###############'
    ],
    floor5: [
      '###############',
      'U.....T.T.....#',
      '#.#####.#####.#',
      '#.#...#.#...#.#',
      '#.#.E.D.D.E.#.#',
      '#.#...#.#...#.#',
      '#.#####.#####.#',
      '#.....E.E.....#',
      '#......B......#',   // B = boss
      '###############'
    ]
  },

  /* ==========================================================
     SKILL TRAINING OPTIONS (for level-up)
     ========================================================== */
  trainingOptions: [
    { id: 'hp_up',    name: '+5 Max HP',         desc: 'Increase maximum hit points by 5.' },
    { id: 'mp_up',    name: '+5 Max MP',          desc: 'Increase maximum magic points by 5.', classes: ['priest','wizard','monk','ranger','thief'] },
    { id: 'str_up',   name: '+1 Strength',        desc: 'Increase strength by 1.' },
    { id: 'dex_up',   name: '+1 Dexterity',       desc: 'Increase dexterity by 1.' },
    { id: 'con_up',   name: '+1 Constitution',    desc: 'Increase constitution by 1.' },
    { id: 'int_up',   name: '+1 Intelligence',    desc: 'Increase intelligence by 1.' },
    { id: 'cha_up',   name: '+1 Charisma',        desc: 'Increase charisma by 1.' },
    { id: 'hit_up',   name: '+1 Combat Skill',    desc: 'Improve attack bonus by 1.' },
    { id: 'ac_up',    name: '+1 Defense Skill',   desc: 'Improve armor class by 1.' }
  ]
};

/* ==========================================================
   UTILITY: Dice roller used by spell effects etc.
   ========================================================== */
function roll(count, sides) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}
