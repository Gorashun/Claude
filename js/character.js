/* ============================================================
   PHANTASIE III - CHARACTER SYSTEM
   Creation, stat rolling, leveling, character sheet
   ============================================================ */

const CharScreen = (function() {
  'use strict';

  /* ----------------------------------------------------------
     CHARACTER FACTORY
     ---------------------------------------------------------- */
  let charIdCounter = 1;

  function createCharacter(name, raceId, classId) {
    const race = DATA.races.find(r => r.id === raceId);
    const cls  = DATA.classes.find(c => c.id === classId);
    const socialClass = rollSocialClass();

    // Roll base stats 3d6 clamped 3-18, then apply racial mods
    const baseStats = rollStats();
    const stats = {
      str: clamp(baseStats.str + race.statBonus.str, 3, 22),
      dex: clamp(baseStats.dex + race.statBonus.dex, 3, 22),
      con: clamp(baseStats.con + race.statBonus.con, 3, 22),
      int: clamp(baseStats.int + race.statBonus.int, 3, 22),
      cha: clamp(baseStats.cha + race.statBonus.cha, 3, 22)
    };

    const hpMax = Math.max(1, roll(1, cls.hpDie) + statMod(stats.con));
    const mpMax = cls.mpDie > 0 ? Math.max(0, roll(1, cls.mpDie) + statMod(stats.int)) : 0;

    // Starting spells from class definition
    const startSpells = [...cls.startSpells];

    // Starting equipment (very basic)
    const startWeapon = getStartWeapon(classId);
    const startArmor  = getStartArmor(classId);

    return {
      id:          charIdCounter++,
      name,
      race:        raceId,
      class:       classId,
      socialClass: socialClass.id,
      level:       1,
      xp:          0,
      xpToNext:    xpForLevel(2),
      stats,
      hp:   { current: hpMax, max: hpMax },
      mp:   { current: mpMax, max: mpMax },
      equipment: {
        weapon: startWeapon,
        armor:  startArmor,
        shield: 'none'
      },
      spells:   startSpells,
      wounds:   {
        head:     'ok',
        torso:    'ok',
        leftArm:  'ok',
        rightArm: 'ok',
        leftLeg:  'ok',
        rightLeg: 'ok'
      },
      rank:  'front',
      alive: true,
      gold:  socialClass.goldPerLevel
    };
  }

  function rollStats() {
    return {
      str: roll(3, 6),
      dex: roll(3, 6),
      con: roll(3, 6),
      int: roll(3, 6),
      cha: roll(3, 6)
    };
  }

  function rollSocialClass() {
    const r = Math.random();
    if (r < 0.45) return DATA.socialClasses[0]; // Peasant 45%
    if (r < 0.75) return DATA.socialClasses[1]; // Laborer 30%
    if (r < 0.92) return DATA.socialClasses[2]; // Craftsman 17%
    return DATA.socialClasses[3];               // Noble 8%
  }

  function statMod(val) {
    if (val <= 3)  return -3;
    if (val <= 5)  return -2;
    if (val <= 8)  return -1;
    if (val <= 12) return  0;
    if (val <= 15) return  1;
    if (val <= 17) return  2;
    return 3;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function roll(count, sides) {
    let t = 0;
    for (let i = 0; i < count; i++) t += 1 + Math.floor(Math.random() * sides);
    return t;
  }

  function xpForLevel(level) {
    return level * level * 500;
  }

  function getStartWeapon(classId) {
    const map = {
      fighter: 'shortsw', priest: 'mace', wizard: 'staff',
      monk: 'fists', ranger: 'shortsw', thief: 'dagger'
    };
    return map[classId] || 'dagger';
  }

  function getStartArmor(classId) {
    const map = {
      fighter: 'leather', priest: 'leather', wizard: 'cloth',
      monk: 'cloth', ranger: 'leather', thief: 'leather'
    };
    return map[classId] || 'cloth';
  }

  /* ----------------------------------------------------------
     LEVELING
     ---------------------------------------------------------- */
  function canLevelUp(char) {
    return char.xp >= char.xpToNext;
  }

  function levelUpCost(char) {
    const cls     = DATA.classes.find(c => c.id === char.class);
    const social  = DATA.socialClasses.find(s => s.id === char.socialClass);
    const race    = DATA.races.find(r => r.id === char.race);
    const baseCost = cls.trainCost * char.level;
    // Beast races cost more
    const raceMult = race.beast ? 3 : 1;
    // High charisma reduces cost
    const chaMult  = Math.max(0.5, 1.0 - (char.stats.cha - 10) * 0.03);
    return Math.floor(baseCost * raceMult * chaMult);
  }

  function applyLevelUp(char, chosenImprovements) {
    char.level++;
    char.xp = 0;
    char.xpToNext = xpForLevel(char.level + 1);

    const cls = DATA.classes.find(c => c.id === char.class);

    // Base HP/MP increase each level
    const hpGain = Math.max(1, roll(1, cls.hpDie) + statMod(char.stats.con));
    const mpGain = cls.mpDie > 0 ? Math.max(0, roll(1, cls.mpDie) + statMod(char.stats.int)) : 0;
    char.hp.max += hpGain;
    char.hp.current += hpGain;
    char.mp.max += mpGain;
    char.mp.current += mpGain;

    // Apply chosen training improvements
    chosenImprovements.forEach(opt => applyTrainingOption(char, opt));

    // Gold per level from social class
    const social = DATA.socialClasses.find(s => s.id === char.socialClass);
    char.gold += social.goldPerLevel;

    return { hpGain, mpGain };
  }

  function applyTrainingOption(char, optId) {
    const actions = {
      hp_up:  () => { char.hp.max += 5; char.hp.current += 5; },
      mp_up:  () => { char.mp.max += 5; char.mp.current += 5; },
      str_up: () => char.stats.str++,
      dex_up: () => char.stats.dex++,
      con_up: () => char.stats.con++,
      int_up: () => char.stats.int++,
      cha_up: () => char.stats.cha++,
      hit_up: () => { /* tracked as hitBonus in combat */ char.hitBonus = (char.hitBonus || 0) + 1; },
      ac_up:  () => { char.acBonus = (char.acBonus || 0) + 1; }
    };
    if (actions[optId]) actions[optId]();
  }

  function getAvailableSpells(char) {
    const cls = DATA.classes.find(c => c.id === char.class);
    return DATA.spells.filter(sp =>
      cls.classSpells.includes(sp.id) &&
      sp.level <= char.level &&
      !char.spells.includes(sp.id)
    );
  }

  /* ----------------------------------------------------------
     NEW GAME - PARTY CREATION FLOW
     ---------------------------------------------------------- */
  let creationState = {
    mode: 'intro',   // intro -> selectRace -> selectClass -> enterName -> rollStats -> confirm
    raceId: null,
    classId: null,
    name: '',
    rolledStats: null,
    tempChar: null,
    partyBeingBuilt: []
  };

  function renderNewGame(main) {
    creationState = {
      mode: 'intro',
      raceId: null, classId: null, name: '', rolledStats: null,
      tempChar: null, partyBeingBuilt: []
    };
    renderCreationStep(main);
  }

  function renderCreate(main, data) {
    if (data && data.mode) creationState.mode = data.mode;
    renderCreationStep(main);
  }

  function renderCreationStep(main) {
    switch (creationState.mode) {
      case 'intro':      renderIntro(main);       break;
      case 'selectRace': renderRaceSelect(main);  break;
      case 'selectClass':renderClassSelect(main); break;
      case 'enterName':  renderNameEntry(main);   break;
      case 'rollStats':  renderStatRoll(main);    break;
      case 'partyBuild': renderPartyBuild(main);  break;
    }
  }

  function renderIntro(main) {
    main.innerHTML = `
      <div style="padding:20px;max-width:600px;margin:0 auto">
        <div class="panel-title">THE QUEST BEGINS</div>
        <div class="panel" style="margin:0;line-height:1.8;color:var(--white)">
          <p>The Shadow King <span class="text-red">Lord Malachar</span> has cast his dark blight upon the realm of
          <span class="text-yellow">Valdoria</span>. His shadow armies spread from the southern Citadel,
          crushing all who resist.</p>
          <br>
          <p>You must assemble a party of brave adventurers to challenge his power. Seek the four
          Seals of Power scattered across the land — Flame, Stone, Wave, and Light. With them, you may
          breach his Citadel and end his reign — or perhaps embrace the shadow...</p>
          <br>
          <p class="text-cyan">You may create up to 6 party members. You need at least 1 to begin.</p>
        </div>
        <div style="margin-top:16px;display:flex;gap:10px">
          <button class="btn btn-primary" id="btn-create-party">[ ASSEMBLE PARTY ]</button>
          <button class="btn" id="btn-back-title">[ BACK ]</button>
        </div>
      </div>
    `;
    document.getElementById('btn-create-party').onclick = () => {
      creationState.mode = 'partyBuild';
      renderCreationStep(main);
    };
    document.getElementById('btn-back-title').onclick = () => Game.showScreen('title');
  }

  function renderPartyBuild(main) {
    const party = creationState.partyBeingBuilt;
    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">ASSEMBLE YOUR PARTY (${party.length}/6)</div>
        ${party.length > 0 ? `
        <div style="margin-bottom:12px">
          <table class="party-table">
            <thead><tr>
              <th>Name</th><th>Race</th><th>Class</th>
              <th>Level</th><th>HP</th><th>STR</th><th>DEX</th><th>INT</th>
            </tr></thead>
            <tbody>
              ${party.map((ch, i) => `
                <tr>
                  <td class="text-yellow">${ch.name}</td>
                  <td>${DATA.races.find(r=>r.id===ch.race).name}</td>
                  <td>${DATA.classes.find(c=>c.id===ch.class).name}</td>
                  <td>${ch.level}</td>
                  <td>${ch.hp.max}</td>
                  <td>${ch.stats.str}</td>
                  <td>${ch.stats.dex}</td>
                  <td>${ch.stats.int}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : `<p class="text-grey" style="margin:12px 0">No party members yet. Create your first adventurer!</p>`}
        <div style="display:flex;gap:10px;margin-top:8px">
          ${party.length < 6 ? `<button class="btn btn-primary" id="btn-add-char">[ ADD ADVENTURER ]</button>` : ''}
          ${party.length >= 1 ? `<button class="btn btn-primary" id="btn-start-game">[ BEGIN ADVENTURE ]</button>` : ''}
          <button class="btn" id="btn-back-intro">[ BACK ]</button>
        </div>
      </div>
    `;

    const btnAdd = document.getElementById('btn-add-char');
    if (btnAdd) btnAdd.onclick = () => {
      creationState.mode = 'selectRace';
      renderCreationStep(main);
    };

    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) btnStart.onclick = () => {
      const s = Game.getState();
      s.party = creationState.partyBeingBuilt;
      s.partyGold = 100;  // Starting gold
      Game.addMessage('Your party sets out from Pendragon!', 'msg-info');
      Game.showScreen('overworld');
    };

    document.getElementById('btn-back-intro').onclick = () => {
      creationState.mode = 'intro';
      renderCreationStep(main);
    };
  }

  function renderRaceSelect(main) {
    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">SELECT RACE</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <div class="race-list">
              ${DATA.races.map(r => `
                <div class="select-option ${creationState.raceId === r.id ? 'selected' : ''}"
                     data-id="${r.id}">
                  <span class="text-yellow">${r.name}</span>
                  ${r.beast ? '<span class="text-red"> [Beast]</span>' : ''}
                </div>
              `).join('')}
            </div>
          </div>
          <div id="race-info" class="panel" style="margin:0;font-size:13px">
            ${creationState.raceId ? renderRaceInfo(creationState.raceId) : '<p class="text-grey">Select a race to view details.</p>'}
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:10px">
          <button class="btn btn-primary" id="btn-race-next" ${creationState.raceId ? '' : 'disabled'}>[ SELECT ]</button>
          <button class="btn" id="btn-race-back">[ BACK ]</button>
        </div>
      </div>
    `;

    document.querySelectorAll('.select-option[data-id]').forEach(el => {
      el.onclick = () => {
        document.querySelectorAll('.select-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        creationState.raceId = el.dataset.id;
        document.getElementById('race-info').innerHTML = renderRaceInfo(el.dataset.id);
        document.getElementById('btn-race-next').disabled = false;
      };
    });

    document.getElementById('btn-race-next').onclick = () => {
      if (!creationState.raceId) return;
      creationState.mode = 'selectClass';
      renderCreationStep(main);
    };

    document.getElementById('btn-race-back').onclick = () => {
      creationState.mode = 'partyBuild';
      renderCreationStep(main);
    };
  }

  function renderRaceInfo(raceId) {
    const r = DATA.races.find(x => x.id === raceId);
    if (!r) return '';
    const bonuses = Object.entries(r.statBonus)
      .filter(([,v]) => v !== 0)
      .map(([k,v]) => `${k.toUpperCase()}: ${v > 0 ? '+' : ''}${v}`)
      .join(', ') || 'None';
    return `
      <p class="text-yellow">${r.name}</p>
      <p class="text-grey" style="margin:6px 0">${r.desc}</p>
      <p>Stat Bonuses: <span class="text-cyan">${bonuses}</span></p>
      <p>Classes: <span class="text-white">${r.availableClasses.map(c=>c[0].toUpperCase()+c.slice(1)).join(', ')}</span></p>
      ${r.beast ? '<p class="text-red">Beast race: higher training costs.</p>' : ''}
    `;
  }

  function renderClassSelect(main) {
    const race = DATA.races.find(r => r.id === creationState.raceId);
    const validClasses = DATA.classes.filter(c => race.availableClasses.includes(c.id));

    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">SELECT CLASS — ${race.name}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="class-list">
            ${validClasses.map(c => `
              <div class="select-option ${creationState.classId === c.id ? 'selected' : ''}"
                   data-id="${c.id}">
                <span class="text-yellow">${c.name}</span>
              </div>
            `).join('')}
          </div>
          <div id="class-info" class="panel" style="margin:0;font-size:13px">
            ${creationState.classId ? renderClassInfo(creationState.classId) : '<p class="text-grey">Select a class to view details.</p>'}
          </div>
        </div>
        <div style="margin-top:12px;display:flex;gap:10px">
          <button class="btn btn-primary" id="btn-class-next" ${creationState.classId ? '' : 'disabled'}>[ SELECT ]</button>
          <button class="btn" id="btn-class-back">[ BACK ]</button>
        </div>
      </div>
    `;

    document.querySelectorAll('.select-option[data-id]').forEach(el => {
      el.onclick = () => {
        document.querySelectorAll('.select-option').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        creationState.classId = el.dataset.id;
        document.getElementById('class-info').innerHTML = renderClassInfo(el.dataset.id);
        document.getElementById('btn-class-next').disabled = false;
      };
    });

    document.getElementById('btn-class-next').onclick = () => {
      if (!creationState.classId) return;
      creationState.mode = 'enterName';
      renderCreationStep(main);
    };

    document.getElementById('btn-class-back').onclick = () => {
      creationState.classId = null;
      creationState.mode = 'selectRace';
      renderCreationStep(main);
    };
  }

  function renderClassInfo(classId) {
    const c = DATA.classes.find(x => x.id === classId);
    if (!c) return '';
    return `
      <p class="text-yellow">${c.name}</p>
      <p class="text-grey" style="margin:6px 0">${c.desc}</p>
      <p>HP Die: <span class="text-white">d${c.hpDie}</span> &nbsp;
         MP Die: <span class="text-cyan">${c.mpDie > 0 ? 'd'+c.mpDie : 'None'}</span></p>
      <p>Starting Spells: <span class="text-cyan">${c.startSpells.length > 0
        ? c.startSpells.map(s => { const sp = DATA.spells.find(x=>x.id===s); return sp ? sp.name : s; }).join(', ')
        : 'None'}</span></p>
    `;
  }

  function renderNameEntry(main) {
    main.innerHTML = `
      <div style="padding:20px;max-width:400px;margin:0 auto">
        <div class="panel-title">NAME YOUR ADVENTURER</div>
        <p class="text-grey" style="margin:8px 0">
          ${DATA.races.find(r=>r.id===creationState.raceId).name}
          ${DATA.classes.find(c=>c.id===creationState.classId).name}
        </p>
        <input type="text" class="name-input" id="char-name" placeholder="Enter name..."
               maxlength="16" value="${creationState.name}" autofocus>
        <div style="display:flex;gap:10px;margin-top:12px">
          <button class="btn btn-primary" id="btn-name-next">[ CONTINUE ]</button>
          <button class="btn" id="btn-name-back">[ BACK ]</button>
        </div>
      </div>
    `;

    const inp = document.getElementById('char-name');
    inp.focus();
    inp.onkeydown = (e) => {
      if (e.key === 'Enter') document.getElementById('btn-name-next').click();
    };

    document.getElementById('btn-name-next').onclick = () => {
      const name = document.getElementById('char-name').value.trim();
      if (!name) { alert('Please enter a name.'); return; }
      creationState.name = name;
      creationState.rolledStats = rollStats();
      creationState.tempChar = createCharacter(creationState.name, creationState.raceId, creationState.classId);
      creationState.mode = 'rollStats';
      renderCreationStep(main);
    };

    document.getElementById('btn-name-back').onclick = () => {
      creationState.mode = 'selectClass';
      renderCreationStep(main);
    };
  }

  function renderStatRoll(main) {
    const ch = creationState.tempChar;
    main.innerHTML = `
      <div style="padding:12px;max-width:600px;margin:0 auto">
        <div class="panel-title">CHARACTER STATS — ${ch.name}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0">
          <div>
            <p class="text-grey" style="margin-bottom:8px">
              ${DATA.races.find(r=>r.id===ch.race).name}
              ${DATA.classes.find(c=>c.id===ch.class).name} &nbsp;|&nbsp;
              ${DATA.socialClasses.find(s=>s.id===ch.socialClass).name}
            </p>
            <div class="stat-grid">
              ${['str','dex','con','int','cha'].map(stat => `
                <div class="stat-row">
                  <span class="stat-name">${stat.toUpperCase()}</span>
                  <span class="stat-val">${ch.stats[stat]}</span>
                </div>
              `).join('')}
            </div>
            <hr class="sep">
            <div class="stat-grid">
              <div class="stat-row">
                <span class="stat-name">HP</span>
                <span class="stat-val text-fg">${ch.hp.max}</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">MP</span>
                <span class="stat-val text-cyan">${ch.mp.max}</span>
              </div>
            </div>
          </div>
          <div>
            <p class="text-grey" style="font-size:12px;margin-bottom:8px">Starting Equipment:</p>
            <p>Weapon: <span class="text-yellow">${getItemName('weapons', ch.equipment.weapon)}</span></p>
            <p>Armor:  <span class="text-yellow">${getItemName('armors', ch.equipment.armor)}</span></p>
            ${ch.spells.length > 0 ? `<p class="text-cyan" style="margin-top:8px">Spells: ${ch.spells.map(s => {
              const sp = DATA.spells.find(x=>x.id===s); return sp ? sp.name : s;
            }).join(', ')}</p>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary" id="btn-accept">[ ACCEPT ]</button>
          <button class="btn" id="btn-reroll">[ REROLL ]</button>
          <button class="btn" id="btn-stat-back">[ BACK ]</button>
        </div>
      </div>
    `;

    document.getElementById('btn-accept').onclick = () => {
      creationState.partyBeingBuilt.push(ch);
      Game.addMessage(`${ch.name} joins the party!`, 'msg-info');
      creationState.raceId = null;
      creationState.classId = null;
      creationState.name = '';
      creationState.tempChar = null;
      creationState.mode = 'partyBuild';
      renderCreationStep(main);
    };

    document.getElementById('btn-reroll').onclick = () => {
      creationState.tempChar = createCharacter(creationState.name, creationState.raceId, creationState.classId);
      renderCreationStep(main);
    };

    document.getElementById('btn-stat-back').onclick = () => {
      creationState.mode = 'enterName';
      renderCreationStep(main);
    };
  }

  /* ----------------------------------------------------------
     PARTY MANAGEMENT SCREEN
     ---------------------------------------------------------- */
  function renderPartyManage(main, data) {
    const s = Game.getState();
    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">PARTY ROSTER</div>
        <table class="party-table" style="margin-bottom:12px">
          <thead><tr>
            <th>#</th><th>Name</th><th>Race</th><th>Class</th><th>Lv</th>
            <th>HP</th><th>MP</th><th>Rank</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
            ${s.party.map((ch, i) => `
              <tr>
                <td class="text-grey">${i+1}</td>
                <td class="text-yellow">${ch.name}</td>
                <td>${DATA.races.find(r=>r.id===ch.race).name}</td>
                <td>${DATA.classes.find(c=>c.id===ch.class).name}</td>
                <td>${ch.level}</td>
                <td class="${hpClass(ch)}">${ch.hp.current}/${ch.hp.max}</td>
                <td class="text-cyan">${ch.mp.current}/${ch.mp.max}</td>
                <td class="rank-${ch.rank}">${ch.rank.toUpperCase()}</td>
                <td>${ch.alive ? woundSummary(ch) : '<span class="text-grey">Dead</span>'}</td>
                <td>
                  <button class="btn" style="font-size:11px;padding:2px 6px" onclick="CharScreen.viewSheet(${i})">View</button>
                  <button class="btn" style="font-size:11px;padding:2px 6px" onclick="CharScreen.cycleRank(${i})">Rank</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <p class="text-grey text-small" style="font-size:12px">
          Party Gold: <span class="text-yellow">${s.partyGold}</span>
        </p>
        <button class="btn" style="margin-top:8px" onclick="Game.showScreen('${data.returnScreen || 'overworld'}')">[ BACK ]</button>
      </div>
    `;
  }

  function hpClass(ch) {
    const pct = ch.hp.current / ch.hp.max;
    if (pct < 0.25) return 'text-red';
    if (pct < 0.5)  return 'text-orange';
    return 'text-fg';
  }

  function woundSummary(ch) {
    const bad = Object.entries(ch.wounds).filter(([,v]) => v !== 'ok');
    if (!bad.length) return '<span class="text-fg">Healthy</span>';
    return `<span class="text-orange">${bad.length} wound(s)</span>`;
  }

  function viewSheet(idx) {
    const s = Game.getState();
    Game.showScreen('charsheet', { char: s.party[idx], idx, returnScreen: 'partymanage' });
  }

  function cycleRank(idx) {
    const s = Game.getState();
    const ch = s.party[idx];
    const ranks = ['front', 'middle', 'rear'];
    ch.rank = ranks[(ranks.indexOf(ch.rank) + 1) % ranks.length];
    Game.renderHUD();
    renderPartyManage(document.getElementById('main-content'), { returnScreen: 'overworld' });
  }

  /* ----------------------------------------------------------
     CHARACTER SHEET
     ---------------------------------------------------------- */
  function renderSheet(main, data) {
    const ch = data.char;
    const race = DATA.races.find(r => r.id === ch.race);
    const cls  = DATA.classes.find(c => c.id === ch.class);

    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">${ch.name} — ${race.name} ${cls.name} Lv.${ch.level}</div>
        <div class="char-sheet">
          <div>
            <p class="text-grey" style="font-size:12px;margin-bottom:6px">ATTRIBUTES</p>
            ${['str','dex','con','int','cha'].map(s => `
              <div class="char-detail-row">
                <span class="char-detail-label">${s.toUpperCase()}</span>
                <span class="char-detail-val">${ch.stats[s]} (${statMod(ch.stats[s]) >= 0 ? '+' : ''}${statMod(ch.stats[s])})</span>
              </div>
            `).join('')}
            <hr class="sep">
            <div class="char-detail-row">
              <span class="char-detail-label">HP</span>
              <span class="char-detail-val">${ch.hp.current} / ${ch.hp.max}</span>
            </div>
            <div class="char-detail-row">
              <span class="char-detail-label">MP</span>
              <span class="char-detail-val text-cyan">${ch.mp.current} / ${ch.mp.max}</span>
            </div>
            <div class="char-detail-row">
              <span class="char-detail-label">XP</span>
              <span class="char-detail-val">${ch.xp} / ${ch.xpToNext}</span>
            </div>
            <div class="char-detail-row">
              <span class="char-detail-label">Gold</span>
              <span class="char-detail-val text-yellow">${ch.gold}</span>
            </div>
            <div class="char-detail-row">
              <span class="char-detail-label">Rank</span>
              <span class="char-detail-val rank-${ch.rank}">${ch.rank.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <p class="text-grey" style="font-size:12px;margin-bottom:6px">EQUIPMENT</p>
            <div class="char-detail-row">
              <span class="char-detail-label">Weapon</span>
              <span class="char-detail-val">${getItemName('weapons', ch.equipment.weapon)}</span>
            </div>
            <div class="char-detail-row">
              <span class="char-detail-label">Armor</span>
              <span class="char-detail-val">${getItemName('armors', ch.equipment.armor)}</span>
            </div>
            <div class="char-detail-row">
              <span class="char-detail-label">Shield</span>
              <span class="char-detail-val">${getItemName('shields', ch.equipment.shield)}</span>
            </div>
            <hr class="sep">
            <p class="text-grey" style="font-size:12px;margin-bottom:6px">WOUNDS</p>
            <div class="wound-display">
              ${Object.entries(ch.wounds).map(([loc, status]) => `
                <span class="wound-${status}">${loc}: ${status}</span>
              `).join('')}
            </div>
            ${ch.spells.length > 0 ? `
            <hr class="sep">
            <p class="text-grey" style="font-size:12px;margin-bottom:6px">SPELLS</p>
            <div class="spell-grid">
              ${ch.spells.map(sid => {
                const sp = DATA.spells.find(x=>x.id===sid);
                return sp ? `<div class="spell-card">
                  <div class="spell-name">${sp.name}</div>
                  <div class="spell-mp">${sp.mp} MP</div>
                </div>` : '';
              }).join('')}
            </div>` : ''}
          </div>
        </div>
        <button class="btn" style="margin-top:12px"
          onclick="Game.showScreen('${data.returnScreen || 'overworld'}', ${JSON.stringify(data.returnData || {})})">
          [ BACK ]
        </button>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     LEVEL UP SCREEN
     ---------------------------------------------------------- */
  function renderLevelUp(main, data) {
    const { char, idx, townId, costPaid } = data;
    const MAX_PICKS = 3;
    let picks = [];

    // Get available spells to learn
    const learnableSpells = getAvailableSpells(char);

    // Build training options list
    let options = [...DATA.trainingOptions];
    // Remove MP option for fighters (no magic)
    const cls = DATA.classes.find(c => c.id === char.class);
    if (cls.mpDie === 0) options = options.filter(o => o.id !== 'mp_up');

    // Add learnable spells as options
    learnableSpells.forEach(sp => {
      options.push({ id: 'spell_' + sp.id, name: 'Learn: ' + sp.name, desc: sp.desc });
    });

    function updateUI() {
      const confirmBtn = document.getElementById('btn-levelup-confirm');
      if (confirmBtn) confirmBtn.disabled = picks.length < Math.min(MAX_PICKS, options.length);
      document.querySelectorAll('.levelup-option').forEach((el, i) => {
        el.classList.toggle('selected', picks.includes(el.dataset.id));
      });
    }

    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">LEVEL UP — ${char.name}</div>
        <p class="text-white" style="margin-bottom:8px">
          ${char.name} has reached <span class="text-yellow">Level ${char.level + 1}</span>!
          Choose ${Math.min(MAX_PICKS, options.length)} training improvements:
        </p>
        <div class="levelup-choices">
          ${options.map(opt => `
            <div class="levelup-option" data-id="${opt.id}">
              <span class="text-yellow">${opt.name}</span>
              <span class="text-grey" style="font-size:12px;margin-left:8px">${opt.desc}</span>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:12px;display:flex;gap:10px;align-items:center">
          <button class="btn btn-primary" id="btn-levelup-confirm" disabled>
            [ CONFIRM (${picks.length}/${Math.min(MAX_PICKS, options.length)}) ]
          </button>
          <span class="text-grey" style="font-size:12px">
            Picked: <span id="picks-count">0</span>/${Math.min(MAX_PICKS, options.length)}
          </span>
        </div>
      </div>
    `;

    document.querySelectorAll('.levelup-option').forEach(el => {
      el.onclick = () => {
        const id = el.dataset.id;
        if (picks.includes(id)) {
          picks = picks.filter(p => p !== id);
        } else if (picks.length < MAX_PICKS) {
          picks.push(id);
        }
        document.getElementById('picks-count').textContent = picks.length;
        const confirmBtn = document.getElementById('btn-levelup-confirm');
        confirmBtn.disabled = picks.length < Math.min(MAX_PICKS, options.length);
        confirmBtn.textContent = `[ CONFIRM (${picks.length}/${Math.min(MAX_PICKS, options.length)}) ]`;
        updateUI();
      };
    });

    document.getElementById('btn-levelup-confirm').onclick = () => {
      const result = applyLevelUp(char, picks.filter(p => !p.startsWith('spell_')));

      // Apply any spell learning
      picks.filter(p => p.startsWith('spell_')).forEach(spPick => {
        const spId = spPick.replace('spell_', '');
        if (!char.spells.includes(spId)) char.spells.push(spId);
      });

      Game.addMessage(`${char.name} advanced to level ${char.level}! +${result.hpGain} HP.`, 'msg-info');
      Game.renderHUD();
      Game.showScreen('guild', { townId });
    };

    updateUI();
  }

  /* ----------------------------------------------------------
     HELPERS
     ---------------------------------------------------------- */
  function getItemName(category, id) {
    const list = DATA[category];
    const item = list ? list.find(i => i.id === id) : null;
    return item ? item.name : (id || 'None');
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    createCharacter,
    canLevelUp,
    levelUpCost,
    applyLevelUp,
    getAvailableSpells,
    statMod,
    roll,
    getItemName,
    renderNewGame,
    renderCreate,
    renderPartyManage,
    renderSheet,
    renderLevelUp,
    viewSheet,
    cycleRank,
    xpForLevel
  };

})();
