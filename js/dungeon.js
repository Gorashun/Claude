/* ============================================================
   PHANTASIE III - DUNGEON EXPLORATION
   ASCII map rendering, movement, traps, chests, boss fights
   ============================================================ */

const DungeonScreen = (function() {
  'use strict';

  /* ----------------------------------------------------------
     TILE DEFINITIONS
     ---------------------------------------------------------- */
  const TILE = {
    '#': { name: 'Wall',       passable: false, css: 'wall',   sym: '#' },
    '.': { name: 'Floor',      passable: true,  css: 'floor',  sym: '.' },
    'D': { name: 'Door',       passable: true,  css: 'door',   sym: 'D' },
    'S': { name: 'Stairs Down',passable: true,  css: 'stairs', sym: '▼' },
    'U': { name: 'Stairs Up',  passable: true,  css: 'stairs', sym: '▲' },
    'T': { name: 'Chest',      passable: true,  css: 'chest',  sym: 'T' },
    'E': { name: 'Enemy Spawn',passable: true,  css: 'floor',  sym: '.' },
    'B': { name: 'Boss',       passable: true,  css: 'floor',  sym: '.' }
  };

  /* ----------------------------------------------------------
     DUNGEON STATE
     ---------------------------------------------------------- */
  let dungeonState = {
    dungeonId: null,
    floor: 1,
    layout: null,        // current floor layout (array of strings)
    playerPos: { x: 1, y: 7 },
    openedChests: {},    // set of "x,y" keys
    deadEnemies: {},     // set of "x,y" keys for this floor
    revealed: null,      // 2D boolean array for fog of war
    encountRate: 0.10,
    stepCount: 0
  };

  /* ----------------------------------------------------------
     RENDER DUNGEON SCREEN
     ---------------------------------------------------------- */
  function render(main, data) {
    const { dungeonId, floor } = data;
    const dungeon = DATA.dungeons.find(d => d.id === dungeonId);
    if (!dungeon) {
      main.innerHTML = `<div class="panel"><p class="text-red">Unknown dungeon: ${dungeonId}</p></div>`;
      return;
    }

    dungeonState.dungeonId = dungeonId;
    dungeonState.floor = floor;
    dungeonState.layout = getFloorLayout(floor);
    if (!dungeonState.revealed || dungeonState.floor !== data.floor) {
      initFogOfWar(dungeonState.layout);
    }

    // Find start position based on floor
    if (data.resetPos !== false) {
      const startPos = findStartPos(dungeonState.layout, floor === 1 ? 'U' : 'S');
      // For floor 1 entry from overworld, start near stairs-up if there is one
      if (startPos) {
        dungeonState.playerPos = startPos;
      } else {
        dungeonState.playerPos = { x: 1, y: 7 };
      }
    }

    revealAround(dungeonState.playerPos, 3);

    main.innerHTML = `
      <div id="screen-dungeon">
        <canvas id="dungeon-canvas" width="440" height="340"></canvas>
        <div id="dungeon-sidebar">
          <div class="dungeon-info">
            <div style="color:var(--yellow);font-size:13px;letter-spacing:2px">${dungeon.name}</div>
            <div style="color:var(--grey);font-size:12px;margin-top:4px">Floor ${floor}/${dungeon.floors}</div>
          </div>
          <div class="dungeon-info">
            <div style="color:var(--grey);font-size:12px;margin-bottom:4px">CONTROLS</div>
            <div style="color:var(--white);font-size:12px;line-height:1.8">
              Arrow/WASD: Move<br>
              E / Enter: Interact<br>
              P: Party screen<br>
              Esc: Leave dungeon
            </div>
          </div>
          <div class="dungeon-info">
            <div style="color:var(--grey);font-size:12px;margin-bottom:4px">LEGEND</div>
            <div style="font-size:12px;line-height:1.8">
              <span style="color:var(--fg)">#</span> Wall<br>
              <span style="color:var(--orange)">D</span> Door<br>
              <span style="color:var(--cyan)">▼▲</span> Stairs<br>
              <span style="color:var(--yellow)">T</span> Chest<br>
              <span style="color:var(--fg)">@</span> Party<br>
              <span style="color:var(--red)">E</span> Enemy
            </div>
          </div>
          ${buildDungeonStatus()}
        </div>
      </div>
    `;

    drawDungeonMap();
  }

  function buildDungeonStatus() {
    const s = Game.getState();
    const dp = s.dungeonProgress[dungeonState.dungeonId] || {};
    const chestCount = Object.keys(dungeonState.openedChests).length;
    return `
      <div class="dungeon-info">
        <div style="color:var(--grey);font-size:12px;margin-bottom:4px">STATUS</div>
        <div style="color:var(--white);font-size:12px">
          Gold: <span style="color:var(--yellow)">${s.partyGold}</span>
        </div>
        <div style="color:var(--grey);font-size:12px">
          Chests: ${chestCount}
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     FOG OF WAR
     ---------------------------------------------------------- */
  function initFogOfWar(layout) {
    dungeonState.revealed = layout.map(row => new Array(row.length).fill(false));
  }

  function revealAround(pos, radius) {
    const layout = dungeonState.layout;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const y = pos.y + dy;
        const x = pos.x + dx;
        if (y >= 0 && y < layout.length && x >= 0 && x < layout[y].length) {
          if (Math.abs(dx) + Math.abs(dy) <= radius + 1) {
            dungeonState.revealed[y][x] = true;
          }
        }
      }
    }
  }

  /* ----------------------------------------------------------
     DUNGEON CANVAS TILE PALETTE
     ---------------------------------------------------------- */
  const DTILE = {
    '#': { bg: '#1a1a1a', fg: null,      sym: null  },  // solid wall
    '.': { bg: '#050505', fg: '#1a1a1a', sym: '·'   },  // floor
    'D': { bg: '#221100', fg: '#ff8800', sym: 'D'   },  // door
    'S': { bg: '#001a1a', fg: '#00ccff', sym: '\u25bc' },// stairs down
    'U': { bg: '#001a1a', fg: '#00ccff', sym: '\u25b2' },// stairs up
    'T': { bg: '#1a1200', fg: '#ffcc00', sym: 'T'   },  // chest
    'E': { bg: '#1a0000', fg: '#ff3333', sym: 'E'   },  // enemy
    'B': { bg: '#1a0000', fg: '#ff3333', sym: 'B'   }   // boss
  };

  /* ----------------------------------------------------------
     DRAW DUNGEON MAP — Canvas tile renderer
     ---------------------------------------------------------- */
  function drawDungeonMap() {
    const canvas = document.getElementById('dungeon-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const layout = dungeonState.layout;
    const pp    = dungeonState.playerPos;

    const TW = 20, TH = 20;
    const VIEW_W = 22, VIEW_H = 17;  // 440 / 20, 340 / 20

    // Clamp viewport
    const mapH = layout.length;
    const mapW = (layout[0] || '').length;
    const startX = Math.max(0, Math.min(pp.x - Math.floor(VIEW_W / 2), mapW - VIEW_W));
    const startY = Math.max(0, Math.min(pp.y - Math.floor(VIEW_H / 2), mapH - VIEW_H));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '12px "Courier New", monospace';

    for (let row = startY; row < Math.min(startY + VIEW_H, mapH); row++) {
      const rowStr = layout[row] || '';
      for (let col = startX; col < Math.min(startX + VIEW_W, rowStr.length); col++) {
        const sx = (col - startX) * TW;
        const sy = (row - startY) * TH;
        const cx = sx + TW / 2;
        const cy = sy + TH / 2;

        const revealed = dungeonState.revealed &&
                         dungeonState.revealed[row] &&
                         dungeonState.revealed[row][col];

        if (col === pp.x && row === pp.y) {
          // Player
          ctx.fillStyle = '#001a00';
          ctx.fillRect(sx, sy, TW, TH);
          ctx.shadowColor = '#ffcc00';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#33ff33';
          ctx.font = 'bold 14px "Courier New", monospace';
          ctx.fillText('@', cx, cy);
          ctx.shadowBlur = 0;
          ctx.font = '12px "Courier New", monospace';
          continue;
        }

        if (!revealed) {
          ctx.fillStyle = '#000';
          ctx.fillRect(sx, sy, TW, TH);
          continue;
        }

        const ch = rowStr[col] || '#';
        const key = `${col},${row}`;

        // Treat opened chests / dead enemies as floor
        let drawCh = ch;
        if ((ch === 'T' && dungeonState.openedChests[key]) ||
            ((ch === 'E' || ch === 'B') && dungeonState.deadEnemies[key])) {
          drawCh = '.';
        }

        const td = DTILE[drawCh] || DTILE['#'];

        // Background
        ctx.fillStyle = td.bg;
        ctx.fillRect(sx, sy, TW, TH);

        // Wall — draw inner bevel line for depth
        if (drawCh === '#') {
          ctx.strokeStyle = '#2a2a2a';
          ctx.lineWidth = 1;
          ctx.strokeRect(sx + 0.5, sy + 0.5, TW - 1, TH - 1);
          continue;
        }

        // Symbol
        if (td.fg && td.sym) {
          // Enemy glow
          if (drawCh === 'E' || drawCh === 'B') {
            ctx.shadowColor = '#ff3333';
            ctx.shadowBlur = 6;
          }
          ctx.fillStyle = td.fg;
          ctx.fillText(td.sym, cx, cy);
          ctx.shadowBlur = 0;
        }
      }
    }

    // Outer vignette
    const vg = ctx.createRadialGradient(220, 170, 80, 220, 170, 240);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /* ----------------------------------------------------------
     MOVEMENT
     ---------------------------------------------------------- */
  function tryMove(dx, dy) {
    const layout = dungeonState.layout;
    const { x, y } = dungeonState.playerPos;
    const nx = x + dx;
    const ny = y + dy;

    if (ny < 0 || ny >= layout.length) return;
    const row = layout[ny] || '';
    if (nx < 0 || nx >= row.length) return;

    const ch = row[nx];
    const tile = TILE[ch] || TILE['#'];

    if (!tile.passable) {
      // If it's a door, open it
      if (ch === 'D') {
        openDoor(nx, ny);
        return;
      }
      return;
    }

    dungeonState.playerPos = { x: nx, y: ny };
    dungeonState.stepCount++;

    revealAround(dungeonState.playerPos, 3);

    // Check what we stepped on
    checkTileEvent(nx, ny, ch);

    drawDungeonMap();
  }

  function openDoor(x, y) {
    // Replace door with floor in layout
    const layout = dungeonState.layout;
    const rowArr = layout[y].split('');
    rowArr[x] = '.';
    layout[y] = rowArr.join('');
    Game.addMessage('You open the door.', 'msg-info');
    drawDungeonMap();
  }

  /* ----------------------------------------------------------
     TILE EVENTS (stairs, chests, enemies)
     ---------------------------------------------------------- */
  function checkTileEvent(x, y, ch) {
    const key = `${x},${y}`;
    const s = Game.getState();
    const dungeon = DATA.dungeons.find(d => d.id === dungeonState.dungeonId);

    switch (ch) {
      case 'S': {
        // Stairs down
        const nextFloor = dungeonState.floor + 1;
        if (nextFloor > dungeon.floors) {
          Game.addMessage('No more levels below. The dungeon ends here.', 'msg-info');
        } else {
          Game.addMessage(`Descending to floor ${nextFloor}...`, 'msg-info');
          dungeonState.openedChests = {};
          dungeonState.deadEnemies = {};
          Game.showScreen('dungeon', { dungeonId: dungeonState.dungeonId, floor: nextFloor });
        }
        break;
      }
      case 'U': {
        // Stairs up
        if (dungeonState.floor <= 1) {
          Game.addMessage('You ascend back to the surface.', 'msg-info');
          s.currentDungeon = null;
          Game.showScreen('overworld');
        } else {
          const prevFloor = dungeonState.floor - 1;
          Game.addMessage(`Ascending to floor ${prevFloor}...`, 'msg-info');
          dungeonState.openedChests = {};
          dungeonState.deadEnemies = {};
          Game.showScreen('dungeon', { dungeonId: dungeonState.dungeonId, floor: prevFloor });
        }
        break;
      }
      case 'T': {
        if (!dungeonState.openedChests[key]) {
          setTimeout(() => openChest(x, y, dungeon), 100);
        }
        break;
      }
      case 'E': {
        if (!dungeonState.deadEnemies[key]) {
          setTimeout(() => triggerEnemyEncounter(x, y, dungeon, false), 100);
        } else {
          // Random encounter check while walking
          checkRandomEncounter(dungeon);
        }
        break;
      }
      case 'B': {
        if (!dungeonState.deadEnemies[key]) {
          setTimeout(() => triggerEnemyEncounter(x, y, dungeon, true), 100);
        }
        break;
      }
      default: {
        // Random encounter while walking
        if (dungeonState.stepCount % 5 === 0) {
          checkRandomEncounter(dungeon);
        }
      }
    }
  }

  /* ----------------------------------------------------------
     CHEST OPENING
     ---------------------------------------------------------- */
  function openChest(x, y, dungeon) {
    const key = `${x},${y}`;
    dungeonState.openedChests[key] = true;

    const s = Game.getState();
    const floor = dungeonState.floor;

    // Check for quest item on this floor
    if (dungeon.questItem && dungeon.questItemFloor === floor) {
      const qItem = DATA.questItems.find(q => q.id === dungeon.questItem);
      if (qItem) {
        const flagMap = {
          giant_eye:    'giantEyeFound',
          dwarven_rune: 'dwarvenRuneFound',
          light_crystal:'lightCrystalFound',
          dark_shard:   'darkShardFound'
        };
        const flag = flagMap[dungeon.questItem];
        if (flag && !s.questFlags[flag]) {
          s.questFlags[flag] = true;
          Game.addMessage(`You found the ${qItem.name}! A sacred relic!`, 'msg-info');
          Game.addMessage(qItem.desc, 'msg-info');
          Game.save();
          drawDungeonMap();
          return;
        }
      }
    }

    // Random treasure
    const roll = Math.random();
    if (roll < 0.4) {
      // Gold
      const gold = 50 + Math.floor(Math.random() * 100 * floor);
      s.partyGold += gold;
      Game.addMessage(`The chest contains ${gold} gold!`, 'msg-gold');
    } else if (roll < 0.65) {
      // Potion
      const potions = DATA.potions;
      const pot = potions[Math.floor(Math.random() * potions.length)];
      const member = Game.getAliveParty()[0];
      if (member) {
        if (!member.potions) member.potions = [];
        member.potions.push(pot.id);
        Game.addMessage(`Found ${pot.name}! (${member.name})`, 'msg-info');
      }
    } else if (roll < 0.85) {
      // Weapon or armor
      const isWeapon = Math.random() < 0.5;
      const list = isWeapon ? DATA.weapons : DATA.armors;
      const minPrice = floor * 100;
      const valid = list.filter(i => i.price >= minPrice && i.price <= minPrice + 500);
      const item = valid.length > 0
        ? valid[Math.floor(Math.random() * valid.length)]
        : list[Math.floor(Math.random() * list.length)];
      const member = Game.getAliveParty()[0];
      if (member) {
        const slot = isWeapon ? 'weapon' : 'armor';
        member.equipment[slot] = item.id;
        Game.addMessage(`Found ${item.name}! Equipped on ${member.name}.`, 'msg-info');
      }
    } else {
      Game.addMessage('The chest is empty... or was it already looted?', 'msg-info');
    }

    drawDungeonMap();
    Game.save();
  }

  /* ----------------------------------------------------------
     ENEMY ENCOUNTERS
     ---------------------------------------------------------- */
  function triggerEnemyEncounter(x, y, dungeon, isBoss) {
    const key = `${x},${y}`;
    const s = Game.getState();
    const floor = dungeonState.floor;
    const partyLevel = Math.max(...Game.getAliveParty().map(c => c.level));

    // Get encounter table for this dungeon/floor
    const encTable = DATA.dungeonEncounters[dungeon.id];
    const floorEncs = encTable ? (encTable[floor] || encTable[1]) : null;

    let enemies = [];

    if (isBoss && floor === dungeon.floors) {
      // Final floor boss
      const bossId = floorEncs ? floorEncs[Math.floor(Math.random() * floorEncs.length)] : 'demon_lord';
      const bossTemplate = DATA.enemies.find(e => e.id === bossId);
      if (bossTemplate) {
        enemies = [WorldScreen.spawnEnemy(bossTemplate, partyLevel)];
      }
    } else {
      // Normal dungeon encounter: 2-4 enemies from floor table
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const pool = floorEncs || ['goblin','orc','skeleton'];
        const eId = pool[Math.floor(Math.random() * pool.length)];
        const template = DATA.enemies.find(e => e.id === eId);
        if (template) enemies.push(WorldScreen.spawnEnemy(template, partyLevel));
      }
    }

    if (enemies.length === 0) return;

    const names = [...new Set(enemies.map(e => e.name))];
    Game.addMessage(`${names.join(', ')} block your path!`, 'msg-combat');

    Game.showScreen('combat', {
      enemies,
      returnScreen: 'dungeon',
      onVictory: () => {
        dungeonState.deadEnemies[key] = true;

        // Check for quest item in boss fight
        if (isBoss && dungeon.questItem && dungeon.questItemFloor === floor) {
          const qItem = DATA.questItems.find(q => q.id === dungeon.questItem);
          if (qItem) {
            const flagMap = {
              giant_eye:    'giantEyeFound',
              dwarven_rune: 'dwarvenRuneFound',
              light_crystal:'lightCrystalFound',
              dark_shard:   'darkShardFound'
            };
            const flag = flagMap[dungeon.questItem];
            if (flag && !s.questFlags[flag]) {
              s.questFlags[flag] = true;
              Game.addMessage(`Victory! You recover the ${qItem.name}!`, 'msg-info');
              Game.addMessage(qItem.desc, 'msg-info');
              Game.save();
            }
          }
        }

        // Return to dungeon after combat
        Game.showScreen('dungeon', {
          dungeonId: dungeonState.dungeonId,
          floor: dungeonState.floor,
          resetPos: false
        });
      }
    });
  }

  function checkRandomEncounter(dungeon) {
    if (Math.random() > dungeonState.encountRate) return;

    const s = Game.getState();
    const floor = dungeonState.floor;
    const partyLevel = Math.max(...Game.getAliveParty().map(c => c.level));
    const encTable = DATA.dungeonEncounters[dungeon.id];
    const floorEncs = encTable ? (encTable[floor] || encTable[1]) : ['goblin','skeleton','orc'];

    const count = 1 + Math.floor(Math.random() * 3);
    const enemies = [];
    for (let i = 0; i < count; i++) {
      const eId = floorEncs[Math.floor(Math.random() * floorEncs.length)];
      const template = DATA.enemies.find(e => e.id === eId);
      if (template) enemies.push(WorldScreen.spawnEnemy(template, partyLevel));
    }

    if (enemies.length === 0) return;

    const names = [...new Set(enemies.map(e => e.name))];
    Game.addMessage(`Encounter! ${names.join(', ')}!`, 'msg-combat');

    Game.showScreen('combat', {
      enemies,
      returnScreen: 'dungeon',
      onVictory: () => {
        Game.showScreen('dungeon', {
          dungeonId: dungeonState.dungeonId,
          floor: dungeonState.floor,
          resetPos: false
        });
      }
    });
  }

  /* ----------------------------------------------------------
     FIND START POSITION
     ---------------------------------------------------------- */
  function findStartPos(layout, marker) {
    for (let y = 0; y < layout.length; y++) {
      const row = layout[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x] === marker) return { x, y };
      }
    }
    // Default: find first passable floor tile
    for (let y = 0; y < layout.length; y++) {
      const row = layout[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x] === '.') return { x, y };
      }
    }
    return { x: 1, y: 1 };
  }

  /* ----------------------------------------------------------
     GET FLOOR LAYOUT
     For different dungeons, rotate through the floor templates.
     ---------------------------------------------------------- */
  function getFloorLayout(floor) {
    const floorKey = `floor${floor}`;
    const template = DATA.dungeonLayouts[floorKey] || DATA.dungeonLayouts.floor1;
    // Deep copy so we can mutate (door opening etc.)
    return template.map(row => row + '');
  }

  /* ----------------------------------------------------------
     KEY HANDLER
     ---------------------------------------------------------- */
  function handleKey(key) {
    switch (key) {
      case 'ArrowUp':    case 'w': case 'W': tryMove(0, -1); break;
      case 'ArrowDown':  case 's': case 'S': tryMove(0,  1); break;
      case 'ArrowLeft':  case 'a': case 'A': tryMove(-1, 0); break;
      case 'ArrowRight': case 'd': case 'D': tryMove(1,  0); break;
      case 'Enter': case 'e': case 'E': interactAhead(); break;
      case 'p': case 'P':
        Game.showScreen('partymanage', {
          returnScreen: 'dungeon',
          returnData: { dungeonId: dungeonState.dungeonId, floor: dungeonState.floor, resetPos: false }
        });
        break;
      case 'Escape':
        // Leave dungeon entirely
        if (confirm('Leave the dungeon and return to the overworld?')) {
          Game.getState().currentDungeon = null;
          Game.showScreen('overworld');
        }
        break;
    }
  }

  function interactAhead() {
    // Placeholder: check tile directly in front based on last move direction
    // For simplicity, try to interact with all adjacent tiles
    const { x, y } = dungeonState.playerPos;
    const adjacent = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];

    for (const { dx, dy } of adjacent) {
      const nx = x + dx, ny = y + dy;
      const layout = dungeonState.layout;
      if (ny < 0 || ny >= layout.length || nx < 0 || nx >= layout[ny].length) continue;
      const ch = layout[ny][nx];
      if (ch === 'D') {
        openDoor(nx, ny);
        return;
      }
    }
    Game.addMessage('Nothing to interact with nearby.', 'msg-info');
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    render,
    handleKey
  };

})();
