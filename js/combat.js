/* ============================================================
   VALDORIA: THE DARK ASCENSION - TURN-BASED COMBAT ENGINE
   Combat flow, actions, spells, wounds, enemy AI
   ============================================================ */

const CombatScreen = (function() {
  'use strict';

  /* ----------------------------------------------------------
     COMBAT STATE
     ---------------------------------------------------------- */
  let cs = null;  // combat state object

  function initCombat(data) {
    const s = Game.getState();
    cs = {
      enemies:        data.enemies.map(e => ({ ...e, status: e.status || [], hpCur: e.hpCur !== undefined ? e.hpCur : rollEnemyHP(e) })),
      partyBufs:      {},   // temporary party-wide buffs { stat: {amount, turns} }
      turn:           0,
      phase:          'select',    // 'select' | 'resolving' | 'enemy_turn' | 'end'
      actions:        [],          // queued actions for this round
      actorIdx:       0,           // which party member is selecting
      targetEnemyIdx: 0,
      returnScreen:   data.returnScreen || 'overworld',
      onVictory:      data.onVictory || null,
      isFinalBoss:    data.isFinalBoss || false,
      log:            [],
      spellSelect:    false,       // whether spell picker is open
      selectedSpellId: null
    };
  }

  function rollEnemyHP(e) {
    const count = e.hp[0], sides = e.hp[1];
    let total = 0;
    for (let i = 0; i < count; i++) total += 1 + Math.floor(Math.random() * sides);
    return total;
  }

  /* ----------------------------------------------------------
     CLASS PORTRAITS (ASCII art)
     ---------------------------------------------------------- */
  const CLASS_PORTRAITS = {
    fighter: ['  /|\\  ', ' [^_^] ', ' /| |\\ ', '  | |  '],
    priest:  ['  _+_  ', ' (+_+) ', ' _) (_ ', '  | |  '],
    wizard:  ['  ***  ', ' (*.*) ', '  | |  ', ' /___\\ '],
    monk:    ['  ooo  ', ' (o_o) ', ' _|_|_ ', '  | |  '],
    ranger:  ['  ___  ', ' [-_-] ', ' /|_|\\ ', '  | |  '],
    thief:   ['  ,,   ', ' (>_<) ', '  |//  ', ' / \\   ']
  };

  const ENEMY_PORTRAITS = {
    goblin:   [' ,-, ', '(o o)', ' \\_/ '],
    orc:      [' -|- ', '(> <)', ' /|\\ '],
    skeleton: [' ._. ', '(X X)', ' )_( '],
    zombie:   [' .,. ', '(~.~)', ' |_| '],
    troll:    ['  M  ', '(o_o)', ' /|\\ '],
    dragon:   ['/^^^\\', '< @ >', '\\___/'],
    wolf:     [' /\\ ', '(^.^)', '  U  '],
    bandit:   [' ___ ', '[-_-]', ' | | '],
    gnoll:    [' .-. ', '(#.#)', ' ||| '],
    ogre:     [' [_] ', '(O O)', ' /|\\ '],
    minotaur: [' ) ( ', '(> <)', ' | | '],
    malachar:['*X*X*','(#@#)','*X*X*']
  };

  function getPortrait(id, isEnemy) {
    const map = isEnemy ? ENEMY_PORTRAITS : CLASS_PORTRAITS;
    const lines = map[id] || (isEnemy ? ['(???)', ' ??? '] : ['[???]', ' ? ? ']);
    return `<pre class="portrait ${isEnemy ? 'portrait-enemy' : 'portrait-ally'}">${lines.join('\n')}</pre>`;
  }

  /* ----------------------------------------------------------
     HP BAR with gradient
     ---------------------------------------------------------- */
  function hpBar(cur, max, type) {
    const pct = Math.max(0, Math.min(1, cur / max));
    const pctStr = (pct * 100).toFixed(1);
    let grad, cls;
    if (type === 'mp') {
      grad = 'linear-gradient(90deg, #00ccff, #005580)';
      cls = 'bar-mp';
    } else if (pct < 0.25) {
      grad = 'linear-gradient(90deg, #ff3333, #880000)';
      cls = 'bar-low';
    } else if (pct < 0.5) {
      grad = 'linear-gradient(90deg, #ff8800, #cc5500)';
      cls = 'bar-mid';
    } else {
      grad = 'linear-gradient(90deg, #33ff33, #1a8c1a)';
      cls = 'bar-full';
    }
    return `
      <div class="hp-bar-wrap">
        <div class="hp-bar-fill ${cls}" style="width:${pctStr}%;background:${grad}"></div>
      </div>`;
  }

  /* ----------------------------------------------------------
     RENDER
     ---------------------------------------------------------- */
  function render(main, data) {
    initCombat(data);
    renderCombat(main);
  }

  function renderCombat(main) {
    if (!main) main = document.getElementById('main-content');
    const s = Game.getState();
    const alive = Game.getAliveParty();
    const actor = alive[cs.actorIdx];

    main.innerHTML = `
      <div id="screen-combat">
        <div class="combat-header">
          <span class="combat-header-sword">⚔</span>
          COMBAT
          <span class="combat-header-sword">⚔</span>
        </div>
        <div class="combat-field">
          ${renderPartyColumn(s)}
          <div class="combat-vs">VS</div>
          ${renderEnemyColumn()}
        </div>
        ${cs.phase === 'select' ? renderActionPanel(actor, s) : renderResolvingPanel()}
      </div>
    `;

    if (cs.phase === 'select' && actor) {
      attachActionHandlers(actor);
    }
  }

  function renderPartyColumn(s) {
    const alive = Game.getAliveParty();
    return `
      <div class="combat-party">
        <div class="combat-col-title ally-title">YOUR PARTY</div>
        ${s.party.map((ch, i) => {
          const isActor = alive[cs.actorIdx] === ch && cs.phase === 'select';
          const hpPct   = ch.hp.current / ch.hp.max;
          const hpCls   = hpPct < 0.25 ? 'low' : hpPct < 0.5 ? 'mid' : '';
          const rankColor = ch.rank === 'front' ? 'var(--red)' : ch.rank === 'rear' ? 'var(--cyan)' : 'var(--orange)';
          return `
            <div class="combatant-card ${!ch.alive ? 'dead' : ''} ${isActor ? 'active' : ''}"
                 style="border-left:3px solid ${!ch.alive ? 'var(--grey)' : hpPct < 0.25 ? 'var(--red)' : hpPct < 0.5 ? 'var(--orange)' : 'var(--fg)'}">
              <div style="display:flex;gap:6px;align-items:flex-start">
                ${getPortrait(ch.class, false)}
                <div style="flex:1;min-width:0">
                  <div class="combatant-name">${ch.name}</div>
                  <div style="font-size:11px;color:${rankColor}">[${ch.rank.toUpperCase()}] ${DATA.classes.find(c=>c.id===ch.class).name} Lv.${ch.level}</div>
                  ${ch.alive ? `
                    <div style="font-size:11px;margin-top:2px">
                      <span style="color:var(--fg)">${ch.hp.current}</span><span style="color:var(--grey)">/${ch.hp.max}</span>
                      <span style="color:var(--grey);font-size:10px"> HP</span>
                    </div>
                    ${hpBar(ch.hp.current, ch.hp.max, 'hp')}
                    ${ch.mp.max > 0 ? `
                    <div style="font-size:11px;margin-top:1px">
                      <span style="color:var(--cyan)">${ch.mp.current}</span><span style="color:var(--grey)">/${ch.mp.max}</span>
                      <span style="color:var(--grey);font-size:10px"> MP</span>
                    </div>
                    ${hpBar(ch.mp.current, ch.mp.max, 'mp')}` : ''}
                  ` : '<div class="combatant-hp low">DEAD</div>'}
                  ${renderStatusEffects(ch)}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderEnemyColumn() {
    return `
      <div class="combat-enemies">
        <div class="combat-col-title enemy-title">ENEMIES</div>
        ${cs.enemies.map((e, i) => {
          const hpPct = e.hpCur / e.hpMax;
          const statusLabel = e.status && e.status.length > 0 ? e.status.join(', ') : '';
          const dead = e.hpCur <= 0;
          const isTarget = (i === cs.targetEnemyIdx && !dead);
          return `
            <div class="combatant-card enemy-card ${dead ? 'dead' : ''} ${isTarget ? 'active' : ''}"
                 id="enemy-card-${i}"
                 data-enemy-idx="${i}"
                 style="cursor:${dead ? 'default' : 'pointer'};
                        border-left:3px solid ${dead ? 'var(--grey)' : isTarget ? 'var(--yellow)' : 'var(--red)'};
                        position:relative">
              <div style="display:flex;gap:6px;align-items:flex-start">
                ${getPortrait(e.id || 'goblin', true)}
                <div style="flex:1;min-width:0">
                  <div class="combatant-name">[${i+1}] ${e.name}</div>
                  <div style="font-size:11px;color:var(--grey)">[${(e.rank||'FRONT').toUpperCase()}]</div>
                  ${!dead ? `
                    <div style="font-size:11px;color:var(--orange);margin-top:2px">${describeHP(hpPct)}</div>
                    ${hpBar(e.hpCur, e.hpMax, 'enemy')}
                  ` : '<div style="color:var(--grey);font-size:12px">DEFEATED</div>'}
                  ${statusLabel ? `<div class="combatant-status">${statusLabel}</div>` : ''}
                  ${isTarget ? '<div style="color:var(--yellow);font-size:10px;margin-top:2px">◄ TARGET</div>' : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function describeHP(pct) {
    if (pct > 0.75) return 'Unharmed';
    if (pct > 0.5)  return 'Scratched';
    if (pct > 0.25) return 'Wounded';
    if (pct > 0.1)  return 'Badly Hurt';
    return 'Near Death';
  }

  function renderStatusEffects(ch) {
    if (!ch.combatStatus || !ch.combatStatus.length) return '';
    return `<div class="combatant-status">${ch.combatStatus.join(', ')}</div>`;
  }

  function renderActionPanel(actor, s) {
    if (!actor) return '<div class="combat-actions"></div>';

    if (cs.spellSelect) {
      return renderSpellPanel(actor);
    }

    const alive = Game.getAliveParty();
    return `
      <div class="combat-actions">
        <div class="combat-actions-title">
          ${actor.name} — Choose Action (Target: ${getLiveEnemy(cs.targetEnemyIdx)?.name || 'none'})
        </div>
        <div class="action-grid">
          <div class="action-btn" id="act-attack">
            Attack
            <span class="key">[A]</span>
          </div>
          <div class="action-btn" id="act-slash">
            Slash
            <span class="key">[S]</span>
          </div>
          <div class="action-btn" id="act-thrust">
            Thrust
            <span class="key">[T]</span>
          </div>
          <div class="action-btn" id="act-lunge">
            Lunge
            <span class="key">[L]</span>
          </div>
          ${actor.spells && actor.spells.length > 0 ? `
          <div class="action-btn" id="act-spell">
            Spell
            <span class="key">[C]</span>
          </div>` : ''}
          ${actor.potions && actor.potions.length > 0 ? `
          <div class="action-btn" id="act-potion">
            Potion (${actor.potions.length})
            <span class="key">[P]</span>
          </div>` : ''}
          <div class="action-btn" id="act-defend">
            Defend
            <span class="key">[D]</span>
          </div>
          <div class="action-btn" id="act-flee" style="color:var(--orange)">
            Flee
            <span class="key">[F]</span>
          </div>
        </div>
        <div style="margin-top:6px;color:var(--grey);font-size:12px">
          Click enemy card to change target &nbsp;|&nbsp;
          Actors: ${alive.filter((c,i) => i >= cs.actorIdx).map(c=>c.name).join(', ')}
        </div>
      </div>
    `;
  }

  function renderSpellPanel(actor) {
    const actorSpells = (actor.spells || []).map(id => DATA.spells.find(s => s.id === id)).filter(Boolean);
    return `
      <div class="combat-actions">
        <div class="combat-actions-title">${actor.name} — Choose Spell (MP: ${actor.mp.current}/${actor.mp.max})</div>
        <div class="spell-grid" id="spell-grid">
          ${actorSpells.map(sp => `
            <div class="spell-card ${actor.mp.current < sp.mp ? 'disabled' : ''}"
                 data-spell-id="${sp.id}"
                 style="cursor:${actor.mp.current >= sp.mp ? 'pointer' : 'not-allowed'}">
              <div class="spell-name">${sp.name}</div>
              <div class="spell-mp">${sp.mp} MP</div>
              <div class="spell-desc">${sp.desc}</div>
            </div>
          `).join('')}
        </div>
        <button class="btn" style="margin-top:6px" id="spell-cancel">[ CANCEL ]</button>
      </div>
    `;
  }

  function renderResolvingPanel() {
    return `
      <div class="combat-actions">
        <div class="combat-actions-title">RESOLVING COMBAT...</div>
        <div style="color:var(--white);font-size:13px;margin-top:8px">
          ${cs.log.slice(-5).map(l => `<div>${l}</div>`).join('')}
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     ACTION HANDLERS
     ---------------------------------------------------------- */
  function attachActionHandlers(actor) {
    // Enemy targeting
    document.querySelectorAll('.enemy-card[data-enemy-idx]').forEach(el => {
      el.onclick = () => {
        const idx = parseInt(el.dataset.enemyIdx);
        if (cs.enemies[idx] && cs.enemies[idx].hpCur > 0) {
          cs.targetEnemyIdx = idx;
          renderCombat();
        }
      };
    });

    const btn = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.onclick = fn;
    };

    btn('act-attack',  () => queueAction(actor, 'attack'));
    btn('act-slash',   () => queueAction(actor, 'slash'));
    btn('act-thrust',  () => queueAction(actor, 'thrust'));
    btn('act-lunge',   () => queueAction(actor, 'lunge'));
    btn('act-spell',   () => { cs.spellSelect = true; renderCombat(); });
    btn('act-potion',  () => usePotion(actor));
    btn('act-defend',  () => queueAction(actor, 'defend'));
    btn('act-flee',    () => attemptFlee());

    // Spell selection
    if (cs.spellSelect) {
      document.querySelectorAll('.spell-card[data-spell-id]').forEach(el => {
        el.onclick = () => {
          if (el.classList.contains('disabled')) return;
          const spId = el.dataset.spellId;
          cs.spellSelect = false;
          queueSpell(actor, spId);
        };
      });
      btn('spell-cancel', () => { cs.spellSelect = false; renderCombat(); });
    }
  }

  /* ----------------------------------------------------------
     COMBAT KEYBOARD (from game.js keydown handler)
     ---------------------------------------------------------- */
  function handleKey(key) {
    if (cs.phase !== 'select') return;
    const alive = Game.getAliveParty();
    const actor = alive[cs.actorIdx];
    if (!actor) return;

    if (cs.spellSelect) {
      if (key === 'Escape') { cs.spellSelect = false; renderCombat(); }
      return;
    }

    switch (key.toLowerCase()) {
      case 'a': queueAction(actor, 'attack');  break;
      case 's': queueAction(actor, 'slash');   break;
      case 't': queueAction(actor, 'thrust');  break;
      case 'l': queueAction(actor, 'lunge');   break;
      case 'c': if (actor.spells && actor.spells.length) { cs.spellSelect = true; renderCombat(); } break;
      case 'd': queueAction(actor, 'defend');  break;
      case 'f': attemptFlee(); break;
      case 'arrowleft':
      case 'arrowright': cycleTarget(key === 'arrowright' ? 1 : -1); break;
    }
  }

  function cycleTarget(dir) {
    const live = cs.enemies.map((e,i) => i).filter(i => cs.enemies[i].hpCur > 0);
    if (live.length === 0) return;
    const cur = live.indexOf(cs.targetEnemyIdx);
    const next = (cur + dir + live.length) % live.length;
    cs.targetEnemyIdx = live[next];
    renderCombat();
  }

  /* ----------------------------------------------------------
     QUEUE ACTION FOR A PARTY MEMBER
     ---------------------------------------------------------- */
  function queueAction(actor, type) {
    const alive = Game.getAliveParty();
    const target = getLiveEnemy(cs.targetEnemyIdx) || getFirstLiveEnemy();
    cs.actions.push({ type, actor, target: target ? cs.enemies.indexOf(target) : -1 });
    advanceActor();
  }

  function queueSpell(actor, spellId) {
    const target = getLiveEnemy(cs.targetEnemyIdx) || getFirstLiveEnemy();
    cs.actions.push({ type: 'spell', spellId, actor, target: target ? cs.enemies.indexOf(target) : -1 });
    advanceActor();
  }

  function usePotion(actor) {
    if (!actor.potions || actor.potions.length === 0) return;
    cs.actions.push({ type: 'potion', actor, potionId: actor.potions[0] });
    advanceActor();
  }

  function advanceActor() {
    const alive = Game.getAliveParty();
    cs.actorIdx++;
    if (cs.actorIdx >= alive.length) {
      // All party members have acted; resolve round
      resolveRound();
    } else {
      // Next actor might need to auto-target
      autoTarget();
      renderCombat();
    }
  }

  function autoTarget() {
    const live = getFirstLiveEnemy();
    if (live) cs.targetEnemyIdx = cs.enemies.indexOf(live);
  }

  /* ----------------------------------------------------------
     RESOLVE A FULL COMBAT ROUND
     ---------------------------------------------------------- */
  function resolveRound() {
    cs.phase = 'resolving';
    cs.log = [];
    renderCombat();

    // Small delay so player sees the "resolving" state
    setTimeout(() => {
      // Party actions
      cs.actions.forEach(action => {
        if (!action.actor.alive || action.actor.hp.current <= 0) return;
        resolvePartyAction(action);
      });

      // Enemy actions
      const alive = Game.getAliveParty();
      cs.enemies.forEach(enemy => {
        if (enemy.hpCur <= 0) return;
        resolveEnemyAction(enemy, alive);
      });

      // Tick buffs/debuffs
      tickStatuses();

      // Log to message box
      cs.log.forEach(l => Game.addMessage(l, 'msg-combat'));

      // Check end conditions
      if (checkVictory()) return;
      if (checkDefeat()) return;

      // Next round
      cs.actions = [];
      cs.actorIdx = 0;
      cs.phase = 'select';
      autoTarget();
      renderCombat();
    }, 600);
  }

  /* ----------------------------------------------------------
     PARTY ACTION RESOLUTION
     ---------------------------------------------------------- */
  function resolvePartyAction(action) {
    const { type, actor, target } = action;

    switch (type) {
      case 'attack':
      case 'slash':
      case 'thrust':
      case 'lunge':
        resolveAttack(actor, target, type);
        break;
      case 'spell':
        resolveSpell(actor, action.spellId, target);
        break;
      case 'potion':
        resolvePotion(actor, action.potionId);
        break;
      case 'defend':
        if (!actor.combatStatus) actor.combatStatus = [];
        actor.combatStatus.push('Defending');
        cs.log.push(`${actor.name} takes a defensive stance.`);
        break;
    }
  }

  function resolveAttack(actor, enemyIdx, type) {
    const enemy = cs.enemies[enemyIdx];
    if (!enemy || enemy.hpCur <= 0) {
      // auto-redirect to live enemy
      const live = getFirstLiveEnemy();
      if (!live) return;
      enemyIdx = cs.enemies.indexOf(live);
    }
    const target = cs.enemies[enemyIdx];
    if (!target || target.hpCur <= 0) return;

    const cls = DATA.classes.find(c => c.id === actor.class);
    const weapon = DATA.weapons.find(w => w.id === actor.equipment.weapon) ||
                   DATA.weapons.find(w => w.id === 'fists');

    // Number of hits and damage per action type
    let hitCount = 1, dmgMult = 1.0;
    switch (type) {
      case 'attack': hitCount = 2; dmgMult = 0.85; break;
      case 'slash':  hitCount = 3; dmgMult = 0.70; break;
      case 'thrust': hitCount = 1; dmgMult = 1.30; break;
      case 'lunge':  hitCount = 1; dmgMult = 1.10; break;
    }

    // Hit chance: base 70% + str mod + class bonus - enemy dex
    const hitChance = 0.70 + CharScreen.statMod(actor.stats.str) * 0.05
                           + (cls.hitBonus || 0) * 0.04
                           + (actor.hitBonus || 0) * 0.04
                           - (CharScreen.statMod(target.dex) * 0.04);

    let totalDmg = 0;
    let hits = 0;

    for (let i = 0; i < hitCount; i++) {
      if (Math.random() < hitChance) {
        hits++;
        const baseDmg = rollDamage(weapon.damage);
        const strBonus = Math.max(0, CharScreen.statMod(actor.stats.str));
        const augBonus = weapon.aug || 0;
        // Apply weakness debuffs
        const weakMult = target.status && target.status.includes('weak3') ? 0.5
                       : target.status && target.status.includes('weak2') ? 0.65
                       : target.status && target.status.includes('weak1') ? 0.8 : 1.0;
        const partyHit = cs.partyBufs.hitBonus ? cs.partyBufs.hitBonus.amount : 0;
        let dmg = Math.max(1, Math.floor((baseDmg + strBonus + augBonus + partyHit) * dmgMult * weakMult));

        // Armor mitigation
        const armor = DATA.armors.find(a => a.id === target.ac) ||
                      { ac: typeof target.ac === 'number' ? target.ac : 0 };
        const ac = typeof target.ac === 'number' ? target.ac : (armor.ac || 0);
        dmg = Math.max(1, dmg - Math.floor(ac / 3));

        totalDmg += dmg;
        applyWound(actor, target);
      }
    }

    if (hits > 0) {
      target.hpCur = Math.max(0, target.hpCur - totalDmg);
      cs.log.push(`${actor.name} ${type}s ${target.name} for ${totalDmg} damage! (${hits}/${hitCount} hits)`);

      if (target.hpCur <= 0) {
        cs.log.push(`${target.name} is slain!`);
      }
    } else {
      cs.log.push(`${actor.name}'s ${type} misses ${target.name}!`);
    }
  }

  function rollDamage(dmgStr) {
    // Parse "2d6+3" or "1d8" format
    const match = dmgStr.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return 1;
    const [,count,sides,bonus] = match;
    let total = 0;
    for (let i = 0; i < parseInt(count); i++) {
      total += 1 + Math.floor(Math.random() * parseInt(sides));
    }
    return total + (parseInt(bonus) || 0);
  }

  function applyWound(attacker, enemy) {
    // Small chance to apply wound location to attacker from retaliation or to enemy
    // (simplified: wounds tracked on party characters only)
  }

  /* ----------------------------------------------------------
     SPELL RESOLUTION
     ---------------------------------------------------------- */
  function resolveSpell(actor, spellId, enemyIdx) {
    const spell = DATA.spells.find(s => s.id === spellId);
    if (!spell) return;

    if (actor.mp.current < spell.mp) {
      cs.log.push(`${actor.name} lacks MP to cast ${spell.name}!`);
      return;
    }

    actor.mp.current -= spell.mp;
    const effect = spell.effect(actor, cs.enemies[enemyIdx]);

    switch (effect.type) {
      case 'damage': {
        const target = cs.enemies[enemyIdx] || getFirstLiveEnemy();
        if (!target || target.hpCur <= 0) break;
        target.hpCur = Math.max(0, target.hpCur - effect.amount);
        cs.log.push(`${actor.name} casts ${spell.name} on ${target.name} for ${effect.amount} damage!`);
        if (effect.status) {
          if (!target.status) target.status = [];
          target.status.push(effect.status);
        }
        if (target.hpCur <= 0) cs.log.push(`${target.name} is slain!`);
        break;
      }
      case 'damage_all': {
        cs.enemies.forEach(e => {
          if (e.hpCur <= 0) return;
          const dmg = Math.max(1, effect.amount + (Math.random() > 0.5 ? 1 : -1) * Math.floor(effect.amount * 0.2));
          e.hpCur = Math.max(0, e.hpCur - dmg);
          cs.log.push(`${actor.name}'s ${spell.name} hits ${e.name} for ${dmg} damage!`);
          if (e.hpCur <= 0) cs.log.push(`${e.name} is slain!`);
        });
        break;
      }
      case 'heal': {
        const healTarget = getMostInjuredAlly();
        if (healTarget) {
          const before = healTarget.hp.current;
          healTarget.hp.current = Math.min(healTarget.hp.max, healTarget.hp.current + effect.amount);
          const healed = healTarget.hp.current - before;
          cs.log.push(`${actor.name} casts ${spell.name}, restoring ${healed} HP to ${healTarget.name}.`);
          spawnFloatNumber(healTarget.name, healed, true);
        }
        break;
      }
      case 'raise': {
        const dead = Game.getState().party.find(c => !c.alive);
        if (dead) {
          dead.alive = true;
          dead.hp.current = effect.amount;
          cs.log.push(`${actor.name} raises ${dead.name} from the dead!`);
        } else {
          cs.log.push(`${spell.name}: No fallen allies to revive.`);
        }
        break;
      }
      case 'restore_mp': {
        actor.mp.current = Math.min(actor.mp.max, actor.mp.current + effect.amount);
        cs.log.push(`${actor.name} meditates, restoring ${effect.amount} MP.`);
        break;
      }
      case 'status': {
        const target = cs.enemies[enemyIdx] || getFirstLiveEnemy();
        if (!target || target.hpCur <= 0) break;
        if (!target.status) target.status = [];
        target.status.push(effect.status);
        cs.log.push(`${actor.name} afflicts ${target.name} with ${effect.status}!`);
        break;
      }
      case 'party_buff': {
        cs.partyBufs[effect.stat] = { amount: effect.amount, turns: effect.turns || 3 };
        cs.log.push(`${actor.name} casts ${spell.name}, buffing the party!`);
        break;
      }
      case 'self_buff': {
        if (!actor.combatStatus) actor.combatStatus = [];
        actor.combatStatus.push(effect.stat);
        cs.log.push(`${actor.name} casts ${spell.name} on themselves.`);
        break;
      }
      case 'flee_success': {
        cs.log.push(`${actor.name} casts Teleport! The party escapes!`);
        endCombat(false, 'flee_spell');
        return;
      }
      case 'steal': {
        const target = cs.enemies[enemyIdx] || getFirstLiveEnemy();
        if (target && target.hpCur > 0) {
          const stolen = Math.min(effect.amount, Math.floor(target.gold ? target.gold[0] : 5));
          Game.getState().partyGold += stolen;
          cs.log.push(`${actor.name} steals ${stolen} gold from ${target.name}!`);
        }
        break;
      }
      case 'dispel': {
        const target = cs.enemies[enemyIdx] || getFirstLiveEnemy();
        if (target) { target.status = []; cs.log.push(`${actor.name} dispels magic from ${target.name}.`); }
        break;
      }
      default:
        cs.log.push(`${actor.name} casts ${spell.name}.`);
    }

    Game.renderHUD();
  }

  function getMostInjuredAlly() {
    return Game.getAliveParty().sort((a, b) => {
      const pa = a.hp.current / a.hp.max;
      const pb = b.hp.current / b.hp.max;
      return pa - pb;
    })[0] || null;
  }

  /* ----------------------------------------------------------
     POTION USE
     ---------------------------------------------------------- */
  function resolvePotion(actor, potionId) {
    const potion = DATA.potions.find(p => p.id === potionId);
    if (!potion) return;

    // Remove from inventory
    const idx = actor.potions.indexOf(potionId);
    if (idx >= 0) actor.potions.splice(idx, 1);

    const eff = potion.effect;
    switch (eff.type) {
      case 'heal': {
        const amt = roll(eff.amount[0], eff.amount[1]);
        actor.hp.current = Math.min(actor.hp.max, actor.hp.current + amt);
        cs.log.push(`${actor.name} drinks ${potion.name}, restoring ${amt} HP.`);
        break;
      }
      case 'restore_mp': {
        const amt = roll(eff.amount[0], eff.amount[1]);
        actor.mp.current = Math.min(actor.mp.max, actor.mp.current + amt);
        cs.log.push(`${actor.name} drinks ${potion.name}, restoring ${amt} MP.`);
        break;
      }
      case 'raise': {
        actor.alive = true;
        actor.hp.current = eff.amount;
        cs.log.push(`${actor.name} is revived by Phoenix Down!`);
        break;
      }
      case 'cure_status': {
        if (actor.combatStatus) actor.combatStatus = actor.combatStatus.filter(s => s !== eff.status);
        cs.log.push(`${actor.name} cures ${eff.status}.`);
        break;
      }
    }
    Game.renderHUD();
  }

  function roll(count, sides) {
    let t = 0;
    for (let i = 0; i < count; i++) t += 1 + Math.floor(Math.random() * sides);
    return t;
  }

  /* ----------------------------------------------------------
     ENEMY AI
     ---------------------------------------------------------- */
  function resolveEnemyAction(enemy, aliveParty) {
    if (!aliveParty || aliveParty.length === 0) return;

    // Confused enemies attack randomly, sometimes each other
    if (enemy.status && enemy.status.includes('confused')) {
      if (Math.random() < 0.4) {
        cs.log.push(`${enemy.name} is confused and stands still!`);
        return;
      }
    }

    // Slowed enemies skip 50% of the time
    if (enemy.status && enemy.status.includes('slowed')) {
      if (Math.random() < 0.5) {
        cs.log.push(`${enemy.name} is slowed!`);
        return;
      }
    }

    // Choose a target (prefer front rank, then middle, then rear)
    const frontParty = aliveParty.filter(c => c.rank === 'front');
    const midParty   = aliveParty.filter(c => c.rank === 'middle');
    const rearParty  = aliveParty.filter(c => c.rank === 'rear');
    let pool = frontParty.length > 0 ? frontParty : midParty.length > 0 ? midParty : rearParty;
    if (!pool.length) return;
    const target = pool[Math.floor(Math.random() * pool.length)];

    // Special abilities
    if (enemy.special === 'regenerate' && enemy.hpCur < enemy.hpMax) {
      const regen = Math.floor(enemy.hpMax * 0.1);
      enemy.hpCur = Math.min(enemy.hpMax, enemy.hpCur + regen);
      cs.log.push(`${enemy.name} regenerates ${regen} HP!`);
    }

    // Spellcasting enemies
    if (enemy.spells && enemy.spells.length > 0 && Math.random() < 0.35) {
      const spId = enemy.spells[Math.floor(Math.random() * enemy.spells.length)];
      const sp = DATA.spells.find(s => s.id === spId);
      if (sp) {
        const effect = sp.effect({ level: 5, int: 12 }, target);
        if (effect.type === 'damage') {
          const dmg = Math.max(1, effect.amount);
          applyDamageToChar(target, dmg, enemy.name, sp.name);
          return;
        }
        if (effect.type === 'status') {
          if (!target.combatStatus) target.combatStatus = [];
          target.combatStatus.push(effect.status);
          cs.log.push(`${enemy.name} casts ${sp.name} on ${target.name}!`);
          return;
        }
      }
    }

    // Special attacks
    if (enemy.special === 'breathe_fire') {
      const party = aliveParty;
      const dmg = Math.floor(roll(3, 8) * 0.7);
      party.forEach(ch => applyDamageToChar(ch, dmg, enemy.name, 'fire breath'));
      return;
    }

    if (enemy.special === 'drain_hp') {
      const dmg = roll(1, 8);
      enemy.hpCur = Math.min(enemy.hpMax, enemy.hpCur + Math.floor(dmg / 2));
      applyDamageToChar(target, dmg, enemy.name, 'life drain');
      return;
    }

    // Normal melee attack
    enemyMeleeAttack(enemy, target);
  }

  function enemyMeleeAttack(enemy, target) {
    // Hit chance: enemy str vs target dex + armor
    const armor = DATA.armors.find(a => a.id === target.equipment.armor) || { ac: 0 };
    const shield = DATA.shields.find(s => s.id === target.equipment.shield) || { ac: 0 };
    const totalAC = (armor.ac || 0) + (shield.ac || 0) + (target.acBonus || 0);

    const hitChance = Math.max(0.1, 0.65 + CharScreen.statMod(enemy.scaledStr || enemy.str) * 0.04
                                        - totalAC * 0.04);

    // Defending reduces incoming damage
    const defending = target.combatStatus && target.combatStatus.includes('Defending');

    if (Math.random() < hitChance) {
      let dmg = rollDamage(enemy.dmg);
      if (defending) dmg = Math.max(1, Math.floor(dmg * 0.5));
      // AC mitigation
      dmg = Math.max(1, dmg - Math.floor(totalAC / 4));
      applyDamageToChar(target, dmg, enemy.name, 'attacks');
    } else {
      cs.log.push(`${enemy.name} misses ${target.name}.`);
    }
  }

  function applyDamageToChar(ch, dmg, attackerName, verb) {
    if (!ch.alive) return;
    ch.hp.current = Math.max(0, ch.hp.current - dmg);
    cs.log.push(`${attackerName} ${verb} ${ch.name} for ${dmg} damage! (${ch.hp.current}/${ch.hp.max} HP)`);
    spawnFloatNumber(ch.name, dmg, false);

    if (ch.hp.current <= 0) {
      const locs = ['head','torso','leftArm','rightArm','leftLeg','rightLeg'];
      const loc = locs[Math.floor(Math.random() * locs.length)];
      const severity = Math.random();
      if (severity < 0.5)      ch.wounds[loc] = 'minor';
      else if (severity < 0.8) ch.wounds[loc] = 'broken';
      else                     ch.wounds[loc] = 'removed';

      ch.alive = false;
      cs.log.push(`${ch.name} has fallen! (${loc} ${ch.wounds[loc]})`);
      Game.renderHUD();
    }
  }

  /* ----------------------------------------------------------
     FLOATING DAMAGE NUMBERS
     ---------------------------------------------------------- */
  function spawnFloatNumber(targetName, amount, isHeal) {
    // Attach to whatever combatant card is rendered for this target
    const cards = document.querySelectorAll('.combatant-card, .enemy-card');
    let card = null;
    cards.forEach(c => {
      const nameEl = c.querySelector('.combatant-name');
      if (nameEl && nameEl.textContent.includes(targetName)) card = c;
    });
    if (!card) return;

    const el = document.createElement('div');
    el.className = isHeal ? 'dmg-float heal-float' : 'dmg-float';
    el.textContent = isHeal ? `+${amount}` : `-${amount}`;
    // Position randomly within card
    el.style.left = (20 + Math.random() * 40) + 'px';
    el.style.top  = '0px';
    card.style.position = 'relative';
    card.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  /* ----------------------------------------------------------
     STATUS TICKS
     ---------------------------------------------------------- */
  function tickStatuses() {
    // Tick party buffs
    Object.keys(cs.partyBufs).forEach(stat => {
      cs.partyBufs[stat].turns--;
      if (cs.partyBufs[stat].turns <= 0) delete cs.partyBufs[stat];
    });

    // Clear defending status from party
    Game.getState().party.forEach(ch => {
      if (ch.combatStatus) {
        ch.combatStatus = ch.combatStatus.filter(s => s !== 'Defending');
      }
    });

    // Troll/special regen handled per enemy in resolveEnemyAction
  }

  /* ----------------------------------------------------------
     FLEE
     ---------------------------------------------------------- */
  function attemptFlee() {
    if (cs.isFinalBoss) {
      cs.log.push('You cannot flee from the final battle!');
      cs.log.forEach(l => Game.addMessage(l, 'msg-combat'));
      cs.log = [];
      return;
    }

    // Flee chance: dex-based, 40% base
    const alive = Game.getAliveParty();
    const avgDex = alive.reduce((a, c) => a + c.stats.dex, 0) / alive.length;
    const fleeChance = 0.4 + CharScreen.statMod(avgDex) * 0.05;

    if (Math.random() < fleeChance) {
      Game.addMessage('The party flees from battle!', 'msg-combat');
      endCombat(false, 'fled');
    } else {
      // Failed flee - enemies get a free attack
      cs.actions = [];
      Game.addMessage('Failed to flee! Enemies attack!', 'msg-combat');
      const party = Game.getAliveParty();
      cs.enemies.forEach(e => { if (e.hpCur > 0) resolveEnemyAction(e, party); });
      cs.log.forEach(l => Game.addMessage(l, 'msg-combat'));
      cs.log = [];

      if (checkDefeat()) return;
      cs.actorIdx = 0;
      autoTarget();
      renderCombat();
    }
  }

  /* ----------------------------------------------------------
     END CONDITIONS
     ---------------------------------------------------------- */
  function checkVictory() {
    if (cs.enemies.every(e => e.hpCur <= 0)) {
      // Award XP and gold
      const xpTotal  = cs.enemies.reduce((a, e) => a + (e.xp || 0), 0);
      const goldMin  = cs.enemies.reduce((a, e) => a + (e.gold ? e.gold[0] : 0), 0);
      const goldMax  = cs.enemies.reduce((a, e) => a + (e.gold ? e.gold[1] : 5), 0);
      const goldWon  = goldMin + Math.floor(Math.random() * (goldMax - goldMin + 1));

      const s = Game.getState();
      s.partyGold += goldWon;

      // Distribute XP to alive party
      const alive = Game.getAliveParty();
      const xpEach = Math.floor(xpTotal / Math.max(1, alive.length));
      alive.forEach(ch => {
        ch.xp += xpEach;
      });

      Game.addMessage(`Victory! Won ${goldWon} gold, ${xpEach} XP each.`, 'msg-gold');
      Game.renderHUD();

      // Clean up combat statuses
      s.party.forEach(ch => { ch.combatStatus = []; });

      // Run custom victory callback (e.g., dungeon boss logic)
      if (cs.onVictory) {
        cs.onVictory();
        return true;
      }

      // Check if final boss
      if (cs.isFinalBoss) {
        Game.getState().questFlags.malacharDefeated = true;
        Game.save();
        Game.showScreen('victory');
        return true;
      }

      Game.showScreen(cs.returnScreen);
      return true;
    }
    return false;
  }

  function checkDefeat() {
    const alive = Game.getAliveParty();
    if (alive.length === 0) {
      cs.log.forEach(l => Game.addMessage(l, 'msg-combat'));
      Game.addMessage('Your party has been defeated!', 'msg-combat');
      Game.showScreen('gameover', { message: 'Your party was wiped out in battle.' });
      return true;
    }
    return false;
  }

  function endCombat(victory, reason) {
    const s = Game.getState();
    s.party.forEach(ch => { if (ch.combatStatus) ch.combatStatus = []; });

    if (reason === 'fled' || reason === 'flee_spell') {
      Game.showScreen(cs.returnScreen);
    }
  }

  /* ----------------------------------------------------------
     UTILITIES
     ---------------------------------------------------------- */
  function getLiveEnemy(idx) {
    const e = cs.enemies[idx];
    return e && e.hpCur > 0 ? e : null;
  }

  function getFirstLiveEnemy() {
    return cs.enemies.find(e => e.hpCur > 0) || null;
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    render,
    handleKey
  };

})();
