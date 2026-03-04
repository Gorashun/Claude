/* ============================================================
   VALDORIA: THE DARK ASCENSION - CORE GAME ENGINE
   State management, screen routing, save/load, message log
   ============================================================ */

const Game = (function() {
  'use strict';

  /* ----------------------------------------------------------
     GAME STATE
     ---------------------------------------------------------- */
  const SAVE_KEY = 'valdoria_save_v1';

  let state = null;  // the live game state object

  function defaultState() {
    return {
      version: 1,
      screen: 'title',
      screenData: {},
      party: [],          // array of character objects (up to 6)
      partyGold: 0,
      worldPos: { x: 4, y: 5 },
      questFlags: {
        sealOfFlameFound: false,
        sealOfStoneFound: false,
        sealOfWaveFound: false,
        sealOfLightFound: false,
        elderSageSpoken: false,
        malacharConfronted: false,
        malacharDefeated: false,
        joinedMalachar: false
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
      malachar:    () => renderMalachar(main, data)
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
__   ___    _    _     ____   ___  ____  ___    _
\\ \\ / / \\  | |  | |   |  _ \\/ _ \\|  _ \\|_ _|  / \\
 \\ V / _ \\ | |  | |   | | | | | | | |_) || |  / _ \\
  | / ___ \\| |__| |___| |_| | |_| |  _ < | | / ___ \\
  |_/_/   \\_|_____|_____|____/ \\___/|_| \\_|___/_/   \\_\\
        </div>
        <div class="title-subtitle">THE DARK ASCENSION</div>
        <div class="title-game">An Epic Quest to Shatter the Shadow Seal</div>
        <div class="title-menu">
          <button class="btn btn-primary" id="btn-new">[ NEW GAME ]</button>
          <button class="btn ${saveExists ? '' : 'disabled'}" id="btn-load" ${saveExists ? '' : 'disabled'}>[ LOAD GAME ]</button>
        </div>
        <div class="title-credits">
          The realm of Valdoria awaits. Lord Malachar must be stopped.<br>
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
        <p class="text-white" style="margin:16px 0">The Shadow Seal remains unbroken. Malachar's darkness spreads across Valdoria.<br>
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
    const joined = state.questFlags.joinedMalachar;
    main.innerHTML = `
      <div id="screen-gameover">
        <div class="victory-title">${joined ? 'SHADOW KING ASCENDANT' : 'MALACHAR DEFEATED!'}</div>
        <p class="text-yellow" style="margin:16px 0;font-size:14px">
          ${joined
            ? "You have absorbed the Shadow Seal's power. Malachar's will becomes your own. The realm of Valdoria trembles as you ascend to the Shadow Throne!"
            : "The Shadow King Lord Malachar has been vanquished! The Shadow Seal is shattered. Light returns to Valdoria. Songs will be sung of your heroic party for generations to come."}
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
     MALACHAR FINAL CONFRONTATION
     ---------------------------------------------------------- */
  function renderMalachar(main, data) {
    main.innerHTML = `
      <div style="padding:20px;text-align:center;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center">
        <div style="color:var(--red);font-size:20px;letter-spacing:3px;margin-bottom:20px">
          *** LORD MALACHAR SPEAKS ***
        </div>
        <div style="color:var(--white);max-width:500px;line-height:1.8;margin-bottom:24px;font-size:13px">
          "So... the four Seals have brought you to my throne. Impressive, I admit.<br><br>
          Know this: the shadow that covers Valdoria is not destruction — it is <em>transcendence</em>. The weak fear the dark. The strong <em>become</em> it.<br><br>
          Kneel before me. Absorb the Shadow Seal's power and rule at my side.<br><br>
          <span class="text-yellow">Or draw your steel. But understand — you cannot destroy what you might yet become."</span>
        </div>
        <div style="display:flex;gap:20px;margin-top:10px">
          <button class="btn btn-danger" id="btn-fight">[ FIGHT MALACHAR ]</button>
          <button class="btn btn-primary" id="btn-join">[ ABSORB THE SHADOW ]</button>
        </div>
      </div>
    `;

    document.getElementById('btn-fight').onclick = () => {
      addMessage('The final battle against Lord Malachar begins!', 'msg-combat');
      const bossEnemy = DATA.enemies.find(e => e.id === 'malachar');
      showScreen('combat', {
        enemies: [bossEnemy],
        returnScreen: 'overworld',
        isFinalBoss: true,
        onVictory: () => {
          state.questFlags.malacharDefeated = true;
          save();
          showScreen('victory');
        }
      });
    };

    document.getElementById('btn-join').onclick = () => {
      state.questFlags.joinedMalachar = true;
      state.questFlags.malacharDefeated = true;
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
    return q.sealOfFlameFound && q.sealOfStoneFound && q.sealOfWaveFound && q.sealOfLightFound;
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
