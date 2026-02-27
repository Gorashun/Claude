/* ============================================================
   PHANTASIE III - CORE GAME ENGINE
   State management, screen routing, save/load, message log
   ============================================================ */

const Game = (function() {
  'use strict';

  /* ----------------------------------------------------------
     GAME STATE
     ---------------------------------------------------------- */
  const SAVE_KEY = 'phantasie3_save_v1';

  let state = null;  // the live game state object

  function defaultState() {
    return {
      version: 1,
      screen: 'title',
      screenData: {},
      party: [],          // array of character objects (up to 6)
      partyGold: 0,
      worldPos: { x: 2, y: 2 },
      questFlags: {
        giantEyeFound: false,
        dwarvenRuneFound: false,
        lightCrystalFound: false,
        darkShardFound: false,
        lordWoodMet: false,
        nikademusConfronted: false,
        nikademusDefeated: false,
        joinedNikademus: false
      },
      visitedTiles: {},
      dungeonProgress: {},  // dungeonId -> { floorsVisited: [], chestsTaken: [], enemiesDefeated: [] }
      currentDungeon: null,
      dungeonPos: { x: 1, y: 1, floor: 1 },
      bankAccounts: {}      // charId -> gold
    };
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      addMessage('Game saved.', 'msg-system');
      return true;
    } catch (e) {
      addMessage('Save failed!', 'msg-system');
      return false;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const loaded = JSON.parse(raw);
      if (loaded.version !== 1) return false;
      state = loaded;
      return true;
    } catch (e) {
      return false;
    }
  }

  function hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  /* ----------------------------------------------------------
     MESSAGE LOG
     ---------------------------------------------------------- */
  const MAX_MESSAGES = 40;
  let messages = [];

  function addMessage(text, cls = 'msg-info') {
    messages.push({ text, cls });
    if (messages.length > MAX_MESSAGES) messages.shift();
    renderMessages();
  }

  function renderMessages() {
    const el = document.getElementById('messages');
    if (!el) return;
    const recent = messages.slice(-5);
    el.innerHTML = recent.map(m => `<p class="${m.cls}">${m.text}</p>`).join('');
    el.scrollTop = el.scrollHeight;
  }

  function clearMessages() {
    messages = [];
    renderMessages();
  }

  /* ----------------------------------------------------------
     HUD
     ---------------------------------------------------------- */
  function renderHUD() {
    const hud = document.getElementById('party-hud');
    if (!hud || !state || !state.party.length) return;

    hud.innerHTML = state.party.map(ch => {
      if (!ch.alive) return `<div class="hud-char"><span class="hud-name hud-dead">${ch.name}</span></div>`;
      const hpPct = ch.hp.current / ch.hp.max;
      const hpCls = hpPct < 0.25 ? 'low' : hpPct < 0.5 ? 'mid' : '';
      return `<div class="hud-char">
        <span class="hud-name">${ch.name}</span>
        <span class="hud-hp ${hpCls}">${ch.hp.current}/${ch.hp.max}</span>
      </div>`;
    }).join('');
  }

  /* ----------------------------------------------------------
     SCREEN SYSTEM
     ---------------------------------------------------------- */
  function showScreen(name, data = {}) {
    state.screen = name;
    state.screenData = data;

    const main = document.getElementById('main-content');
    const hud = document.getElementById('hud');
    const log = document.getElementById('message-log');

    // Show/hide HUD based on screen
    const hudScreens = ['overworld','town','guild','bank','inn','armory','mystic','combat','dungeon','partymanage'];
    if (hudScreens.includes(name)) {
      hud.classList.remove('hidden');
      log.classList.remove('hidden');
      renderHUD();
    } else {
      hud.classList.add('hidden');
      log.classList.add('hidden');
    }

    // Dispatch to screen renderer
    const renderers = {
      title:       () => renderTitle(main),
      newgame:     () => CharScreen.renderNewGame(main),
      charcreate:  () => CharScreen.renderCreate(main, data),
      partymanage: () => CharScreen.renderPartyManage(main, data),
      overworld:   () => WorldScreen.render(main),
      town:        () => TownScreen.render(main, data),
      guild:       () => TownScreen.renderGuild(main, data),
      bank:        () => TownScreen.renderBank(main, data),
      inn:         () => TownScreen.renderInn(main, data),
      armory:      () => TownScreen.renderArmory(main, data),
      mystic:      () => TownScreen.renderMystic(main, data),
      combat:      () => CombatScreen.render(main, data),
      dungeon:     () => DungeonScreen.render(main, data),
      levelup:     () => CharScreen.renderLevelUp(main, data),
      charsheet:   () => CharScreen.renderSheet(main, data),
      gameover:    () => renderGameOver(main, data),
      victory:     () => renderVictory(main, data),
      nikademus:   () => renderNikademus(main, data)
    };

    const renderer = renderers[name];
    if (renderer) {
      renderer();
    } else {
      main.innerHTML = `<div class="panel"><p class="text-red">Unknown screen: ${name}</p></div>`;
    }
  }

  /* ----------------------------------------------------------
     TITLE SCREEN
     ---------------------------------------------------------- */
  function renderTitle(main) {
    const saveExists = hasSave();
    main.innerHTML = `
      <div id="screen-title">
        <div class="title-logo">
 ____  _   _    _    _   _ _____  _    ____ ___ _____
|  _ \\| | | |  / \\  | \\ | |_   _|/ \\  / ___|_ _| ____|
| |_) | |_| | / _ \\ |  \\| | | | / _ \\ \\___ \\| ||  _|
|  __/|  _  |/ ___ \\| |\\  | | |/ ___ \\ ___) | || |___
|_|   |_| |_/_/   \\_|_| \\_| |_/_/   \\_|____/___|_____|
        </div>
        <div class="title-subtitle">WRATH OF NIKADEMUS</div>
        <div class="title-game">An Epic Adventure in the Land of Scandor</div>
        <div class="title-menu">
          <button class="btn btn-primary" id="btn-new">[ NEW GAME ]</button>
          <button class="btn ${saveExists ? '' : 'disabled'}" id="btn-load" ${saveExists ? '' : 'disabled'}>[ LOAD GAME ]</button>
        </div>
        <div class="title-credits">
          Inspired by Phantasie III (1987) by Strategic Simulations Inc.<br>
          Use arrow keys or WASD to move. Number keys for menus.
        </div>
      </div>
    `;

    document.getElementById('btn-new').onclick = () => {
      state = defaultState();
      showScreen('newgame');
    };

    if (saveExists) {
      document.getElementById('btn-load').onclick = () => {
        if (load()) {
          addMessage('Game loaded.', 'msg-system');
          showScreen('overworld');
        } else {
          alert('Failed to load save.');
        }
      };
    }
  }

  /* ----------------------------------------------------------
     GAME OVER / VICTORY
     ---------------------------------------------------------- */
  function renderGameOver(main, data) {
    main.innerHTML = `
      <div id="screen-gameover">
        <div class="gameover-title">YOUR PARTY HAS FALLEN</div>
        <p class="text-white" style="margin:16px 0">The darkness of Nikademus consumes Scandor.<br>
        Your quest has ended in failure.</p>
        <p class="text-grey" style="margin:8px 0">${data.message || ''}</p>
        <div style="margin-top:30px;display:flex;gap:16px;justify-content:center">
          <button class="btn btn-primary" id="btn-retry">[ TRY AGAIN ]</button>
          <button class="btn" id="btn-title">[ TITLE SCREEN ]</button>
        </div>
      </div>
    `;
    document.getElementById('btn-retry').onclick = () => {
      if (load()) showScreen('overworld');
      else showScreen('title');
    };
    document.getElementById('btn-title').onclick = () => showScreen('title');
  }

  function renderVictory(main, data) {
    const joined = state.questFlags.joinedNikademus;
    main.innerHTML = `
      <div id="screen-gameover">
        <div class="victory-title">${joined ? 'POWER ABSOLUTE' : 'NIKADEMUS DEFEATED!'}</div>
        <p class="text-yellow" style="margin:16px 0;font-size:14px">
          ${joined
            ? 'You have joined Nikademus. Together, you rule Scandor with an iron fist.\nThe land trembles before your combined might!'
            : 'The dark lord Nikademus has been vanquished!\nScandor is free at last. Songs will be sung of your heroic party for generations.'}
        </p>
        <div style="margin:16px 0;color:var(--fg);font-size:13px">
          <p>Party Gold: <span class="text-yellow">${state.partyGold}</span></p>
          <p>Highest Level: <span class="text-yellow">${Math.max(...state.party.map(c=>c.level))}</span></p>
        </div>
        <div style="margin-top:30px">
          <button class="btn btn-primary" id="btn-title">[ PLAY AGAIN ]</button>
        </div>
      </div>
    `;
    document.getElementById('btn-title').onclick = () => showScreen('title');
  }

  /* ----------------------------------------------------------
     NIKADEMUS FINAL CONFRONTATION
     ---------------------------------------------------------- */
  function renderNikademus(main, data) {
    main.innerHTML = `
      <div style="padding:20px;text-align:center;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center">
        <div style="color:var(--red);font-size:20px;letter-spacing:3px;margin-bottom:20px">
          *** NIKADEMUS SPEAKS ***
        </div>
        <div style="color:var(--white);max-width:500px;line-height:1.8;margin-bottom:24px;font-size:13px">
          "So... you have come. I expected nothing less from champions bold enough to breach my castle.<br><br>
          Know this: I do not seek destruction for its own sake. I seek ORDER — the iron order that only I can provide.<br><br>
          Join me, and share in the rule of Scandor. Together, we shall bring peace through strength.<br><br>
          <span class="text-yellow">Or... you may fight. But know that few who challenge me draw breath to tell the tale."</span>
        </div>
        <div style="display:flex;gap:20px;margin-top:10px">
          <button class="btn btn-danger" id="btn-fight">[ FIGHT NIKADEMUS ]</button>
          <button class="btn btn-primary" id="btn-join">[ JOIN NIKADEMUS ]</button>
        </div>
      </div>
    `;

    document.getElementById('btn-fight').onclick = () => {
      addMessage('The battle against Nikademus begins!', 'msg-combat');
      const nikEnemy = DATA.enemies.find(e => e.id === 'nikademus');
      showScreen('combat', {
        enemies: [nikEnemy],
        returnScreen: 'overworld',
        isFinalBoss: true,
        onVictory: () => {
          state.questFlags.nikademusDefeated = true;
          save();
          showScreen('victory');
        }
      });
    };

    document.getElementById('btn-join').onclick = () => {
      state.questFlags.joinedNikademus = true;
      state.questFlags.nikademusDefeated = true;
      save();
      showScreen('victory');
    };
  }

  /* ----------------------------------------------------------
     KEYBOARD HANDLER
     ---------------------------------------------------------- */
  function handleKeydown(e) {
    const key = e.key;

    // Prevent scroll on arrow keys
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(key)) {
      e.preventDefault();
    }

    // Don't intercept if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (state ? state.screen : 'title') {
      case 'overworld': WorldScreen.handleKey(key); break;
      case 'dungeon':   DungeonScreen.handleKey(key); break;
      case 'combat':    CombatScreen.handleKey(key); break;
    }

    // Global shortcuts
    if (key === 's' && e.ctrlKey) { e.preventDefault(); save(); }
  }

  /* ----------------------------------------------------------
     PUBLIC UTILITY FUNCTIONS
     ---------------------------------------------------------- */
  function getState() { return state; }
  function setState(s) { state = s; }

  function getAliveParty() {
    return (state.party || []).filter(c => c.alive && c.hp.current > 0);
  }

  function isQuestComplete() {
    const q = state.questFlags;
    return q.giantEyeFound && q.dwarvenRuneFound && q.lightCrystalFound && q.darkShardFound;
  }

  /* ----------------------------------------------------------
     INIT
     ---------------------------------------------------------- */
  function init() {
    state = defaultState();  // temporary default; replaced on new/load
    document.addEventListener('keydown', handleKeydown);
    showScreen('title');
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    init,
    showScreen,
    addMessage,
    clearMessages,
    renderHUD,
    save,
    load,
    hasSave,
    getState,
    setState,
    getAliveParty,
    isQuestComplete
  };

})();
