/* ============================================================
   VALDORIA: THE DARK ASCENSION - OVERWORLD MAP & EXPLORATION
   Tile-based movement, random encounters, location events
   ============================================================ */

const WorldScreen = (function() {
  'use strict';

  /* ----------------------------------------------------------
     TILE DEFINITIONS
     ---------------------------------------------------------- */
  const TILES = {
    '~': { name: 'Ocean',        passable: false, sym: '~', css: 'water',    encounter: false },
    '.': { name: 'Grassland',    passable: true,  sym: '.', css: 'grass',    encounter: true,  encRate: 0.12 },
    'f': { name: 'Forest',       passable: true,  sym: 'f', css: 'forest',   encounter: true,  encRate: 0.18 },
    '^': { name: 'Mountain',     passable: true,  sym: '^', css: 'mountain', encounter: true,  encRate: 0.10 },
    '=': { name: 'Road',         passable: true,  sym: '=', css: 'road',     encounter: true,  encRate: 0.06 },
    'P': { name: 'Plains',       passable: true,  sym: 'P', css: 'plains',   encounter: true,  encRate: 0.10 },
    'T': { name: 'Town',         passable: true,  sym: 'T', css: 'town',     encounter: false, isTown: true },
    'D': { name: 'Dungeon',      passable: true,  sym: 'D', css: 'dungeon',  encounter: false, isDungeon: true },
    'R': { name: 'Ancient Ruins',passable: true,  sym: 'R', css: 'ruins',    encounter: true,  encRate: 0.15, isRuins: true },
    'X': { name: 'Sacred Shrine',passable: true,  sym: 'X', css: 'shrine',   encounter: false, isShrine: true },
    's': { name: 'Swamp',        passable: true,  sym: 's', css: 'swamp',    encounter: true,  encRate: 0.20 },
    'G': { name: 'Glacier',      passable: true,  sym: 'G', css: 'tundra',   encounter: true,  encRate: 0.08 }
  };

  /* ----------------------------------------------------------
     WILDERNESS ENCOUNTER TABLE (overworld)
     ---------------------------------------------------------- */
  const WILD_ENCOUNTERS = [
    { group: [['goblin',2,5]],            minLevel: 1, maxLevel: 3,  terrain: ['grass','plains','road'] },
    { group: [['orc',2,4]],               minLevel: 1, maxLevel: 4,  terrain: ['grass','plains','road'] },
    { group: [['wolf',2,5]],              minLevel: 1, maxLevel: 3,  terrain: ['forest'] },
    { group: [['shadow_wolf',1,3]],        minLevel: 2, maxLevel: 6,  terrain: ['forest','swamp'] },
    { group: [['bandit',2,4]],            minLevel: 1, maxLevel: 5,  terrain: ['road','grass'] },
    { group: [['gnoll',2,3],['goblin',1,2]], minLevel: 3, maxLevel: 6, terrain: ['forest','plains'] },
    { group: [['orc',2,3],['goblin',2,3]], minLevel: 2, maxLevel: 5, terrain: ['grass','road'] },
    { group: [['troll',1,2]],             minLevel: 4, maxLevel: 8,  terrain: ['forest','mountain'] },
    { group: [['ogre',1,2]],              minLevel: 5, maxLevel: 9,  terrain: ['mountain','plains'] },
    { group: [['skeleton',2,5]],          minLevel: 2, maxLevel: 6,  terrain: ['grass','plains','ruins'] },
    { group: [['zombie',2,4]],            minLevel: 3, maxLevel: 7,  terrain: ['forest','plains','swamp'] },
    { group: [['harpy',2,3]],             minLevel: 4, maxLevel: 8,  terrain: ['mountain'] },
    { group: [['minotaur',1,2]],          minLevel: 5, maxLevel: 10, terrain: ['mountain','ruins'] },
    { group: [['dark_priest',1,2],['skeleton',2,3]], minLevel: 5, maxLevel: 10, terrain: ['ruins','swamp'] },
    { group: [['cultist',2,4]],           minLevel: 4, maxLevel: 9,  terrain: ['swamp','ruins'] },
    { group: [['dragon',1,1]],            minLevel: 8, maxLevel: 15, terrain: ['mountain','tundra'] },
    { group: [['wyvern',1,2]],            minLevel: 6, maxLevel: 12, terrain: ['mountain','tundra'] }
  ];

  /* ----------------------------------------------------------
     RENDER OVERWORLD
     ---------------------------------------------------------- */
  function render(main) {
    const s = Game.getState();
    main.innerHTML = `
      <div id="screen-overworld">
        <div id="map-container">
          <canvas id="overworld-canvas" width="600" height="384"></canvas>
        </div>
        <div id="map-sidebar">
          <div class="location-info" id="loc-info">
            <div style="color:var(--cyan);font-size:12px;letter-spacing:2px;margin-bottom:6px">LOCATION</div>
            <div id="loc-name" style="color:var(--yellow)">Valdoria</div>
            <div id="loc-desc" style="color:var(--grey);font-size:12px;margin-top:4px"></div>
          </div>
          <div class="compass">
            &nbsp;N<br>W&nbsp;+&nbsp;E<br>&nbsp;S
          </div>
          <div class="location-info">
            <div style="color:var(--grey);font-size:12px;margin-bottom:4px">CONTROLS</div>
            <div class="map-legend">
              <div>Arrow/WASD: Move</div>
              <div>Enter/E: Enter location</div>
              <div>P: Party screen</div>
              <div>S: Save</div>
              <div style="margin-top:6px">
                <span style="color:var(--yellow)">T</span> = Town<br>
                <span style="color:var(--red)">D</span> = Dungeon<br>
                <span style="color:var(--cyan)">X</span> = Shrine<br>
                <span style="color:var(--orange)">R</span> = Ruins<br>
                <span style="color:var(--fg)">@</span> = Party
              </div>
            </div>
          </div>
          <div class="location-info">
            <div style="color:var(--grey);font-size:12px;margin-bottom:4px">PARTY GOLD</div>
            <div style="color:var(--yellow)">${s.partyGold}</div>
          </div>
          ${buildQuestStatus(s)}
        </div>
      </div>
    `;
    drawMap();
    updateLocationInfo();
  }

  function buildQuestStatus(s) {
    const q = s.questFlags;
    const items = [
      { flag: 'sealOfFlameFound', name: 'Seal of Flame' },
      { flag: 'sealOfStoneFound', name: 'Seal of Stone' },
      { flag: 'sealOfWaveFound',  name: 'Seal of Wave'  },
      { flag: 'sealOfLightFound', name: 'Seal of Light' }
    ];
    const found = items.filter(i => q[i.flag]).length;
    if (found === 0) return '';
    return `
      <div class="location-info">
        <div style="color:var(--cyan);font-size:12px;margin-bottom:4px">SEALS (${found}/4)</div>
        ${items.map(i => q[i.flag]
          ? `<div style="color:var(--yellow);font-size:12px">&#10003; ${i.name}</div>`
          : `<div style="color:var(--grey);font-size:12px">- ${i.name}</div>`
        ).join('')}
      </div>
    `;
  }

  /* ----------------------------------------------------------
     DRAW MAP — Canvas tile renderer (uses Sprites module when available)
     ---------------------------------------------------------- */
  function drawMap() {
    const s = Game.getState();
    const canvas = document.getElementById('overworld-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const mapData = DATA.overworldMap;
    const px = s.worldPos.x;
    const py = s.worldPos.y;

    const TW = 24, TH = 24;
    const VIEW_W = 25, VIEW_H = 16;
    const mapH = mapData.length;
    const mapW = (mapData[0] || '').length;

    const startX = Math.max(0, Math.min(px - Math.floor(VIEW_W / 2), mapW - VIEW_W));
    const startY = Math.max(0, Math.min(py - Math.floor(VIEW_H / 2), mapH - VIEW_H));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const useSprites = typeof Sprites !== 'undefined';

    for (let row = startY; row < Math.min(startY + VIEW_H, mapH); row++) {
      const rowStr = mapData[row] || '';
      for (let col = startX; col < Math.min(startX + VIEW_W, rowStr.length); col++) {
        const sx = (col - startX) * TW;
        const sy = (row - startY) * TH;

        const ch = rowStr[col] || '~';

        if (useSprites) {
          Sprites.drawTile(ctx, ch, sx, sy);
          if (col === px && row === py) {
            Sprites.drawPartyMarker(ctx, sx, sy);
          }
        } else {
          // Minimal fallback
          const FALLBACK = {
            '~': '#000a22', '.': '#0d3a0d', 'f': '#002200',
            '^': '#2a2a2a', '=': '#1a1008', 'P': '#0f2a0f',
            'T': '#221100', 'D': '#1a0000', 'R': '#1a0e00',
            'X': '#001a22', 's': '#041a04', 'G': '#1a1a2a'
          };
          ctx.fillStyle = FALLBACK[ch] || '#0d3a0d';
          ctx.fillRect(sx, sy, TW, TH);
          if (col === px && row === py) {
            ctx.fillStyle = '#33ff33';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 16px monospace';
            ctx.fillText('@', sx + TW / 2, sy + TH / 2);
          }
        }
      }
    }

    // Subtle grid overlay
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let c = 0; c <= VIEW_W; c++) {
      ctx.beginPath(); ctx.moveTo(c * TW, 0); ctx.lineTo(c * TW, VIEW_H * TH); ctx.stroke();
    }
    for (let r = 0; r <= VIEW_H; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * TH); ctx.lineTo(VIEW_W * TW, r * TH); ctx.stroke();
    }

    // Vignette
    const vg = ctx.createRadialGradient(300, 192, 140, 300, 192, 310);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  /* ----------------------------------------------------------
     LOCATION INFO PANEL
     ---------------------------------------------------------- */
  function updateLocationInfo() {
    const s = Game.getState();
    const nameEl = document.getElementById('loc-name');
    const descEl = document.getElementById('loc-desc');
    if (!nameEl) return;

    const { x, y } = s.worldPos;
    const tileChar = getTileAt(x, y);
    const tile = TILES[tileChar] || TILES['.'];

    const town = DATA.towns.find(t => t.x === x && t.y === y);
    const dungeon = DATA.dungeons.find(d => d.x === x && d.y === y);

    if (town) {
      nameEl.textContent = town.name;
      descEl.textContent = (town.desc || '') + ' [Enter to enter town]';
    } else if (dungeon) {
      nameEl.textContent = dungeon.name;
      descEl.textContent = (dungeon.desc || '') + ' [Enter to enter dungeon]';
    } else {
      nameEl.textContent = tile.name;
      descEl.textContent = `Position: (${x}, ${y})`;
    }
  }

  /* ----------------------------------------------------------
     MOVEMENT
     ---------------------------------------------------------- */
  function tryMove(dx, dy) {
    const s = Game.getState();
    const newX = s.worldPos.x + dx;
    const newY = s.worldPos.y + dy;

    const mapData = DATA.overworldMap;
    if (newY < 0 || newY >= mapData.length) return;
    const row = mapData[newY] || '';
    if (newX < 0 || newX >= row.length) return;

    const tileChar = row[newX];
    const tile = TILES[tileChar];
    if (!tile || !tile.passable) {
      Game.addMessage('The way is blocked.', 'msg-info');
      return;
    }

    s.worldPos.x = newX;
    s.worldPos.y = newY;
    s.visitedTiles[`${newX},${newY}`] = true;

    drawMap();
    updateLocationInfo();

    // Check for Gloomhaven-style exploration event first
    if (typeof Events !== 'undefined' && tile.encounter) {
      if (Events.checkStep(tile.css)) return;
    }

    // Check for random combat encounter
    if (tile.encounter && checkEncounter(tile, s)) {
      triggerWildEncounter(tile.css);
    }
  }

  function checkEncounter(tile, s) {
    const rate = tile.encRate || 0.12;
    return Math.random() < rate;
  }

  function triggerWildEncounter(terrain) {
    const s = Game.getState();
    const partyLevel = Math.max(...s.party.filter(c => c.alive).map(c => c.level));

    const valid = WILD_ENCOUNTERS.filter(e =>
      e.terrain.includes(terrain) &&
      e.minLevel <= partyLevel + 3
    );

    if (valid.length === 0) return;

    const enc = valid[Math.floor(Math.random() * valid.length)];
    const enemies = [];

    enc.group.forEach(([id, min, max]) => {
      const baseEnemy = DATA.enemies.find(e => e.id === id);
      if (!baseEnemy) return;
      const count = min + Math.floor(Math.random() * (max - min + 1));
      for (let i = 0; i < count; i++) {
        enemies.push(spawnEnemy(baseEnemy, partyLevel));
      }
    });

    if (enemies.length === 0) return;

    const names = [...new Set(enemies.map(e => e.name))];
    Game.addMessage(`Encounter! ${names.join(', ')} attacks!`, 'msg-combat');

    Game.showScreen('combat', {
      enemies,
      returnScreen: 'overworld',
      onVictory: null
    });
  }

  /* ----------------------------------------------------------
     SPAWN ENEMY (scale to party level)
     ---------------------------------------------------------- */
  function spawnEnemy(template, partyLevel) {
    const hpRoll = template.hp[0] + Math.floor(Math.random() * template.hp[1]);
    const scaleMult = 1 + Math.max(0, partyLevel - 3) * 0.15;
    const hp = Math.floor(hpRoll * scaleMult);

    return {
      ...template,
      uid:       Math.random().toString(36).slice(2),
      hpMax:     hp,
      hpCur:     hp,
      status:    [],
      scaledStr: Math.floor(template.str * (1 + Math.max(0, partyLevel - 3) * 0.1))
    };
  }

  /* ----------------------------------------------------------
     ENTER LOCATION (towns / dungeons)
     ---------------------------------------------------------- */
  function enterLocation() {
    const s = Game.getState();
    const { x, y } = s.worldPos;

    const town = DATA.towns.find(t => t.x === x && t.y === y);
    if (town) {
      Game.addMessage(`Entering ${town.name}...`, 'msg-info');
      Game.showScreen('town', { townId: town.id });
      return;
    }

    const dungeon = DATA.dungeons.find(d => d.x === x && d.y === y);
    if (dungeon) {
      // Malachar's Citadel requires all four Seals
      if (dungeon.requiresItems && dungeon.requiresItems.length > 0) {
        const q = s.questFlags;
        const hasAll = q.sealOfFlameFound && q.sealOfStoneFound &&
                       q.sealOfWaveFound  && q.sealOfLightFound;
        if (!hasAll) {
          Game.addMessage('The gates are sealed by shadow. You need the four Seals of Power.', 'msg-info');
          return;
        }
        if (!q.malacharConfronted) {
          q.malacharConfronted = true;
          Game.showScreen('malachar');
          return;
        }
      }

      Game.addMessage(`Entering ${dungeon.name}...`, 'msg-info');
      if (!s.dungeonProgress[dungeon.id]) {
        s.dungeonProgress[dungeon.id] = { floorsVisited: [], chestsTaken: [], enemiesDefeated: [] };
      }
      s.currentDungeon = dungeon.id;
      s.dungeonPos = { x: 2, y: 1, floor: 1 };
      Game.showScreen('dungeon', { dungeonId: dungeon.id, floor: 1 });
      return;
    }

    // Sacred shrines restore HP/MP
    const tileChar = getTileAt(x, y);
    if (tileChar === 'X') {
      const alive = Game.getAliveParty();
      alive.forEach(ch => {
        ch.hp.current = ch.hp.max;
        ch.mp.current = ch.mp.max;
      });
      Game.addMessage('The sacred shrine restores your party to full health!', 'msg-info');
      return;
    }

    Game.addMessage('Nothing here to enter.', 'msg-info');
  }

  /* ----------------------------------------------------------
     KEY HANDLER
     ---------------------------------------------------------- */
  function handleKey(key) {
    switch (key) {
      case 'ArrowUp':    case 'w': case 'W': tryMove(0, -1);  break;
      case 'ArrowDown':  case 's': case 'S': tryMove(0,  1);  break;
      case 'ArrowLeft':  case 'a': case 'A': tryMove(-1, 0);  break;
      case 'ArrowRight': case 'd': case 'D': tryMove(1,  0);  break;
      case 'Enter': case 'e': case 'E': enterLocation(); break;
      case 'p': case 'P':
        Game.showScreen('partymanage', { returnScreen: 'overworld' });
        break;
      case 'Escape':
        Game.save();
        break;
    }
  }

  /* ----------------------------------------------------------
     UTILITY
     ---------------------------------------------------------- */
  function getTileAt(x, y) {
    const mapData = DATA.overworldMap;
    if (y < 0 || y >= mapData.length) return '~';
    const row = mapData[y] || '';
    return row[x] || '~';
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    render,
    handleKey,
    tryMove,
    enterLocation,
    spawnEnemy
  };

})();
