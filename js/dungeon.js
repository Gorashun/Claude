/* ============================================================
   VALDORIA: THE DARK ASCENSION - DUNGEON EXPLORATION
   Pixel-art map rendering, movement, traps, chests, boss fights
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
    'S': { name: 'Stairs Down',passable: true,  css: 'stairs', sym: '\u25bc' },
    'U': { name: 'Stairs Up',  passable: true,  css: 'stairs', sym: '\u25b2' },
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
    layout: null,
    playerPos: { x: 2, y: 1 },
    openedChests: {},
    deadEnemies: {},
    revealed: null,
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

    if (data.resetPos !== false) {
      const startPos = findStartPos(dungeonState.layout, floor === 1 ? 'U' : 'S');
      dungeonState.playerPos = startPos || { x: 2, y: 1 };
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
              <span style="color:var(--grey)">#</span> Wall<br>
              <span style="color:var(--orange)">D</span> Door<br>
              <span style="color:var(--cyan)">\u25bc\u25b2</span> Stairs<br>
              <span style="color:var(--yellow)">T</span> Chest<br>
              <span style="color:var(--fg)">@</span> Party<br>
              <span style="color:var(--red)">E/B</span> Enemy
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
    const chestCount = Object.keys(dungeonState.openedChests).length;
    return `
      <div class="dungeon-info">
        <div style="color:var(--grey);font-size:12px;margin-bottom:4px">STATUS</div>
        <div style="color:var(--white);font-size:12px">
          Gold: <span style="color:var(--yellow)">${s.partyGold}</span>
        </div>
        <div style="color:var(--grey);font-size:12px">
          Chests opened: ${chestCount}
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
     DRAW DUNGEON MAP — Canvas renderer (Sprites module when available)
     ---------------------------------------------------------- */
  function drawDungeonMap() {
    const canvas = document.getElementById('dungeon-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const layout = dungeonState.layout;
    const pp = dungeonState.playerPos;

    const TW = 20, TH = 20;
    const VIEW_W = 22, VIEW_H = 17;

    const mapH = layout.length;
    const mapW = (layout[0] || '').length;
    const startX = Math.max(0, Math.min(pp.x - Math.floor(VIEW_W / 2), mapW - VIEW_W));
    const startY = Math.max(0, Math.min(pp.y - Math.floor(VIEW_H / 2), mapH - VIEW_H));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const useSprites = typeof Sprites !== 'undefined';

    // Fallback palette
    const DTILE = {
      '#': '#1a1a1a', '.': '#050505', 'D': '#221100',
      'S': '#001a1a', 'U': '#001a1a', 'T': '#1a1200',
      'E': '#1a0000', 'B': '#1a0000'
    };

    for (let row = startY; row < Math.min(startY + VIEW_H, mapH); row++) {
      const rowStr = layout[row] || '';
      for (let col = startX; col < Math.min(startX + VIEW_W, rowStr.length); col++) {
        const sx = (col - startX) * TW;
        const sy = (row - startY) * TH;

        const revealed = dungeonState.revealed &&
                         dungeonState.revealed[row] &&
                         dungeonState.revealed[row][col];

        if (!revealed) {
          ctx.fillStyle = '#000';
          ctx.fillRect(sx, sy, TW, TH);
          continue;
        }

        if (col === pp.x && row === pp.y) {
          if (useSprites) {
            Sprites.drawDungeonTile(ctx, '.', sx, sy);
            Sprites.drawPartyMarker(ctx, sx, sy);
          } else {
            ctx.fillStyle = '#001a00';
            ctx.fillRect(sx, sy, TW, TH);
            ctx.fillStyle = '#33ff33';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('@', sx + TW / 2, sy + TH / 2);
          }
          continue;
        }

        const ch = rowStr[col] || '#';
        const key = `${col},${row}`;
        let drawCh = ch;
        if ((ch === 'T' && dungeonState.openedChests[key]) ||
            ((ch === 'E' || ch === 'B') && dungeonState.deadEnemies[key])) {
          drawCh = '.';
        }

        if (useSprites) {
          Sprites.drawDungeonTile(ctx, drawCh, sx, sy);
        } else {
          ctx.fillStyle = DTILE[drawCh] || '#1a1a1a';
          ctx.fillRect(sx, sy, TW, TH);
          if (drawCh === '#') {
            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx + 0.5, sy + 0.5, TW - 1, TH - 1);
          }
        }
      }
    }

    // Vignette
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
      if (ch === 'D') { openDoor(nx, ny); return; }
      return;
    }

    dungeonState.playerPos = { x: nx, y: ny };
    dungeonState.stepCount++;
    revealAround(dungeonState.playerPos, 3);
    checkTileEvent(nx, ny, ch);
    drawDungeonMap();
  }

  function openDoor(x, y) {
    const layout = dungeonState.layout;
    const rowArr = layout[y].split('');
    rowArr[x] = '.';
    layout[y] = rowArr.join('');
    Game.addMessage('You open the door.', 'msg-info');
    drawDungeonMap();
  }

  /* ----------------------------------------------------------
     TILE EVENTS
     ---------------------------------------------------------- */
  function checkTileEvent(x, y, ch) {
    const key = `${x},${y}`;
    const s = Game.getState();
    const dungeon = DATA.dungeons.find(d => d.id === dungeonState.dungeonId);

    switch (ch) {
      case 'S': {
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

    // Check for quest item (Seal) on this floor
    if (dungeon.questItem && dungeon.questItemFloor === floor) {
      const qItem = DATA.questItems ? DATA.questItems.find(q => q.id === dungeon.questItem) : null;
      if (qItem) {
        const flag = qItem.flag;
        if (flag && !s.questFlags[flag]) {
          s.questFlags[flag] = true;
          Game.addMessage(`You found the ${qItem.name}!`, 'msg-info');
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
      const gold = 50 + Math.floor(Math.random() * 100 * floor);
      s.partyGold += gold;
      Game.addMessage(`The chest contains ${gold} gold!`, 'msg-gold');
    } else if (roll < 0.65) {
      const potions = DATA.potions || [];
      if (potions.length > 0) {
        const pot = potions[Math.floor(Math.random() * potions.length)];
        const member = Game.getAliveParty()[0];
        if (member) {
          if (!member.potions) member.potions = [];
          member.potions.push(pot.id);
          Game.addMessage(`Found ${pot.name}! (${member.name})`, 'msg-info');
        }
      }
    } else if (roll < 0.85) {
      const isWeapon = Math.random() < 0.5;
      const list = isWeapon ? DATA.weapons : DATA.armors;
      const minPrice = floor * 100;
      const valid = list.filter(i => (i.price || i.val || 0) >= minPrice);
      const item = valid.length > 0
        ? valid[Math.floor(Math.random() * valid.length)]
        : list[Math.floor(Math.random() * list.length)];
      const member = Game.getAliveParty()[0];
      if (member && item) {
        const slot = isWeapon ? 'weapon' : 'armor';
        member.equipment[slot] = item.id;
        Game.addMessage(`Found ${item.name}! Equipped on ${member.name}.`, 'msg-info');
      }
    } else {
      Game.addMessage('The chest is empty.', 'msg-info');
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

    const floorEncs = dungeon.enemyTable || ['goblin', 'orc', 'skeleton'];
    let enemies = [];

    if (isBoss && floor === dungeon.floors) {
      const bossId = dungeon.bossId || floorEncs[Math.floor(Math.random() * floorEncs.length)];
      const bossTemplate = DATA.enemies.find(e => e.id === bossId);
      if (bossTemplate) {
        enemies = [WorldScreen.spawnEnemy(bossTemplate, partyLevel)];
      }
    } else {
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const eId = floorEncs[Math.floor(Math.random() * floorEncs.length)];
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

        // Award Seal on boss defeat
        if (isBoss && dungeon.questItem && dungeon.questItemFloor === floor) {
          const qItem = DATA.questItems ? DATA.questItems.find(q => q.id === dungeon.questItem) : null;
          if (qItem) {
            const flag = qItem.flag;
            if (flag && !s.questFlags[flag]) {
              s.questFlags[flag] = true;
              Game.addMessage(`Victory! You recover the ${qItem.name}!`, 'msg-info');
              Game.addMessage(qItem.desc, 'msg-info');
              Game.save();
            }
          }
        }

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

    const partyLevel = Math.max(...Game.getAliveParty().map(c => c.level));
    const floorEncs = dungeon.enemyTable || ['goblin', 'skeleton', 'orc'];

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
    for (let y = 0; y < layout.length; y++) {
      const row = layout[y];
      for (let x = 0; x < row.length; x++) {
        if (row[x] === '.') return { x, y };
      }
    }
    return { x: 2, y: 1 };
  }

  /* ----------------------------------------------------------
     GET FLOOR LAYOUT — reads from DATA.dungeonFloors per dungeon
     ---------------------------------------------------------- */
  function getFloorLayout(floor) {
    const id = dungeonState.dungeonId;
    const floors = DATA.dungeonFloors && DATA.dungeonFloors[id];
    if (floors && floors[floor - 1]) {
      return floors[floor - 1].map(row => row + '');
    }
    // Minimal fallback layout
    const G = [];
    for (let r = 0; r < 15; r++) {
      if (r === 0 || r === 14) {
        G.push('#'.repeat(25));
      } else if (r === 1) {
        G.push('#U' + '.'.repeat(22) + '#');
      } else if (r === 13) {
        G.push('#S' + '.'.repeat(22) + '#');
      } else {
        G.push('#.' + '#'.repeat(10) + '.' + '#'.repeat(10) + '.#');
      }
    }
    return G;
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
        if (confirm('Leave the dungeon and return to the overworld?')) {
          Game.getState().currentDungeon = null;
          Game.showScreen('overworld');
        }
        break;
    }
  }

  function interactAhead() {
    const { x, y } = dungeonState.playerPos;
    const adjacent = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];
    for (const { dx, dy } of adjacent) {
      const nx = x + dx, ny = y + dy;
      const layout = dungeonState.layout;
      if (ny < 0 || ny >= layout.length || nx < 0 || nx >= layout[ny].length) continue;
      if (layout[ny][nx] === 'D') { openDoor(nx, ny); return; }
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
