/* ============================================================
   VALDORIA: THE DARK ASCENSION - GAME DATA
   World map, towns, dungeons, enemies, spells, items, races
   ============================================================ */

const DATA = (function() {
  'use strict';

  /* ==========================================================
     OVERWORLD MAP  (50 wide × 35 tall)
     . = grass   f = forest   ^ = mountain   ~ = ocean
     = = road    P = plains   s = swamp       G = glacier
     T = town    D = dungeon  R = ruins       X = shrine
     ========================================================== */
  const overworldMap = [
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',  // 0
    '~GGGGGGG.T............^^^^^^^^...................~',  // 1  coldwater(9,1)
    '~GGGGGGG..............^^^^^^^^...................~',  // 2
    '~GGGGGGG..............^^^^^^^^...................~',  // 3
    '~GGGGGGG..............^^^^^^^^...................~',  // 4
    '~...T.fffffff.........^^^^^^^^...................~',  // 5  ironhold(4,5)
    '~.....fffffffX........^^^^^^^^^^^^^^^^^^......R..~',  // 6  shrine(13,6) ruins(46,6)
    '~...================..^^=^^^^^^^^^^^^^^^.........~',  // 7  road
    '~.....fffffff.....T...^^=^^^^^^^^^^^^^^^.........~',  // 8  silverbrook(18,8)
    '~.....fffffff........R..=.....^^^^^^^^^^.........~',  // 9  ruins(21,9)
    '~.....fffffff...........=.....^^^^^^^^^^..^^^^^^^~',  // 10
    '~.....fffffff...........=.....^^^^^^T^D^..^^^^^^^~',  // 11 crystalford(36,11) crystalspire(38,11)
    '~...ffffff..............=.....^^^^^^^^^^..^^^^^^^~',  // 12
    '~...ffffff..............=.....^^^^^^^^^^..^^^^^^^~',  // 13
    '~..T===========================T==========^^^T^^^~',  // 14 ashwick(3,14) highpass(31,14) thorngate(45,14)
    '~...ffffff.....PPPPPPPPP=PPPPPPPPPP.......^^^^^^^~',  // 15
    '~...ffffff.....PPPPPPPPP=PPPPPPPPPP.......^^^^^^^~',  // 16
    '~...ffffDf.....PPPPPPPPP=PPPPPPPPPP.......^^^^^^^~',  // 17 blackwood_caverns(8,17)
    '~..............PPPPPPPPP=PPPPPPPPPPX......^^^^^^^~',  // 18 shrine(35,18)
    '~.............TPPPPPPPPP=PPPPPPPPPP.......^^^^^^^~',  // 19 verdana(14,19)
    '~..............PPPPPPPPP=PPDPPPPPPP..............~',  // 20 tower_of_echoes(27,20)
    '~..............PPPPPPPPP=PPPPPPPPPP..............~',  // 21
    '~sssssssssssssRsPPPPPPPP=PPPPPPPPPP.....T........~',  // 22 ruins(14,22) grimwall(40,22)
    '~sssssssssssssssPPPPPPPP=PPPPPPPPPP..............~',  // 23
    '~sssssssssssssssPPPPPPPP=PPPPPRPPPP..............~',  // 24 ruins(30,24)
    '~sssssssssssDsss========T==......................~',  // 25 sunken_temple(12,25) sunport(24,25)
    '~ssssssssssssTss.................................~',  // 26 saltmere(13,26)
    '~sssssssssssssssssssssssssss.....................~',  // 27
    '~sssssssssXsssssssssssssssss.................D...~',  // 28 shrine(10,28) shadowmere_keep(45,28)
    '~sssssssssssssssssssssssssss.....................~',  // 29
    '~sssssssssssssssssssssssssss.....................~',  // 30
    '~sssssssssssssssssssssssssTs.....................~',  // 31 shadowveil(26,31)
    '~...............ssssssssssss.....................~',  // 32
    '~...............ssssssssDsss.....................~',  // 33 malachar_citadel(24,33)
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'   // 34
  ];

  /* ==========================================================
     TOWNS
     ========================================================== */
  const towns = [
    { id:'ironhold',   name:'Ironhold',   x:4,  y:5,  desc:'Starting city. Seat of the Resistance against Malachar.',
      guild:true, bank:true, inn:true, armory:true, mystic:true },
    { id:'coldwater',  name:'Coldwater',  x:9,  y:1,  desc:'Northern glacier port. Hardy folk, fine equipment.',
      guild:true, bank:false,inn:true, armory:true, mystic:false },
    { id:'silverbrook',name:'Silverbrook',x:18, y:8,  desc:'Trade town on the mountain road. Gateway to the east.',
      guild:true, bank:true, inn:true, armory:true, mystic:true },
    { id:'ashwick',    name:'Ashwick',    x:3,  y:14, desc:'Forest village west of center. Quiet but well-stocked.',
      guild:false,bank:true, inn:true, armory:true, mystic:false },
    { id:'crystalford',name:'Crystalford',x:36, y:11, desc:'Eastern crystal city beneath the mountains. Scholars reside here.',
      guild:true, bank:true, inn:true, armory:true, mystic:true },
    { id:'highpass',   name:'Highpass',   x:31, y:14, desc:'Mountain pass garrison. Well-armed soldiers hold this fort.',
      guild:true, bank:false,inn:true, armory:true, mystic:false },
    { id:'verdana',    name:'Verdana',    x:14, y:19, desc:'Peaceful plains city. Center of overland trade.',
      guild:true, bank:true, inn:true, armory:true, mystic:true },
    { id:'grimwall',   name:'Grimwall',   x:40, y:22, desc:'Eastern military outpost watching the swamp borderlands.',
      guild:true, bank:false,inn:true, armory:true, mystic:false },
    { id:'sunport',    name:'Sunport',    x:24, y:25, desc:'Southern coastal hub. Shadow corruption is spreading here.',
      guild:true, bank:true, inn:true, armory:true, mystic:true },
    { id:'saltmere',   name:'Saltmere',   x:13, y:26, desc:'Swamp fishing village. Locals know the hidden paths.',
      guild:false,bank:false,inn:true, armory:false,mystic:true },
    { id:'thorngate',  name:'Thorngate',  x:45, y:14, desc:'Remote eastern fortress. Closest city to the Shadow Realm.',
      guild:true, bank:true, inn:true, armory:true, mystic:true },
    { id:'shadowveil', name:'Shadowveil', x:26, y:31, desc:'Hidden rebel city deep in the southern swamps. Hope remains here.',
      guild:true, bank:true, inn:true, armory:true, mystic:true }
  ];

  /* ==========================================================
     DUNGEONS
     ========================================================== */
  const dungeons = [
    {
      id:'blackwood_caverns', name:'Blackwood Caverns', x:8, y:17, floors:3,
      desc:'Dark forest caverns infested with beasts and corrupted spirits.',
      enemyTable:['goblin','wolf','shadow_wolf','orc','skeleton','bandit'],
      bossId:'forest_troll_king', questItem:'sealFlame', questItemFloor:3
    },
    {
      id:'crystalspire_mines', name:'Crystalspire Mines', x:38, y:11, floors:4,
      desc:'Abandoned crystal mines now home to constructs and stone creatures.',
      enemyTable:['orc','gnoll','troll','dark_wizard','golem','minotaur'],
      bossId:'crystal_golem', questItem:'sealStone', questItemFloor:4
    },
    {
      id:'sunken_temple', name:'Sunken Temple', x:12, y:25, floors:4,
      desc:'Ancient underwater temple risen from the swamp. Undead haunt its halls.',
      enemyTable:['zombie','skeleton','vampire','specter','dark_priest','wraith'],
      bossId:'undead_high_priest', questItem:'sealWave', questItemFloor:4
    },
    {
      id:'tower_of_echoes', name:'Tower of Echoes', x:27, y:20, floors:4,
      desc:'Ruined mage tower echoing with arcane power and spectral inhabitants.',
      enemyTable:['dark_wizard','specter','harpy','wraith','shadow_knight','cultist'],
      bossId:'echo_lich', questItem:'sealLight', questItemFloor:4
    },
    {
      id:'shadowmere_keep', name:'Shadowmere Keep', x:45, y:28, floors:5,
      desc:"Malachar's forward fortress in the southern swamps. His elite guard resides here.",
      enemyTable:['shadow_knight','dark_knight','shadow_wolf','wyvern','cultist','dark_priest'],
      bossId:'shadow_commander', questItem:null, questItemFloor:null
    },
    {
      id:'malachar_citadel', name:"Malachar's Citadel", x:24, y:33, floors:6,
      desc:'The Shadow King\'s ultimate fortress. The source of the dark blight upon Valdoria.',
      enemyTable:['shadow_knight','dark_knight','demon','wyvern','lich','dragon'],
      bossId:'malachar', questItem:null, questItemFloor:null,
      requiresItems:['sealFlame','sealStone','sealWave','sealLight']
    }
  ];

  /* ==========================================================
     DUNGEON FLOOR LAYOUTS
     makeFloor() generates a 25×15 navigable grid.
     Corridor rows: 1 and 13. Corridor cols: 1 and 12.
     Four room pockets at corners.
     ========================================================== */
  function makeFloor(opts) {
    const G = [];
    for (let r = 0; r < 15; r++) G.push(Array(25).fill('#'));

    // Main corridors
    for (let c = 1; c <= 23; c++) { G[1][c] = '.'; G[13][c] = '.'; }
    for (let r = 1; r <= 13; r++) { G[r][1] = '.'; G[r][12] = '.'; }

    // Room pockets
    for (let r = 3; r <= 6;  r++) for (let c = 3;  c <= 10; c++) G[r][c] = '.';
    for (let r = 3; r <= 6;  r++) for (let c = 14; c <= 22; c++) G[r][c] = '.';
    for (let r = 8; r <= 11; r++) for (let c = 3;  c <= 10; c++) G[r][c] = '.';
    for (let r = 8; r <= 11; r++) for (let c = 14; c <= 22; c++) G[r][c] = '.';

    // Doors at room junctions
    [[6,3],[6,14],[8,3],[8,14]].forEach(([r,c]) => G[r][c] = 'D');
    [[6,10],[6,22],[8,10],[8,22]].forEach(([r,c]) => G[r][c] = 'D');

    // Optional extra passages
    if (opts.extraPass) {
      opts.extraPass.forEach(([r,c]) => { if (G[r][c] !== 'D') G[r][c] = '.'; });
    }

    if (opts.u)    { G[opts.u[0]][opts.u[1]]       = 'U'; }
    if (opts.s)    { G[opts.s[0]][opts.s[1]]        = 'S'; }
    if (opts.boss) { G[opts.boss[0]][opts.boss[1]]  = 'B'; }
    (opts.chests  || []).forEach(([r,c]) => G[r][c] = 'T');
    (opts.enemies || []).forEach(([r,c]) => G[r][c] = 'E');

    return G.map(row => row.join(''));
  }

  const dungeonFloors = {
    blackwood_caverns: [
      makeFloor({ u:[1,2],  s:[13,2],  chests:[[4,7],[9,18]],           enemies:[[4,16],[9,6],[5,20]] }),
      makeFloor({ u:[1,2],  s:[13,12], chests:[[4,7],[9,18],[4,20]],    enemies:[[4,16],[9,6],[9,20],[5,5]] }),
      makeFloor({ u:[1,2],  boss:[5,12],chests:[[4,7],[9,7],[4,20],[9,20]],enemies:[[4,16],[9,18]] })
    ],
    crystalspire_mines: [
      makeFloor({ u:[1,2],  s:[13,2],  chests:[[4,7]],                  enemies:[[9,18],[5,5]] }),
      makeFloor({ u:[1,2],  s:[13,12], chests:[[4,7],[4,20]],           enemies:[[9,18],[9,6],[5,20]] }),
      makeFloor({ u:[1,2],  s:[13,22], chests:[[9,7],[9,18]],           enemies:[[4,16],[4,20],[5,5]] }),
      makeFloor({ u:[1,2],  boss:[5,12],chests:[[4,7],[9,20],[4,20]],   enemies:[[9,18],[9,6]] })
    ],
    sunken_temple: [
      makeFloor({ u:[1,2],  s:[13,2],  chests:[[4,7],[4,20]],           enemies:[[9,18],[5,5]] }),
      makeFloor({ u:[1,2],  s:[13,12], chests:[[9,7]],                  enemies:[[4,16],[9,18],[9,6]] }),
      makeFloor({ u:[1,2],  s:[13,22], chests:[[4,7],[9,18]],           enemies:[[4,16],[4,20],[5,20]] }),
      makeFloor({ u:[1,2],  boss:[5,12],chests:[[9,7],[9,20],[4,20]],   enemies:[[4,16],[9,18]] })
    ],
    tower_of_echoes: [
      makeFloor({ u:[1,2],  s:[13,2],  chests:[[4,20]],                 enemies:[[9,18],[4,16],[5,5]] }),
      makeFloor({ u:[1,2],  s:[13,12], chests:[[4,7],[9,18]],           enemies:[[9,6],[4,20],[5,20]] }),
      makeFloor({ u:[1,2],  s:[13,22], chests:[[9,7],[4,20]],           enemies:[[4,16],[9,18],[5,5]] }),
      makeFloor({ u:[1,2],  boss:[5,12],chests:[[4,7],[9,18],[9,20]],   enemies:[[4,16],[4,20]] })
    ],
    shadowmere_keep: [
      makeFloor({ u:[1,2],  s:[13,2],  chests:[[4,7]],                  enemies:[[9,18],[4,20],[5,5]] }),
      makeFloor({ u:[1,2],  s:[13,12], chests:[[4,7],[9,18]],           enemies:[[9,6],[4,20],[9,20]] }),
      makeFloor({ u:[1,2],  s:[13,22], chests:[[9,7],[4,20]],           enemies:[[4,16],[5,5],[5,20]] }),
      makeFloor({ u:[1,2],  s:[13,2],  chests:[[4,7],[9,18],[9,20]],    enemies:[[4,16],[4,20],[9,6]] }),
      makeFloor({ u:[1,2],  boss:[5,12],chests:[[4,7],[9,7],[4,20],[9,20]],enemies:[[4,16],[9,18]] })
    ],
    malachar_citadel: [
      makeFloor({ u:[1,2],  s:[13,2],  chests:[[4,7],[4,20]],           enemies:[[9,18],[5,5]] }),
      makeFloor({ u:[1,2],  s:[13,12], chests:[[4,7],[9,18]],           enemies:[[9,6],[4,20],[9,20]] }),
      makeFloor({ u:[1,2],  s:[13,22], chests:[[9,7],[9,18]],           enemies:[[4,16],[4,20],[5,5]] }),
      makeFloor({ u:[1,2],  s:[13,2],  chests:[[4,7],[9,20],[4,20]],    enemies:[[4,16],[9,18],[9,6]] }),
      makeFloor({ u:[1,2],  s:[13,12], chests:[[4,7],[9,7],[4,20],[9,20]],enemies:[[4,16],[9,18],[5,20]] }),
      makeFloor({ u:[1,2],  boss:[5,12],chests:[[4,7],[9,7],[4,20],[9,20]],enemies:[[4,16],[9,18]] })
    ]
  };

  /* ==========================================================
     ENEMIES  (35 types)
     ========================================================== */
  const enemies = [
    // -- Tier 1 (Levels 1-4) --
    { id:'goblin',       name:'Goblin',        hp:[1,6],   str:5,  dex:8,  ac:2,  dmg:'1d4',   xp:10,  gold:[1,8],   type:'normal', rank:'front' },
    { id:'orc',          name:'Orc',           hp:[2,8],   str:10, dex:6,  ac:4,  dmg:'1d6',   xp:20,  gold:[2,8],   type:'normal', rank:'front' },
    { id:'wolf',         name:'Wolf',          hp:[2,6],   str:9,  dex:12, ac:3,  dmg:'1d6',   xp:15,  gold:[0,4],   type:'beast',  rank:'front' },
    { id:'skeleton',     name:'Skeleton',      hp:[1,8],   str:8,  dex:7,  ac:5,  dmg:'1d6',   xp:18,  gold:[0,6],   type:'undead', rank:'front' },
    { id:'bandit',       name:'Bandit',        hp:[2,8],   str:9,  dex:9,  ac:3,  dmg:'1d6',   xp:25,  gold:[3,10],  type:'human',  rank:'front' },
    { id:'giant_rat',    name:'Giant Rat',     hp:[1,4],   str:4,  dex:14, ac:2,  dmg:'1d4',   xp:8,   gold:[0,2],   type:'beast',  rank:'front' },
    { id:'shadow_wolf',  name:'Shadow Wolf',   hp:[3,6],   str:11, dex:13, ac:4,  dmg:'1d8',   xp:35,  gold:[0,5],   type:'shadow', rank:'front' },

    // -- Tier 2 (Levels 4-8) --
    { id:'zombie',       name:'Zombie',        hp:[3,8],   str:12, dex:4,  ac:5,  dmg:'1d8',   xp:40,  gold:[0,8],   type:'undead', rank:'front' },
    { id:'gnoll',        name:'Gnoll',         hp:[3,8],   str:13, dex:9,  ac:5,  dmg:'1d8',   xp:50,  gold:[4,12],  type:'normal', rank:'front' },
    { id:'troll',        name:'Troll',         hp:[4,10],  str:16, dex:8,  ac:6,  dmg:'2d6',   xp:80,  gold:[5,20],  type:'beast',  rank:'front', special:'regenerate' },
    { id:'ogre',         name:'Ogre',          hp:[5,10],  str:17, dex:5,  ac:4,  dmg:'2d6+2', xp:100, gold:[8,30],  type:'giant',  rank:'front' },
    { id:'harpy',        name:'Harpy',         hp:[3,8],   str:10, dex:14, ac:4,  dmg:'2d4',   xp:65,  gold:[2,10],  type:'beast',  rank:'front' },
    { id:'dark_wizard',  name:'Dark Wizard',   hp:[2,8],   str:6,  dex:12, ac:3,  dmg:'2d8',   xp:120, gold:[10,30], type:'human',  rank:'rear',  spells:['fireflash1','weakness1'] },
    { id:'dark_priest',  name:'Dark Priest',   hp:[3,8],   str:8,  dex:10, ac:4,  dmg:'1d8',   xp:110, gold:[8,25],  type:'human',  rank:'rear',  spells:['weakness2','confusion'] },
    { id:'cultist',      name:'Shadow Cultist',hp:[3,8],   str:11, dex:10, ac:4,  dmg:'1d8',   xp:90,  gold:[6,18],  type:'shadow', rank:'front' },

    // -- Tier 3 (Levels 8-14) --
    { id:'minotaur',     name:'Minotaur',      hp:[6,10],  str:18, dex:8,  ac:6,  dmg:'2d8',   xp:150, gold:[10,40], type:'beast',  rank:'front' },
    { id:'vampire',      name:'Vampire',       hp:[5,10],  str:16, dex:14, ac:7,  dmg:'1d8',   xp:200, gold:[20,50], type:'undead', rank:'front', special:'drain_hp' },
    { id:'specter',      name:'Specter',       hp:[4,8],   str:14, dex:16, ac:8,  dmg:'2d6',   xp:180, gold:[5,20],  type:'undead', rank:'front', special:'phase' },
    { id:'golem',        name:'Stone Golem',   hp:[8,12],  str:20, dex:3,  ac:14, dmg:'3d8',   xp:300, gold:[0,20],  type:'construct',rank:'front' },
    { id:'shadow_knight',name:'Shadow Knight', hp:[6,10],  str:16, dex:12, ac:10, dmg:'2d8+2', xp:280, gold:[25,60], type:'shadow', rank:'front' },
    { id:'wraith',       name:'Wraith',        hp:[4,8],   str:12, dex:15, ac:8,  dmg:'2d6',   xp:250, gold:[10,30], type:'undead', rank:'front', spells:['weakness2'] },
    { id:'wyvern',       name:'Wyvern',        hp:[6,10],  str:16, dex:12, ac:9,  dmg:'2d10',  xp:350, gold:[15,50], type:'dragon', rank:'front', special:'breathe_fire' },

    // -- Tier 4 (Levels 14+) --
    { id:'dark_knight',  name:'Dark Knight',   hp:[6,10],  str:17, dex:12, ac:10, dmg:'2d8+3', xp:350, gold:[30,80], type:'human',  rank:'front' },
    { id:'lich',         name:'Lich',          hp:[6,10],  str:10, dex:14, ac:10, dmg:'3d8',   xp:600, gold:[40,150],type:'undead', rank:'rear',  spells:['fireflash3','weakness3','confusion'] },
    { id:'demon',        name:'Demon',         hp:[7,12],  str:18, dex:12, ac:11, dmg:'2d10',  xp:450, gold:[30,100],type:'demon',  rank:'front' },
    { id:'dragon',       name:'Dragon',        hp:[8,12],  str:20, dex:10, ac:12, dmg:'3d10',  xp:500, gold:[50,200],type:'dragon', rank:'front', special:'breathe_fire' },

    // -- Bosses --
    { id:'forest_troll_king', name:'Forest Troll King', hp:[15,10], str:20, dex:10, ac:10, dmg:'3d8+3', xp:800,  gold:[50,100], type:'beast',   rank:'front', special:'regenerate' },
    { id:'crystal_golem',     name:'Crystal Golem',     hp:[18,10], str:22, dex:4,  ac:16, dmg:'3d10',  xp:1000, gold:[60,120], type:'construct',rank:'front' },
    { id:'undead_high_priest',name:'Undead High Priest', hp:[14,10], str:12, dex:14, ac:12, dmg:'2d8',   xp:1200, gold:[80,150], type:'undead',  rank:'rear',  spells:['weakness3','confusion','fireflash2'] },
    { id:'echo_lich',         name:'Echo Lich',          hp:[16,10], str:10, dex:16, ac:14, dmg:'3d10',  xp:1500, gold:[100,200],type:'undead',  rank:'rear',  spells:['fireflash3','confusion','mindblast2'] },
    { id:'shadow_commander',  name:'Shadow Commander',   hp:[20,10], str:22, dex:15, ac:15, dmg:'3d8+5', xp:2000, gold:[150,300],type:'shadow',  rank:'front', spells:['weakness2'] },
    {
      id:'malachar', name:'Lord Malachar, Shadow King',
      hp:[25,10], str:25, dex:18, ac:18, dmg:'4d10+5',
      xp:8000, gold:[500,1000], type:'shadow', rank:'rear',
      spells:['fireflash3','mindblast2','weakness3','confusion'],
      special:'final_boss',
      desc:'The Shadow King himself. Ancient. Terrible. And perhaps... not entirely wrong.'
    }
  ];

  /* ==========================================================
     SPELLS  (30 total)
     ========================================================== */
  const spells = [
    // -- Attack Spells --
    { id:'fireflash1',  name:'Fireflash I',    mp:4,  cls:['wizard','ranger'],
      desc:'A bolt of flame scorches one enemy.',
      effect:(caster,target) => ({ type:'damage', amount: roll(2,6) + Math.floor((caster.stats ? caster.stats.int : 10)/4) }) },
    { id:'fireflash2',  name:'Fireflash II',   mp:8,  cls:['wizard'],
      desc:'A powerful flame bolt.',
      effect:(caster,target) => ({ type:'damage', amount: roll(3,8) + Math.floor((caster.stats ? caster.stats.int : 10)/3) }) },
    { id:'fireflash3',  name:'Fireflash III',  mp:14, cls:['wizard'],
      desc:'Massive fire eruption.',
      effect:(caster,target) => ({ type:'damage', amount: roll(5,8) + Math.floor((caster.stats ? caster.stats.int : 10)/2) }) },
    { id:'lightning',   name:'Lightning',      mp:10, cls:['wizard'],
      desc:'A bolt of lightning strikes all enemies.',
      effect:(caster,target) => ({ type:'damage_all', amount: roll(3,6) }) },
    { id:'icebolt',     name:'Ice Bolt',       mp:6,  cls:['wizard','thief'],
      desc:'A shard of ice wounds and slows the target.',
      effect:(caster,target) => ({ type:'damage', amount: roll(2,6), status:'slowed' }) },
    { id:'shadowbolt',  name:'Shadow Bolt',    mp:7,  cls:['wizard','thief'],
      desc:'A bolt of shadow energy weakens the target.',
      effect:(caster,target) => ({ type:'damage', amount: roll(2,8), status:'weak1' }) },
    { id:'earthquake',  name:'Earthquake',     mp:16, cls:['wizard'],
      desc:'Tremors damage all enemies.',
      effect:(caster,target) => ({ type:'damage_all', amount: roll(4,8) }) },

    // -- Heal/Support Spells --
    { id:'heal1',       name:'Heal',           mp:5,  cls:['priest','monk'],
      desc:'Restores HP to the most wounded ally.',
      effect:(caster,target) => ({ type:'heal', amount: roll(2,8) + Math.floor((caster.stats ? caster.stats.wis : 10)/4) }) },
    { id:'heal2',       name:'Heal II',        mp:10, cls:['priest'],
      desc:'Restores significant HP.',
      effect:(caster,target) => ({ type:'heal', amount: roll(4,8) + Math.floor((caster.stats ? caster.stats.wis : 10)/3) }) },
    { id:'heal3',       name:'Heal III',       mp:18, cls:['priest'],
      desc:'Powerful healing restores much HP.',
      effect:(caster,target) => ({ type:'heal', amount: roll(6,8) + Math.floor((caster.stats ? caster.stats.wis : 10)/2) }) },
    { id:'raise_dead',  name:'Raise Dead',     mp:20, cls:['priest'],
      desc:'Revives a fallen party member.',
      effect:(caster,target) => ({ type:'raise', amount: 5 }) },
    { id:'bless',       name:'Bless',          mp:8,  cls:['priest','monk'],
      desc:'Blesses the party, improving attack rolls.',
      effect:(caster,target) => ({ type:'party_buff', stat:'hitBonus', amount:3, turns:4 }) },
    { id:'holy_ward',   name:'Holy Ward',      mp:12, cls:['priest'],
      desc:'Wards the party against undead attacks.',
      effect:(caster,target) => ({ type:'party_buff', stat:'acBonus', amount:4, turns:3 }) },
    { id:'meditation',  name:'Meditation',     mp:0,  cls:['wizard','monk'],
      desc:'The caster meditates, restoring some MP.',
      effect:(caster,target) => ({ type:'restore_mp', amount: roll(2,6) + 3 }) },

    // -- Debuff Spells --
    { id:'weakness1',   name:'Weakness',       mp:4,  cls:['wizard','priest','thief'],
      desc:'Weakens target, reducing damage dealt.',
      effect:(caster,target) => ({ type:'status', status:'weak1' }) },
    { id:'weakness2',   name:'Weakness II',    mp:8,  cls:['wizard','priest'],
      desc:'Greatly weakens target.',
      effect:(caster,target) => ({ type:'status', status:'weak2' }) },
    { id:'weakness3',   name:'Weakness III',   mp:14, cls:['wizard'],
      desc:'Target is severely weakened.',
      effect:(caster,target) => ({ type:'status', status:'weak3' }) },
    { id:'confusion',   name:'Confusion',      mp:9,  cls:['wizard','thief'],
      desc:'Confuses the target, may cause it to miss turns.',
      effect:(caster,target) => ({ type:'status', status:'confused' }) },
    { id:'slow',        name:'Slow',           mp:6,  cls:['wizard','ranger'],
      desc:'Slows the target, causing it to skip attacks.',
      effect:(caster,target) => ({ type:'status', status:'slowed' }) },
    { id:'mindblast1',  name:'Mind Blast',     mp:10, cls:['wizard'],
      desc:'A psychic blast stuns the target.',
      effect:(caster,target) => ({ type:'damage', amount: roll(2,8), status:'confused' }) },
    { id:'mindblast2',  name:'Mind Blast II',  mp:16, cls:['wizard'],
      desc:'Powerful psychic assault.',
      effect:(caster,target) => ({ type:'damage', amount: roll(3,10), status:'confused' }) },
    { id:'dispel',      name:'Dispel',         mp:7,  cls:['priest','wizard'],
      desc:'Removes magical effects from target.',
      effect:(caster,target) => ({ type:'dispel' }) },

    // -- Thief / Ranger Spells --
    { id:'stealth',     name:'Shadow Cloak',   mp:5,  cls:['thief'],
      desc:'Cloaks self, improving dodge.',
      effect:(caster,target) => ({ type:'self_buff', stat:'evading' }) },
    { id:'steal_gold',  name:'Pickpocket',     mp:3,  cls:['thief'],
      desc:'Attempts to steal gold from an enemy.',
      effect:(caster,target) => ({ type:'steal', amount: roll(1,20) + 5 }) },
    { id:'camouflage',  name:'Camouflage',     mp:6,  cls:['ranger'],
      desc:'Reduces encounter rate while outdoors.',
      effect:(caster,target) => ({ type:'self_buff', stat:'camouflaged' }) },
    { id:'arrow_volley',name:'Arrow Volley',   mp:8,  cls:['ranger'],
      desc:'Fires arrows at all enemies.',
      effect:(caster,target) => ({ type:'damage_all', amount: roll(2,6) }) },
    { id:'teleport',    name:'Teleport',       mp:15, cls:['wizard'],
      desc:'Teleports the party out of the dungeon.',
      effect:(caster,target) => ({ type:'flee_success' }) },

    // -- Monk Spells --
    { id:'iron_fist',   name:'Iron Fist',      mp:4,  cls:['monk'],
      desc:'Channels ki into a crushing blow.',
      effect:(caster,target) => ({ type:'damage', amount: roll(3,6) }) },
    { id:'ki_shield',   name:'Ki Shield',      mp:8,  cls:['monk'],
      desc:'Wraps self in ki energy, boosting defense.',
      effect:(caster,target) => ({ type:'self_buff', stat:'ki_shielded' }) },
    { id:'mend_wounds', name:'Mend Wounds',    mp:7,  cls:['monk','priest'],
      desc:'Heals self using ki meditation.',
      effect:(caster,target) => ({ type:'heal', amount: roll(3,6) + 5 }) }
  ];

  /* ==========================================================
     WEAPONS  (14)
     ========================================================== */
  const weapons = [
    { id:'fists',     name:'Bare Fists',    damage:'1d3',   strReq:0,  price:0,    aug:0, cls:[] },
    { id:'dagger',    name:'Dagger',        damage:'1d4',   strReq:3,  price:15,   aug:0, cls:[] },
    { id:'shortswd',  name:'Short Sword',   damage:'1d6',   strReq:5,  price:40,   aug:0, cls:[] },
    { id:'mace',      name:'Mace',          damage:'1d8',   strReq:8,  price:80,   aug:0, cls:['fighter','priest','monk'] },
    { id:'longsword', name:'Long Sword',    damage:'1d8+1', strReq:10, price:120,  aug:0, cls:['fighter','ranger'] },
    { id:'battleaxe', name:'Battle Axe',    damage:'1d10',  strReq:13, price:200,  aug:0, cls:['fighter'] },
    { id:'greatsword',name:'Greatsword',    damage:'2d6',   strReq:15, price:350,  aug:0, cls:['fighter'] },
    { id:'staff',     name:'Quarter Staff', damage:'1d6',   strReq:5,  price:30,   aug:0, cls:['wizard','monk','priest'] },
    { id:'halberd',   name:'Halberd',       damage:'2d8',   strReq:16, price:500,  aug:0, cls:['fighter'] },
    { id:'rapier',    name:'Rapier',        damage:'1d6+2', strReq:6,  price:150,  aug:1, cls:['thief','ranger'] },
    { id:'shadowblade',name:'Shadow Blade', damage:'1d8+3', strReq:8,  price:600,  aug:3, cls:[] },
    { id:'mgsword',   name:'Magic Sword',   damage:'1d8+3', strReq:8,  price:800,  aug:3, cls:[] },
    { id:'mace2',     name:'Silver Mace',   damage:'1d6+4', strReq:7,  price:700,  aug:4, cls:['fighter','priest','monk'] },
    { id:'vorpal',    name:'Vorpal Blade',  damage:'2d6+5', strReq:12, price:2500, aug:5, cls:[] }
  ];

  /* ==========================================================
     ARMOR  (12 entries)
     ========================================================== */
  const armors = [
    { id:'none',       name:'None',             ac:0,  strReq:0,  price:0    },
    { id:'cloth',      name:'Cloth Robes',       ac:1,  strReq:0,  price:10   },
    { id:'leather',    name:'Leather Armor',     ac:3,  strReq:5,  price:80   },
    { id:'studded',    name:'Studded Leather',   ac:4,  strReq:7,  price:150  },
    { id:'ringmail',   name:'Ring Mail',         ac:5,  strReq:10, price:250  },
    { id:'chainmail',  name:'Chain Mail',        ac:7,  strReq:13, price:450  },
    { id:'scalemail',  name:'Scale Mail',        ac:8,  strReq:14, price:600  },
    { id:'platemail',  name:'Plate Mail',        ac:10, strReq:17, price:1000 },
    { id:'mgchain',    name:'Enchanted Chain',   ac:9,  strReq:11, price:900  },
    { id:'mgplate',    name:'Shadow Plate',      ac:13, strReq:15, price:2500 },
    { id:'dragonscale',name:'Dragon Scale Mail', ac:15, strReq:14, price:5500 },
    { id:'shadowweave',name:'Shadow Weave',      ac:6,  strReq:4,  price:800  }
  ];

  /* ==========================================================
     SHIELDS  (6)
     ========================================================== */
  const shields = [
    { id:'none',     name:'None',          ac:0, strReq:0,  price:0    },
    { id:'buckler',  name:'Buckler',       ac:1, strReq:5,  price:50   },
    { id:'smallshld',name:'Small Shield',  ac:2, strReq:8,  price:120  },
    { id:'largeshld',name:'Large Shield',  ac:3, strReq:12, price:280  },
    { id:'towershld',name:'Tower Shield',  ac:4, strReq:16, price:600  },
    { id:'mgshld',   name:'Magic Shield',  ac:5, strReq:10, price:1200 }
  ];

  /* ==========================================================
     POTIONS  (array for inventory use)
     ========================================================== */
  const potions = [
    { id:'pot_hp1',    name:'Healing Draught',   price:50,  effect:{ type:'heal',         amount:[2,6] } },
    { id:'pot_hp2',    name:'Strong Healing',    price:150, effect:{ type:'heal',         amount:[5,6] } },
    { id:'pot_hp3',    name:'Full Restoration',  price:300, effect:{ type:'heal',         amount:[10,6] } },
    { id:'pot_mp1',    name:'Mana Potion',        price:80,  effect:{ type:'restore_mp',   amount:[2,6] } },
    { id:'pot_mp2',    name:'Great Mana Potion',  price:250, effect:{ type:'restore_mp',   amount:[5,6] } },
    { id:'pot_str',    name:'Strength Elixir',    price:200, effect:{ type:'buff', stat:'str', amount:[1,4] } },
    { id:'pot_ant',    name:'Antidote',           price:30,  effect:{ type:'cure_status',  status:'poisoned' } },
    { id:'pot_revive', name:'Phoenix Down',       price:500, effect:{ type:'raise',        amount:5 } }
  ];

  /* ==========================================================
     QUEST ITEMS — The Four Seals of Power
     ========================================================== */
  const questItems = [
    { id:'sealFlame', name:'Seal of Flame', flag:'sealOfFlameFound',
      desc:'A blazing crimson seal — one of four keys to shatter the Shadow Gate.' },
    { id:'sealStone', name:'Seal of Stone', flag:'sealOfStoneFound',
      desc:'A cold grey seal humming with geomantic power from the deep earth.' },
    { id:'sealWave',  name:'Seal of Wave',  flag:'sealOfWaveFound',
      desc:'A shimmering blue seal smelling of the deep ocean and ancient tides.' },
    { id:'sealLight', name:'Seal of Light', flag:'sealOfLightFound',
      desc:'A radiant white seal that drives back shadow wherever it shines.' }
  ];

  /* ==========================================================
     MYSTIC HINTS (per town)
     ========================================================== */
  const mysticHints = {
    ironhold:    [
      'Lord Malachar seeks to merge Valdoria with the Shadow Realm permanently.',
      'The Seal of Flame is guarded by the Forest Troll King in Blackwood Caverns.',
      'Gather all four Seals of Power to open the gates of Malachar\'s Citadel.'
    ],
    coldwater:   [
      'The glacier peoples remember when the Shadow first darkened the northern skies.',
      'Seek the four Seals before confronting Malachar — without them, his gates will not open.',
      'The Crystalspire Mines to the east hold the Seal of Stone.'
    ],
    silverbrook: [
      'The mountains hide the entrance to the Crystalspire Mines and the Seal of Stone.',
      'Shadow patrols have been spotted near Thorngate — Malachar\'s reach grows longer.',
      'All four Seals must be carried when you face Malachar. Go not before you have them all.'
    ],
    ashwick:     [
      'The Forest of Blackwood to the east conceals the entrance to ancient caverns.',
      'Train your warriors well before venturing into the deeper dungeons.',
      'The road east leads to many dangers — and the four Seals that can stop the Shadow King.'
    ],
    crystalford: [
      'The Crystal Golem guards the deepest level of the mines. It cannot be bargained with.',
      'Scholars here have translated the Shadow Texts: Malachar was once a great mage of light.',
      'The Seal of Stone rests at the bottom of the Crystalspire Mines.'
    ],
    highpass:    [
      'Our soldiers have held the pass for three years. Malachar\'s armies grow stronger.',
      'Shadowmere Keep to the south is the enemy\'s staging ground. Dangerous — but beatable.',
      'The Tower of Echoes holds the Seal of Light. The Echo Lich guards it jealously.'
    ],
    verdana:     [
      'The Tower of Echoes was once a great school of magic. Now nothing living dwells there.',
      'The Seal of Wave rests in the Sunken Temple to the southwest. Undead haunt its depths.',
      'The four Seals were forged by the Elder Gods to lock the Shadow Realm. Malachar wants them gone.'
    ],
    grimwall:    [
      'Shadowmere Keep looms to the south. The Shadow Commander within knows the Citadel\'s secrets.',
      'If you can defeat the forces at Shadowmere Keep, the path south will open to you.',
      'Malachar\'s Citadel lies at the far southern end of the realm, beyond the swamplands.'
    ],
    sunport:     [
      'The shadow blight is spreading northward from the Citadel. We may not have much time.',
      'Shadowveil to the south has refugees who know secret paths through the swamp.',
      'Find all four Seals, then face Malachar. Do not go unprepared.'
    ],
    saltmere:    [
      'I have seen the four Seals in my visions. Flame, Stone, Wave, and Light — gather them all.',
      'The Sunken Temple to the east has risen from the swamp. Ancient power stirs within.',
      'Shadowveil lies deeper into the swamp. Resistance fighters shelter there.'
    ],
    thorngate:   [
      'We are the last outpost before the Shadow Realm. Beyond Shadowmere Keep, all is darkness.',
      'The echo of Malachar\'s voice can be heard on windless nights. Do not let it speak to you.',
      'Four Seals seal the gate to his power. The dungeons of Valdoria each hold one.'
    ],
    shadowveil:  [
      'We have lived in Malachar\'s shadow for years. His cruelty is matched only by his brilliance.',
      'All four Seals must be present when you confront Malachar — his gate will not yield otherwise.',
      'If you defeat Malachar, his shadow creatures will dissolve. Valdoria will be free at last.'
    ]
  };

  /* ==========================================================
     RACES  (10)
     ========================================================== */
  const races = [
    { id:'human',      name:'Human',       str:0,  int:0,  dex:0,  con:0,  wis:0,  lck:1,  desc:'Versatile. Bonus luck.' },
    { id:'elf',        name:'Elf',         str:-1, int:2,  dex:1,  con:-1, wis:1,  lck:0,  desc:'Brilliant and agile, but frail.' },
    { id:'dwarf',      name:'Dwarf',       str:2,  int:-1, dex:-1, con:2,  wis:0,  lck:0,  desc:'Tough and strong, poor at magic.' },
    { id:'gnome',      name:'Gnome',       str:-1, int:2,  dex:1,  con:0,  wis:1,  lck:1,  desc:'Small but magically gifted.' },
    { id:'halfling',   name:'Halfling',    str:-1, int:0,  dex:2,  con:0,  wis:0,  lck:3,  desc:'Lucky and agile.' },
    { id:'veldari',    name:'Veldari',     str:1,  int:1,  dex:0,  con:0,  wis:1,  lck:0,  desc:'Ancient scholars of the Shadow Age.' },
    { id:'ironborn',   name:'Ironborn',    str:3,  int:-2, dex:0,  con:2,  wis:-1, lck:0,  desc:'Born of iron will and brute force.' },
    { id:'moonstalker',name:'Moonstalker', str:0,  int:0,  dex:3,  con:0,  wis:0,  lck:1,  desc:'Shadow-born hunters of the night.' },
    { id:'stormkin',   name:'Stormkin',    str:1,  int:1,  dex:1,  con:0,  wis:1,  lck:-1, desc:'Half-elemental blood. Powerful.' },
    { id:'ashwalker',  name:'Ashwalker',   str:0,  int:0,  dex:1,  con:1,  wis:2,  lck:0,  desc:'Survivors of the Shadow Blight.' }
  ];

  /* ==========================================================
     CLASSES  (6, as array)
     ========================================================== */
  const classes = [
    { id:'fighter', name:'Fighter', hdice:10, strGain:2, intGain:0, dexGain:1, conGain:1, wisGain:0, mpBase:0,  spellsPerLevel:0, hitBonus:2 },
    { id:'priest',  name:'Priest',  hdice:8,  strGain:1, intGain:1, dexGain:0, conGain:1, wisGain:2, mpBase:15, spellsPerLevel:1, hitBonus:0 },
    { id:'wizard',  name:'Wizard',  hdice:4,  strGain:0, intGain:3, dexGain:1, conGain:0, wisGain:1, mpBase:20, spellsPerLevel:2, hitBonus:-1 },
    { id:'monk',    name:'Monk',    hdice:8,  strGain:2, intGain:0, dexGain:2, conGain:1, wisGain:1, mpBase:10, spellsPerLevel:1, hitBonus:1 },
    { id:'ranger',  name:'Ranger',  hdice:8,  strGain:1, intGain:1, dexGain:2, conGain:1, wisGain:0, mpBase:8,  spellsPerLevel:1, hitBonus:1 },
    { id:'thief',   name:'Thief',   hdice:6,  strGain:1, intGain:0, dexGain:3, conGain:0, wisGain:0, mpBase:5,  spellsPerLevel:1, hitBonus:0 }
  ];

  /* ==========================================================
     SKILL TRAINING OPTIONS
     ========================================================== */
  const trainingOptions = [
    { id:'hp_up',  name:'+5 Max HP',       desc:'Increase maximum hit points by 5.' },
    { id:'mp_up',  name:'+5 Max MP',       desc:'Increase maximum magic points by 5.', classes:['priest','wizard','monk','ranger','thief'] },
    { id:'str_up', name:'+1 Strength',     desc:'Increase strength by 1.' },
    { id:'dex_up', name:'+1 Dexterity',    desc:'Increase dexterity by 1.' },
    { id:'con_up', name:'+1 Constitution', desc:'Increase constitution by 1.' },
    { id:'int_up', name:'+1 Intelligence', desc:'Increase intelligence by 1.' },
    { id:'hit_up', name:'+1 Combat Skill', desc:'Improve attack bonus by 1.' },
    { id:'ac_up',  name:'+1 Defense Skill',desc:'Improve armor class by 1.' }
  ];

  /* ==========================================================
     UTILITY
     ========================================================== */
  function roll(count, sides) {
    let total = 0;
    for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
    return total;
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */
  return {
    overworldMap,
    towns,
    dungeons,
    dungeonFloors,
    enemies,
    spells,
    weapons,
    armors,
    shields,
    potions,
    questItems,
    mysticHints,
    races,
    classes,
    trainingOptions
  };

})();
