/* ============================================================
   PHANTASIE III - TOWN SYSTEM
   Town menu, Guild, Bank, Inn, Armory, Mystic
   ============================================================ */

const TownScreen = (function() {
  'use strict';

  /* ----------------------------------------------------------
     TOWN MAIN MENU
     ---------------------------------------------------------- */
  function render(main, data) {
    const townId = data.townId;
    const town = DATA.towns.find(t => t.id === townId);
    if (!town) {
      main.innerHTML = `<div class="panel"><p class="text-red">Unknown town: ${townId}</p></div>`;
      return;
    }

    main.innerHTML = `
      <div style="padding:16px">
        <div class="town-header">
          <div class="town-name">${town.name}</div>
          <div class="town-desc">${town.desc}</div>
        </div>
        <div class="service-menu">
          <div class="service-btn" id="svc-guild">
            <span class="svc-icon">⚔</span>
            Guild
            <div class="svc-key">[1]</div>
          </div>
          <div class="service-btn" id="svc-bank">
            <span class="svc-icon">$</span>
            Bank
            <div class="svc-key">[2]</div>
          </div>
          <div class="service-btn" id="svc-inn">
            <span class="svc-icon">~</span>
            Inn
            <div class="svc-key">[3]</div>
          </div>
          <div class="service-btn" id="svc-armory">
            <span class="svc-icon">#</span>
            Armory
            <div class="svc-key">[4]</div>
          </div>
          <div class="service-btn" id="svc-mystic">
            <span class="svc-icon">*</span>
            Mystic
            <div class="svc-key">[5]</div>
          </div>
          <div class="service-btn" id="svc-party">
            <span class="svc-icon">@</span>
            Party
            <div class="svc-key">[6]</div>
          </div>
        </div>
        <button class="btn" style="margin-top:16px" id="svc-leave">[ LEAVE TOWN ]  [0]</button>
        <p class="text-grey" style="margin-top:8px;font-size:12px">
          Party Gold: <span class="text-yellow">${Game.getState().partyGold}</span>
        </p>
      </div>
    `;

    document.getElementById('svc-guild').onclick  = () => Game.showScreen('guild',  { townId });
    document.getElementById('svc-bank').onclick   = () => Game.showScreen('bank',   { townId });
    document.getElementById('svc-inn').onclick    = () => Game.showScreen('inn',    { townId });
    document.getElementById('svc-armory').onclick = () => Game.showScreen('armory', { townId });
    document.getElementById('svc-mystic').onclick = () => Game.showScreen('mystic', { townId });
    document.getElementById('svc-party').onclick  = () => Game.showScreen('partymanage', { returnScreen: 'town', returnData: { townId } });
    document.getElementById('svc-leave').onclick  = () => Game.showScreen('overworld');
  }

  /* ----------------------------------------------------------
     GUILD
     ---------------------------------------------------------- */
  function renderGuild(main, data) {
    const { townId } = data;
    const s = Game.getState();

    const levelers = s.party.filter(ch => ch.alive && CharScreen.canLevelUp(ch));

    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">THE ADVENTURERS GUILD — ${DATA.towns.find(t=>t.id===townId).name}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <p class="text-grey" style="margin-bottom:8px;font-size:13px">PARTY MEMBERS</p>
            <table class="party-table">
              <thead><tr>
                <th>Name</th><th>Class</th><th>Lv</th><th>XP</th><th>Next</th><th>Action</th>
              </tr></thead>
              <tbody>
                ${s.party.map((ch, i) => `
                  <tr>
                    <td class="${ch.alive ? 'text-yellow' : 'text-grey'}">${ch.name}</td>
                    <td>${DATA.classes.find(c=>c.id===ch.class).name}</td>
                    <td>${ch.level}</td>
                    <td>${ch.xp}</td>
                    <td>${ch.xpToNext}</td>
                    <td>
                      ${ch.alive && CharScreen.canLevelUp(ch)
                        ? `<button class="btn btn-primary" style="font-size:11px;padding:2px 8px"
                            onclick="TownScreen.doLevelUp(${i}, '${townId}')">TRAIN!</button>`
                        : `<button class="btn" style="font-size:11px;padding:2px 8px"
                            onclick="Game.showScreen('charsheet', {char: Game.getState().party[${i}], idx:${i}, returnScreen:'guild', returnData:{townId:'${townId}'}})">View</button>`
                      }
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div>
            <p class="text-grey" style="margin-bottom:8px;font-size:13px">GUILD SERVICES</p>
            <div style="display:flex;flex-direction:column;gap:6px">
              <button class="btn" onclick="Game.showScreen('charcreate', {mode:'partyBuild'})">
                + Recruit New Adventurer
              </button>
              <button class="btn" onclick="Game.showScreen('partymanage', {returnScreen:'guild', returnData:{townId:'${townId}'}})">
                Manage Party Order
              </button>
            </div>
            ${levelers.length > 0 ? `
            <div class="panel" style="margin-top:12px;background:#001a00;border-color:var(--fg)">
              <p class="text-fg" style="font-size:12px">
                ${levelers.map(ch => `<span class="text-yellow">${ch.name}</span>`).join(', ')}
                ${levelers.length === 1 ? 'is' : 'are'} ready to advance!
              </p>
            </div>` : ''}
          </div>
        </div>
        <button class="btn" style="margin-top:12px" onclick="Game.showScreen('town', {townId:'${townId}'})">[ BACK ]</button>
      </div>
    `;
  }

  function doLevelUp(idx, townId) {
    const s = Game.getState();
    const ch = s.party[idx];
    const cost = CharScreen.levelUpCost(ch);

    if (s.partyGold < cost) {
      Game.addMessage(`Not enough gold! Training costs ${cost} gold.`, 'msg-gold');
      return;
    }

    // Confirm cost
    if (!confirm(`Train ${ch.name} to level ${ch.level + 1} for ${cost} gold?`)) return;

    s.partyGold -= cost;
    Game.showScreen('levelup', { char: ch, idx, townId });
  }

  /* ----------------------------------------------------------
     BANK
     ---------------------------------------------------------- */
  function renderBank(main, data) {
    const { townId } = data;
    const s = Game.getState();
    if (!s.bankAccounts) s.bankAccounts = {};

    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">THE BANK — ${DATA.towns.find(t=>t.id===townId).name}</div>
        <p style="margin-bottom:12px;color:var(--white)">
          Party Chest: <span class="text-yellow">${s.partyGold}</span> gold
        </p>
        <p class="text-grey" style="font-size:12px;margin-bottom:8px">Character Accounts:</p>
        <table class="party-table" style="margin-bottom:12px">
          <thead><tr>
            <th>Name</th><th>Held</th><th>Bank</th><th>Deposit</th><th>Withdraw</th>
          </tr></thead>
          <tbody>
            ${s.party.map((ch, i) => `
              <tr>
                <td class="text-yellow">${ch.name}</td>
                <td>${ch.gold}</td>
                <td class="text-yellow">${s.bankAccounts[ch.id] || 0}</td>
                <td><button class="btn" style="font-size:11px;padding:2px 6px"
                    onclick="TownScreen.bankDeposit(${i}, '${townId}')">Dep</button></td>
                <td><button class="btn" style="font-size:11px;padding:2px 6px"
                    onclick="TownScreen.bankWithdraw(${i}, '${townId}')">With</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary" onclick="TownScreen.depositPartyGold('${townId}')">
            Deposit Party Gold
          </button>
          <button class="btn" onclick="Game.showScreen('town', {townId:'${townId}'})">[ BACK ]</button>
        </div>
      </div>
    `;
  }

  function bankDeposit(charIdx, townId) {
    const s = Game.getState();
    const ch = s.party[charIdx];
    if (ch.gold <= 0) { Game.addMessage('No gold to deposit.', 'msg-gold'); return; }
    const amtStr = prompt(`Deposit how much? (Have: ${ch.gold})`);
    const amt = parseInt(amtStr);
    if (isNaN(amt) || amt <= 0) return;
    const actual = Math.min(amt, ch.gold);
    ch.gold -= actual;
    if (!s.bankAccounts) s.bankAccounts = {};
    s.bankAccounts[ch.id] = (s.bankAccounts[ch.id] || 0) + actual;
    Game.addMessage(`Deposited ${actual} gold for ${ch.name}.`, 'msg-gold');
    renderBank(document.getElementById('main-content'), { townId });
  }

  function bankWithdraw(charIdx, townId) {
    const s = Game.getState();
    const ch = s.party[charIdx];
    if (!s.bankAccounts) s.bankAccounts = {};
    const balance = s.bankAccounts[ch.id] || 0;
    if (balance <= 0) { Game.addMessage('No funds in account.', 'msg-gold'); return; }
    const amtStr = prompt(`Withdraw how much? (Balance: ${balance})`);
    const amt = parseInt(amtStr);
    if (isNaN(amt) || amt <= 0) return;
    const actual = Math.min(amt, balance);
    s.bankAccounts[ch.id] -= actual;
    ch.gold += actual;
    Game.addMessage(`Withdrew ${actual} gold for ${ch.name}.`, 'msg-gold');
    renderBank(document.getElementById('main-content'), { townId });
  }

  function depositPartyGold(townId) {
    const s = Game.getState();
    if (s.partyGold <= 0) { Game.addMessage('Party chest is empty.', 'msg-gold'); return; }
    const amtStr = prompt(`Deposit how much from party chest? (Have: ${s.partyGold})`);
    const amt = parseInt(amtStr);
    if (isNaN(amt) || amt <= 0) return;
    const actual = Math.min(amt, s.partyGold);
    // Distribute to first alive character's account
    const ch = s.party.find(c => c.alive);
    if (!ch) return;
    if (!s.bankAccounts) s.bankAccounts = {};
    s.partyGold -= actual;
    s.bankAccounts[ch.id] = (s.bankAccounts[ch.id] || 0) + actual;
    Game.addMessage(`Deposited ${actual} gold into ${ch.name}'s account.`, 'msg-gold');
    renderBank(document.getElementById('main-content'), { townId });
  }

  /* ----------------------------------------------------------
     INN
     ---------------------------------------------------------- */
  function renderInn(main, data) {
    const { townId } = data;
    const s = Game.getState();
    const aliveCount = s.party.filter(c => c.alive).length;
    const costPerPerson = 15;
    const totalCost = costPerPerson * aliveCount;

    main.innerHTML = `
      <div style="padding:16px;max-width:500px">
        <div class="panel-title">THE INN — ${DATA.towns.find(t=>t.id===townId).name}</div>
        <div class="panel" style="margin:0 0 16px 0;color:var(--white);line-height:1.8">
          <p>"Welcome, weary travelers! A warm bed and a hot meal await."</p>
          <br>
          <p>Cost: <span class="text-yellow">${costPerPerson} gold</span> per person
             (${aliveCount} alive = <span class="text-yellow">${totalCost} gold</span> total)</p>
          <p>Party Gold: <span class="text-yellow">${s.partyGold}</span></p>
        </div>
        <p class="text-grey" style="font-size:12px;margin-bottom:12px">
          Resting will restore all HP and MP, and heal injuries (not permanent wounds).
        </p>
        <div style="display:flex;gap:10px">
          <button class="btn btn-primary" id="btn-rest">[ REST (${totalCost} gold) ]</button>
          <button class="btn" onclick="Game.showScreen('town', {townId:'${townId}'})">[ BACK ]</button>
        </div>
      </div>
    `;

    document.getElementById('btn-rest').onclick = () => {
      if (s.partyGold < totalCost) {
        Game.addMessage(`Not enough gold! Need ${totalCost}, have ${s.partyGold}.`, 'msg-gold');
        return;
      }
      s.partyGold -= totalCost;

      s.party.forEach(ch => {
        if (!ch.alive) return;
        ch.hp.current = ch.hp.max;
        ch.mp.current = ch.mp.max;
        // Heal minor/broken wounds (not removed)
        Object.keys(ch.wounds).forEach(loc => {
          if (ch.wounds[loc] === 'minor' || ch.wounds[loc] === 'broken') {
            ch.wounds[loc] = 'ok';
          }
        });
      });

      Game.addMessage('Your party rests. HP and MP fully restored!', 'msg-info');
      Game.renderHUD();
      Game.save();
      renderInn(main, data);
    };
  }

  /* ----------------------------------------------------------
     ARMORY
     ---------------------------------------------------------- */
  let armoryMode = 'main';   // 'main' | 'buy-weapon' | 'buy-armor' | 'buy-shield' | 'sell'
  let armoryCharIdx = 0;

  function renderArmory(main, data) {
    const { townId } = data;
    armoryMode = 'main';

    const s = Game.getState();
    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">THE ARMORY — ${DATA.towns.find(t=>t.id===townId).name}</div>
        <p class="text-white" style="margin-bottom:12px">
          Party Gold: <span class="text-yellow">${s.partyGold}</span>
        </p>
        <div class="service-menu" style="grid-template-columns:repeat(4,1fr)">
          <div class="service-btn" onclick="TownScreen.showShopBuy('weapon', '${townId}')">
            <span class="svc-icon">|</span>Weapons<div class="svc-key">[1]</div>
          </div>
          <div class="service-btn" onclick="TownScreen.showShopBuy('armor', '${townId}')">
            <span class="svc-icon">]</span>Armor<div class="svc-key">[2]</div>
          </div>
          <div class="service-btn" onclick="TownScreen.showShopBuy('shield', '${townId}')">
            <span class="svc-icon">O</span>Shields<div class="svc-key">[3]</div>
          </div>
          <div class="service-btn" onclick="TownScreen.showShopBuy('potion', '${townId}')">
            <span class="svc-icon">!</span>Potions<div class="svc-key">[4]</div>
          </div>
        </div>
        <button class="btn btn-danger" style="margin-top:8px" onclick="TownScreen.showShopSell('${townId}')">
          [ SELL EQUIPMENT ]
        </button>
        <button class="btn" style="margin-top:8px;margin-left:8px"
          onclick="Game.showScreen('town', {townId:'${townId}'})">[ BACK ]</button>
      </div>
    `;
  }

  function showShopBuy(category, townId) {
    const main = document.getElementById('main-content');
    const s = Game.getState();

    const catMap = { weapon: 'weapons', armor: 'armors', shield: 'shields', potion: 'potions' };
    const items = DATA[catMap[category]] || [];

    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">BUY ${category.toUpperCase()}S</div>
        <p class="text-white" style="margin-bottom:8px">
          Party Gold: <span class="text-yellow">${s.partyGold}</span>
        </p>
        <table class="shop-table">
          <thead><tr>
            <th>Name</th><th>Dmg/AC</th><th>STR Req</th><th class="price">Price</th><th>Buy</th>
          </tr></thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name} ${item.aug > 0 ? `<span class="text-cyan">+${item.aug}</span>` : ''}</td>
                <td>${item.damage || (item.ac !== undefined ? `AC+${item.ac}` : '')}</td>
                <td class="req">${item.strReq > 0 ? `STR ${item.strReq}` : '-'}</td>
                <td class="price">${item.price}</td>
                <td>
                  ${item.price > 0 ? `
                  <button class="btn" style="font-size:11px;padding:2px 8px"
                    onclick="TownScreen.buyItem('${catMap[category]}', '${item.id}', '${townId}')">Buy</button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <button class="btn" style="margin-top:8px"
          onclick="Game.showScreen('armory', {townId:'${townId}'})">[ BACK ]</button>
      </div>
    `;
  }

  function buyItem(category, itemId, townId) {
    const s = Game.getState();
    const catMap = { weapons: 'weapons', armors: 'armors', shields: 'shields', potions: 'potions' };
    const item = DATA[catMap[category]].find(i => i.id === itemId);
    if (!item) return;

    if (s.partyGold < item.price) {
      Game.addMessage(`Not enough gold! Need ${item.price}.`, 'msg-gold');
      return;
    }

    // Pick which character to equip
    const aliveParty = s.party.filter(c => c.alive);
    if (aliveParty.length === 0) return;

    let charIdx = 0;
    if (aliveParty.length > 1) {
      const names = aliveParty.map((c, i) => `${i}: ${c.name}`).join('\n');
      const inp = prompt(`Equip to which character?\n${names}`);
      charIdx = parseInt(inp);
      if (isNaN(charIdx) || charIdx < 0 || charIdx >= aliveParty.length) return;
    }

    const ch = aliveParty[charIdx];

    // STR requirement check
    if (item.strReq && ch.stats.str < item.strReq) {
      Game.addMessage(`${ch.name} lacks the strength (${ch.stats.str}/${item.strReq}) to use ${item.name}!`, 'msg-info');
      return;
    }

    // Equip
    s.partyGold -= item.price;
    const slotMap = { weapons: 'weapon', armors: 'armor', shields: 'shield' };
    if (slotMap[category]) {
      ch.equipment[slotMap[category]] = itemId;
    } else if (category === 'potions') {
      if (!ch.potions) ch.potions = [];
      ch.potions.push(itemId);
    }

    Game.addMessage(`${ch.name} buys ${item.name} for ${item.price} gold.`, 'msg-gold');
    showShopBuy(category.replace('s','').replace('armor','armor').replace('armors','armor'), townId);
  }

  function showShopSell(townId) {
    const main = document.getElementById('main-content');
    const s = Game.getState();

    let rows = '';
    s.party.forEach((ch, ci) => {
      if (!ch.alive) return;
      Object.entries(ch.equipment).forEach(([slot, itemId]) => {
        if (!itemId || itemId === 'none') return;
        const item = findItemById(itemId);
        if (!item || item.price === 0) return;
        const sellPrice = Math.floor(item.price * 0.5);
        rows += `<tr>
          <td class="text-yellow">${ch.name}</td>
          <td>${slot}</td>
          <td>${item.name}</td>
          <td class="price">${sellPrice}</td>
          <td><button class="btn" style="font-size:11px;padding:2px 8px"
            onclick="TownScreen.sellItem(${ci}, '${slot}', '${townId}')">Sell</button></td>
        </tr>`;
      });
    });

    main.innerHTML = `
      <div style="padding:12px">
        <div class="panel-title">SELL EQUIPMENT</div>
        <p class="text-grey" style="margin-bottom:8px;font-size:12px">
          Selling price is 50% of purchase price.
        </p>
        ${rows ? `
        <table class="shop-table">
          <thead><tr>
            <th>Owner</th><th>Slot</th><th>Item</th><th class="price">Sell Price</th><th></th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>` : '<p class="text-grey">Nothing to sell.</p>'}
        <button class="btn" style="margin-top:8px"
          onclick="Game.showScreen('armory', {townId:'${townId}'})">[ BACK ]</button>
      </div>
    `;
  }

  function sellItem(charIdx, slot, townId) {
    const s = Game.getState();
    const ch = s.party[charIdx];
    const itemId = ch.equipment[slot];
    if (!itemId) return;

    const item = findItemById(itemId);
    if (!item) return;

    const sellPrice = Math.floor(item.price * 0.5);
    ch.equipment[slot] = 'none';
    s.partyGold += sellPrice;

    Game.addMessage(`Sold ${item.name} for ${sellPrice} gold.`, 'msg-gold');
    showShopSell(townId);
  }

  function findItemById(id) {
    for (const cat of ['weapons','armors','shields','potions']) {
      const found = DATA[cat] && DATA[cat].find(i => i.id === id);
      if (found) return found;
    }
    return null;
  }

  /* ----------------------------------------------------------
     MYSTIC
     ---------------------------------------------------------- */
  function renderMystic(main, data) {
    const { townId } = data;
    const s = Game.getState();

    // Select message based on quest progress
    let msgIdx = 0;
    if (s.questFlags.darkShardFound && s.questFlags.lightCrystalFound && s.questFlags.giantEyeFound && s.questFlags.dwarvenRuneFound) {
      msgIdx = 5;
    } else if (s.questFlags.lightCrystalFound || s.questFlags.darkShardFound) {
      msgIdx = 4;
    } else if (s.questFlags.dwarvenRuneFound) {
      msgIdx = 3;
    } else if (s.questFlags.giantEyeFound) {
      msgIdx = 2;
    } else if (s.party.length > 0 && s.party[0].level >= 3) {
      msgIdx = 1;
    }

    const msg = DATA.mysticMessages[msgIdx] || DATA.mysticMessages[0];

    main.innerHTML = `
      <div style="padding:16px;max-width:500px">
        <div class="panel-title">THE MYSTIC — ${DATA.towns.find(t=>t.id===townId).name}</div>
        <div class="panel" style="margin:0 0 16px 0;border-color:var(--cyan)">
          <p style="color:var(--cyan);font-size:12px;margin-bottom:8px;letter-spacing:2px">
            *** THE MYSTIC SPEAKS ***
          </p>
          <p class="text-white" style="line-height:1.8">"${msg}"</p>
        </div>
        ${s.questFlags.giantEyeFound ? `<p class="text-yellow">- Giant's Eye ✓</p>` : ''}
        ${s.questFlags.dwarvenRuneFound ? `<p class="text-yellow">- Dwarven Rune ✓</p>` : ''}
        ${s.questFlags.lightCrystalFound ? `<p class="text-yellow">- Light Crystal ✓</p>` : ''}
        ${s.questFlags.darkShardFound ? `<p class="text-yellow">- Dark Shard ✓</p>` : ''}
        <button class="btn" style="margin-top:12px"
          onclick="Game.showScreen('town', {townId:'${townId}'})">[ BACK ]</button>
      </div>
    `;
  }

  /* ----------------------------------------------------------
     PUBLIC API
     ---------------------------------------------------------- */
  return {
    render,
    renderGuild,
    renderBank,
    renderInn,
    renderArmory,
    renderMystic,
    doLevelUp,
    bankDeposit,
    bankWithdraw,
    depositPartyGold,
    showShopBuy,
    buyItem,
    showShopSell,
    sellItem
  };

})();
