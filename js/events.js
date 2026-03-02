/* ============================================================
   VALDORIA: THE DARK ASCENSION — EXPLORATION EVENTS
   Gloomhaven-style narrative events triggered while exploring
   ============================================================ */

const Events = (function() {
  'use strict';

  /* ==========================================================
     EVENT POOL (30 events)
     ========================================================== */
  const EVENTS = [
    {
      id: 'ancient_altar',
      title: 'Ancient Altar',
      icon: '⚱',
      text: 'Crumbling stones form an altar. A faint glow pulses from its surface. Ancient runes speak of an offering to the old gods.',
      terrain: ['forest', 'plains', 'mountain', 'grass'],
      choices: [
        { label: 'Leave an offering (−50 gold)',
          effect: s => { if (s.partyGold >= 50) { s.partyGold -= 50; return 'The altar glows warmly. You feel blessed. (+2 to all attacks for next battle)'; } return 'Not enough gold.'; } },
        { label: 'Pray for guidance',
          effect: s => { const d = DATA.dungeons[Math.floor(Math.random() * DATA.dungeons.length)]; return `A vision fills your mind — you sense a dungeon to the ${d.name} at (${d.x}, ${d.y}).`; } },
        { label: 'Take the gems (+80 gold)',
          effect: s => { s.partyGold += 80; return 'You pocket the gems. The altar cracks ominously. A curse settles over the party.'; } }
      ]
    },
    {
      id: 'wounded_soldier',
      title: 'Wounded Soldier',
      icon: '⚔',
      text: 'A badly wounded soldier collapses at your feet, bearing the sigil of the Valdorian Guard. "Malachar\'s forces... ambushed us... please..." he gasps.',
      terrain: ['grass', 'plains', 'road'],
      choices: [
        { label: 'Tend his wounds (use a healing potion)',
          effect: s => { const hasPot = s.party.some(c => c.inventory && c.inventory.potions && c.inventory.potions.some(p => p.startsWith('pot_hp'))); if (hasPot) { s.party.forEach(c => { if (c.hp) c.hp.current = Math.min(c.hp.max, c.hp.current + 10); }); return 'Grateful, the soldier gives you a map fragment. "+20 gold, party healed 10 HP"'; } return 'You have no healing potions.'; } },
        { label: 'Give him food (+30 gold reward)',
          effect: s => { s.partyGold += 30; return 'The soldier thanks you and presses some coins into your hand. "Find Ironhold. Tell them what happened."'; } },
        { label: 'Leave him — time is short',
          effect: s => { return 'You press on. His dying eyes follow you. The party\'s morale suffers.'; } }
      ]
    },
    {
      id: 'mysterious_merchant',
      title: 'Mysterious Merchant',
      icon: '🎭',
      text: 'A cloaked figure with a wagon full of unusual wares blocks the path. "Rare goods, travelers! Things you won\'t find in any market!" he calls.',
      terrain: ['road', 'grass', 'plains'],
      choices: [
        { label: 'Browse wares (−100 gold for random item)',
          effect: s => { if (s.partyGold >= 100) { s.partyGold -= 100; const items = ['mgdagger', 'mgsword', 'pot_hp2', 'pot_str']; const item = items[Math.floor(Math.random() * items.length)]; const ch = s.party.find(c => c.alive); if (ch && ch.inventory) { ch.inventory.potions = ch.inventory.potions || []; ch.inventory.potions.push(item); } return `The merchant winks and hands you a ${item}. A bargain!`; } return 'Not enough gold.'; } },
        { label: 'Ask about Malachar',
          effect: s => { return '"Lord Malachar grows stronger each day," the merchant whispers. "Find the Four Seals before his Shadow Seal consumes all of Valdoria." He vanishes.'; } },
        { label: 'Ignore the merchant',
          effect: s => { return 'You press on. The merchant\'s wagon disappears into thin air.'; } }
      ]
    },
    {
      id: 'enchanted_spring',
      title: 'Enchanted Spring',
      icon: '💧',
      text: 'Crystal clear water bubbles up from the earth, glowing with a pale blue light. The air here smells of mountain wildflowers.',
      terrain: ['forest', 'mountain', 'plains'],
      choices: [
        { label: 'Drink from the spring',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.min(c.hp.max, c.hp.current + 20); }); return 'The pure water refreshes the party. Everyone heals 20 HP.'; } },
        { label: 'Fill your potions (+2 healing potions)',
          effect: s => { const ch = s.party.find(c => c.alive); if (ch) { ch.inventory = ch.inventory || {}; ch.inventory.potions = ch.inventory.potions || []; ch.inventory.potions.push('pot_hp1', 'pot_hp1'); } return 'You fill two vials with the magical water.'; } },
        { label: 'Leave it undisturbed',
          effect: s => { return 'Some things are best left untouched. You feel a warmth in your heart for the gesture.'; } }
      ]
    },
    {
      id: 'abandoned_camp',
      title: 'Abandoned Camp',
      icon: '🏕',
      text: 'The remains of a camp — cold ashes, scattered bedrolls, overturned cookpot. Whatever happened here was sudden. Tracks lead in multiple directions.',
      terrain: ['forest', 'plains', 'grass'],
      choices: [
        { label: 'Search the camp thoroughly (+40 gold)',
          effect: s => { s.partyGold += 40; return 'You find some scattered coins and a useful map. +40 gold.'; } },
        { label: 'Follow the tracks (encounter!)',
          effect: s => { return 'COMBAT'; } },
        { label: 'Rest here (restore 15 HP)',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.min(c.hp.max, c.hp.current + 15); }); return 'The shelter is crude but usable. The party rests and recovers.'; } }
      ]
    },
    {
      id: 'crossroads_demon',
      title: 'Crossroads Demon',
      icon: '😈',
      text: 'A thin figure in black stands at the crossroads, grinning with too many teeth. "A deal, travelers? I offer power — all I ask is a small... tithe."',
      terrain: ['road', 'plains'],
      choices: [
        { label: 'Refuse the demon',
          effect: s => { return 'You rebuke the demon. It hisses and vanishes in a puff of sulfur. Nothing gained, nothing lost.'; } },
        { label: 'Make the deal (−100 gold, +1 level XP)',
          effect: s => {
            if (s.partyGold >= 100) {
              s.partyGold -= 100;
              s.party.forEach(c => { if (c.alive) c.xp = (c.xp || 0) + 500; });
              return 'The demon takes your gold and grants the party battle wisdom. +500 XP each.';
            }
            return 'The demon sneers at your empty purse.';
          } },
        { label: 'Attack the demon!',
          effect: s => { return 'COMBAT'; } }
      ]
    },
    {
      id: 'ruins_library',
      title: 'Ancient Library',
      icon: '📚',
      text: 'Buried in a ruin, you find a chamber of ancient scrolls. Most are too damaged to read, but some are intact. The knowledge of ages waits...',
      terrain: ['ruins', 'forest', 'mountain'],
      choices: [
        { label: 'Study the spell scrolls (+1 spell level)',
          effect: s => { const ch = s.party.find(c => c.alive && c.spells && c.spells.length > 0); if (ch) { ch.xp = (ch.xp || 0) + 300; return `${ch.name} gains arcane insight. +300 XP.`; } return 'No spellcasters in the party.'; } },
        { label: 'Take the scrolls to sell (+60 gold)',
          effect: s => { s.partyGold += 60; return 'You carefully bundle the scrolls. Scholars in town will pay well.'; } },
        { label: 'Read about Malachar',
          effect: s => { return 'The scrolls speak of "The Shadow Seal — the source of Malachar\'s power. Break the Four Seals and the Shadow Seal shall crumble." Your quest is confirmed.'; } }
      ]
    },
    {
      id: 'healing_shrine',
      title: 'Shrine of Valdoria',
      icon: '✨',
      text: 'A shrine to the old gods of Valdoria still stands, untouched by the spreading shadow. A priest tends the flame, offering blessings to weary travelers.',
      terrain: ['plains', 'grass', 'road'],
      choices: [
        { label: 'Accept the blessing (full HP restore)',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = c.hp.max; }); return 'The priest blesses the party. All HP fully restored!'; } },
        { label: 'Make a donation (−50 gold, +MP restore)',
          effect: s => { if (s.partyGold >= 50) { s.partyGold -= 50; s.party.forEach(c => { if (c.alive && c.mp) c.mp.current = c.mp.max; }); return 'Your generous donation fills the shrine with light. All MP restored.'; } return 'Not enough gold.'; } },
        { label: 'Ask the priest about the Seals',
          effect: s => { return '"The Seal of Flame burns in the Blackwood Caverns," the priest whispers. "Seek it on the deepest floor."'; } }
      ]
    },
    {
      id: 'wandering_bard',
      title: 'Wandering Bard',
      icon: '🎵',
      text: 'A cheerful bard strums a lute and sings of heroes past. "Ah, adventurers! Let me sing your praises — or perhaps share a tale that might aid your quest?"',
      terrain: ['road', 'grass', 'plains'],
      choices: [
        { label: 'Listen to tales of Malachar',
          effect: s => { return '"Malachar was once a great wizard of Valdoria," the bard sings. "He sought immortality in the Shadow Realm, and something followed him back..."'; } },
        { label: 'Request a morale-boosting ballad',
          effect: s => { s.party.forEach(c => { if (c.alive) c.xp = (c.xp || 0) + 100; }); return 'The bard\'s inspiring song fills the party with courage. +100 XP each.'; } },
        { label: 'Give the bard coin (−20 gold)',
          effect: s => { if (s.partyGold >= 20) { s.partyGold -= 20; s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.min(c.hp.max, c.hp.current + 10); }); return 'The bard\'s music heals the spirit. Party heals 10 HP.'; } return 'Not enough gold.'; } }
      ]
    },
    {
      id: 'trapped_adventurer',
      title: 'Trapped Adventurer',
      icon: '⛓',
      text: 'You find a fellow adventurer pinned under a fallen stone. "Please — I\'ve been here for hours! I\'ll reward you handsomely if you help me!"',
      terrain: ['mountain', 'ruins', 'dungeon'],
      choices: [
        { label: 'Help free him (+80 gold reward)',
          effect: s => { s.partyGold += 80; s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.max(1, c.hp.current - 5); }); return 'With great effort you free him. The party strains from the work (-5 HP), but earns 80 gold.'; } },
        { label: 'Ask for information first',
          effect: s => { s.partyGold += 40; return '"There\'s a cache of gold just east of here," he gasps. You find it (+40 gold) and free him.'; } },
        { label: 'Leave him — it might be a trap',
          effect: s => { return 'You walk away. Whether it was a trap or not, you\'ll never know.'; } }
      ]
    },
    {
      id: 'shadow_mist',
      title: 'Shadow Mist',
      icon: '🌫',
      text: 'A creeping purple mist rolls in from the south, carrying whispers of despair. Shapes move within it. The shadow of Malachar grows closer.',
      terrain: ['plains', 'grass', 'road'],
      choices: [
        { label: 'Push through quickly',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.max(1, c.hp.current - 8); }); return 'The mist saps your strength. Everyone loses 8 HP, but you emerge safely.'; } },
        { label: 'Wait for it to pass (rest 1 turn)',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.min(c.hp.max, c.hp.current + 5); }); return 'The mist dissipates slowly. The rest helps a little (+5 HP).'; } },
        { label: 'Use a torch to drive it back',
          effect: s => { return 'The light of your torch holds the shadow at bay. The mist retreats, leaving behind a strange coin worth 30 gold.'; } }
      ]
    },
    {
      id: 'bandit_ambush',
      title: 'Bandit Ambush',
      icon: '🗡',
      text: '"Stand and deliver!" Three rough-looking bandits step out from behind rocks, weapons drawn. Their leader sneers: "Hand over the gold and no one gets hurt."',
      terrain: ['road', 'plains', 'grass'],
      choices: [
        { label: 'Fight! (forced combat)',
          effect: s => { return 'COMBAT_bandits'; } },
        { label: 'Negotiate (−60 gold)',
          effect: s => { if (s.partyGold >= 60) { s.partyGold -= 60; return 'You hand over the coin. The bandits let you pass, grumbling.'; } return 'You have nothing to give. They attack!'; } },
        { label: 'Bluff and intimidate',
          effect: s => { const maxLevel = Math.max(...s.party.filter(c=>c.alive).map(c=>c.level)); if (maxLevel >= 5) { return 'Your battle-hardened look and confident bearing gives the bandits pause. They back off.'; } return 'The bandits laugh. "Nice try." They attack!'; } }
      ]
    },
    {
      id: 'hermit_hut',
      title: "Hermit's Hut",
      icon: '🏚',
      text: 'A peculiar old hermit lives alone in a tiny hut. He knows much and charges little — though his advice is sometimes... cryptic.',
      terrain: ['forest', 'mountain'],
      choices: [
        { label: 'Ask about the Shadow Seal',
          effect: s => { return '"Malachar\'s power is anchored to four points of the realm," the hermit says. "Break each Seal and his citadel opens. Fail, and darkness wins."'; } },
        { label: 'Trade for supplies (+1 healing potion)',
          effect: s => { if (s.partyGold >= 30) { s.partyGold -= 30; const ch = s.party.find(c => c.alive); if (ch) { ch.inventory = ch.inventory || {}; ch.inventory.potions = ch.inventory.potions || []; ch.inventory.potions.push('pot_hp2'); } return 'The hermit trades a strong healing potion for 30 gold.'; } return 'Not enough gold.'; } },
        { label: 'Ask for directions',
          effect: s => { return '"The road south leads to shadow. The mountains east hold stone and secrets. Choose your path carefully, hero."'; } }
      ]
    },
    {
      id: 'fairy_ring',
      title: 'Fairy Ring',
      icon: '🍄',
      text: 'A perfect circle of glowing mushrooms pulses with faint magical energy. The air shimmers inside the ring. Something strange is happening here.',
      terrain: ['forest', 'plains'],
      choices: [
        { label: 'Step inside the ring',
          effect: s => { const outcomes = ['teleport', 'heal', 'xp', 'gold']; const o = outcomes[Math.floor(Math.random() * outcomes.length)]; if (o === 'heal') { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = c.hp.max; }); return 'Fairy magic fills the party — fully healed!'; } if (o === 'xp') { s.party.forEach(c => { if (c.alive) c.xp = (c.xp || 0) + 400; }); return 'You emerge wiser for the experience. +400 XP each.'; } if (o === 'gold') { s.partyGold += 100; return 'The fairies leave a pile of gleaming gold. +100 gold!'; } return 'The world spins. You feel slightly... displaced. But unharmed.'; } },
        { label: 'Observe from a distance',
          effect: s => { return 'You watch as two rabbits hop into the ring and emerge as large as horses before vanishing. Peculiar.'; } },
        { label: 'Scatter the mushrooms',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.max(1, c.hp.current - 5); }); return 'A wave of angry fey energy blasts the party. -5 HP. Was that wise?'; } }
      ]
    },
    {
      id: 'ghostly_apparition',
      title: 'Ghostly Apparition',
      icon: '👻',
      text: 'A translucent figure in ancient armor floats before you. Its mouth moves silently. It points repeatedly toward the east.',
      terrain: ['plains', 'ruins', 'grass'],
      choices: [
        { label: 'Try to communicate',
          effect: s => { return '"Find... the... Seal..." it mouths. Then it points east and fades. Something important lies to the east.'; } },
        { label: 'Follow where it points (explore)',
          effect: s => { s.partyGold += 50; return 'Following the ghost\'s direction leads you to a hidden cache of equipment. +50 gold equivalent.'; } },
        { label: 'Rebuke the spirit',
          effect: s => { return 'The ghost recoils and vanishes with a mournful wail. You may have destroyed something that needed your help.'; } }
      ]
    },
    {
      id: 'buried_treasure',
      title: 'Buried Treasure',
      icon: '💎',
      text: 'Something metallic catches your eye in the dirt. Digging reveals the corner of an old chest!',
      terrain: ['plains', 'grass', 'road'],
      choices: [
        { label: 'Dig it up (spend time — take 5 damage)',
          effect: s => { s.partyGold += 150; s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.max(1, c.hp.current - 5); }); return 'Hard labor pays off! +150 gold, but the work wears you down (-5 HP).'; } },
        { label: 'Take only the visible items (+50 gold)',
          effect: s => { s.partyGold += 50; return 'You grab what\'s easily accessible and move on quickly. +50 gold.'; } },
        { label: 'Leave it — might be trapped',
          effect: s => { return 'Caution is a virtue. You leave the chest buried, just in case.'; } }
      ]
    },
    {
      id: 'refugee_family',
      title: 'Refugee Family',
      icon: '👨‍👩‍👧',
      text: 'A family huddled by the roadside — parents and two children, carrying everything they own. "Please," the father begs. "Any food, any coin..."',
      terrain: ['road', 'grass', 'plains'],
      choices: [
        { label: 'Give generously (−80 gold)',
          effect: s => { if (s.partyGold >= 80) { s.partyGold -= 80; s.party.forEach(c => { if (c.alive) c.xp = (c.xp || 0) + 200; }); return 'The family weeps with gratitude. Their blessing follows you. +200 XP each.'; } return 'Not enough gold to help properly.'; } },
        { label: 'Give what you can (−30 gold)',
          effect: s => { if (s.partyGold >= 30) { s.partyGold -= 30; return 'It\'s not much, but the children smile. Some good remains in a dark world.'; } return 'Your purse is too thin even for kindness.'; } },
        { label: 'Point them to Ironhold',
          effect: s => { return '"Ironhold?" the father\'s eyes light up. "We heard it still stands! Thank you!" They head north with renewed hope.'; } }
      ]
    },
    {
      id: 'storm_shelter',
      title: 'Storm Shelter',
      icon: '⛈',
      text: 'Dark clouds roll in fast. A farmer waves you toward his barn. "Storm\'s coming — best wait it out!" Inside, other travelers are already sheltering.',
      terrain: ['plains', 'grass', 'road'],
      choices: [
        { label: 'Wait out the storm (rest, heal 25 HP)',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.min(c.hp.max, c.hp.current + 25); }); return 'A warm rest in the barn works wonders. +25 HP restored to all.'; } },
        { label: 'Talk with the other travelers',
          effect: s => { return '"Shadow patrols now reach as far as the Silver River," a merchant warns. "The dungeons glow at night — something is in there."'; } },
        { label: 'Press on through the storm',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.max(1, c.hp.current - 10); }); return 'The storm batters the party. -10 HP, but you save precious time.'; } }
      ]
    },
    {
      id: 'dark_portal',
      title: 'Dark Portal',
      icon: '🌀',
      text: 'A swirling void of purple energy hangs in the air. Shadow creatures pour from it in a steady stream. Someone opened this — someone powerful.',
      terrain: ['plains', 'grass'],
      choices: [
        { label: 'Close the portal (risky)',
          effect: s => { const alive = s.party.filter(c => c.alive); const loss = Math.floor(alive.length * 0.5) + 1; alive.slice(0, loss).forEach(c => { c.hp.current = Math.max(1, c.hp.current - 20); }); return `Closing the portal costs dearly. ${loss} party members take 20 damage, but the portal seals.`; } },
        { label: 'Fight the shadow creatures',
          effect: s => { return 'COMBAT_shadow'; } },
        { label: 'Flee the area!',
          effect: s => { return 'You run. The portal continues to pour shadows into the world. Not every battle can be won today.'; } }
      ]
    },
    {
      id: 'prophetic_dream',
      title: 'Prophetic Dream',
      icon: '🌙',
      text: 'You make camp and during the night, everyone in the party dreams the same dream: a dark tower, four blazing seals, and a voice saying "Hurry..."',
      terrain: ['forest', 'plains', 'grass', 'mountain'],
      choices: [
        { label: 'Meditate on the vision',
          effect: s => { s.party.forEach(c => { if (c.alive) c.xp = (c.xp || 0) + 250; }); return 'The shared vision strengthens the party\'s resolve. +250 XP each.'; } },
        { label: 'Rest deeply (full MP restore)',
          effect: s => { s.party.forEach(c => { if (c.alive && c.mp) c.mp.current = c.mp.max; }); return 'The sleep is deep and renewing. All MP fully restored.'; } },
        { label: 'Press on through the night',
          effect: s => { return 'You break camp early, spurred by the vision\'s urgency. The dream fades but the purpose remains clear.'; } }
      ]
    },
    {
      id: 'old_battlefield',
      title: 'Old Battlefield',
      icon: '💀',
      text: 'The bones of hundreds litter this field — a battle fought long ago. Yet something stirs among the dead. The shadow\'s corruption reaches even here.',
      terrain: ['plains', 'grass'],
      choices: [
        { label: 'Search for equipment (+random weapon)',
          effect: s => { s.partyGold += 70; return 'Among the fallen, you find weapons and armor worth salvaging. +70 gold.'; } },
        { label: 'Give the fallen a proper burial',
          effect: s => { s.party.forEach(c => { if (c.alive) c.xp = (c.xp || 0) + 300; }); return 'A worthy act. The grateful spirits grant the party battle wisdom. +300 XP each.'; } },
        { label: 'The dead rise! Fight!',
          effect: s => { return 'COMBAT_undead'; } }
      ]
    },
    {
      id: 'frozen_statue',
      title: 'Frozen in Stone',
      icon: '🗿',
      text: 'A knight in full armor stands frozen in the middle of the path — turned to stone. A basilisk\'s work. The knight\'s hand clutches a sealed letter.',
      terrain: ['mountain', 'plains', 'ruins'],
      choices: [
        { label: 'Take the letter',
          effect: s => { return '"To whoever finds this: the Seal of Stone lies deep in the Crystalspire Mines, guarded by the Crystal Golem. — Sir Aldous of Ironhold"'; } },
        { label: 'Attempt to restore him (use magic)',
          effect: s => { const hasWiz = s.party.some(c => c.alive && (c.cls === 'wizard' || c.cls === 'priest')); if (hasWiz) { s.partyGold += 100; return 'Your magic cracks the stone. The knight gasps back to life and presses coin on you. +100 gold.'; } return 'None in your party has the magic to reverse this.'; } },
        { label: 'Mark the location and move on',
          effect: s => { return 'You note the location. Someday, someone with the right magic might restore him.'; } }
      ]
    },
    {
      id: 'merchant_caravan',
      title: 'Merchant Caravan',
      icon: '🐪',
      text: 'A well-guarded merchant caravan heading north. The lead merchant calls out: "Hail, travelers! Heading south? Dangerous roads ahead — we just fought off shadow wolves!"',
      terrain: ['road', 'plains'],
      choices: [
        { label: 'Trade with the merchants',
          effect: s => { s.partyGold += 50; return 'Good prices in the field. You negotiate well and come out ahead. +50 gold.'; } },
        { label: 'Get intelligence on the south',
          effect: s => { return '"Three dungeons pulse with dark energy south of the Silver River. Shadow knights patrol the roads near the old keep."'; } },
        { label: 'Ask to join them north',
          effect: s => { return '"Sorry friends — we\'re going home. But godspeed to you. Valdoria needs heroes now more than ever."'; } }
      ]
    },
    {
      id: 'sacred_grove',
      title: 'Sacred Grove',
      icon: '🌿',
      text: 'Ancient trees form a perfect circle around a mossy altar. The forest is silent here — not even birds. A lingering magic keeps it safe from the shadow.',
      terrain: ['forest'],
      choices: [
        { label: 'Rest in the grove (full heal)',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = c.hp.max; }); s.party.forEach(c => { if (c.alive && c.mp) c.mp.current = c.mp.max; }); return 'The grove\'s ancient magic restores the entire party. Full HP and MP!'; } },
        { label: 'Commune with the forest spirits',
          effect: s => { return '"The Seal of Flame burns in the Blackwood," a voice on the wind says. "Beware the guardian — fire cannot harm it."'; } },
        { label: 'Gather rare herbs (+1 potion)',
          effect: s => { const ch = s.party.find(c => c.alive); if (ch) { ch.inventory = ch.inventory || {}; ch.inventory.potions = ch.inventory.potions || []; ch.inventory.potions.push('pot_hp2'); } return 'Rare healing herbs grow here. You craft a strong healing potion.'; } }
      ]
    },
    {
      id: 'ancient_construct',
      title: 'Ancient Construct',
      icon: '🤖',
      text: 'A massive iron figure stands motionless. Old Valdorian craftsmanship — built to guard. Runic eyes glow faintly as you approach.',
      terrain: ['ruins', 'plains', 'mountain'],
      choices: [
        { label: 'Attempt to communicate',
          effect: s => { return '"QUERY: ALIGNMENT. HERO: ACCEPTED. DATA: SEAL OF LIGHT IS HELD IN TOWER OF ECHOES. FLOOR THREE. CAUTION: GOLEM GUARDS ACTIVE." Then silence.'; } },
        { label: 'Attack it for parts (+gold)',
          effect: s => { return 'COMBAT_golem'; } },
        { label: 'Leave it alone',
          effect: s => { return 'The construct watches you pass with unblinking mechanical eyes. Wise to leave it.'; } }
      ]
    },
    {
      id: 'flooded_passage',
      title: 'Flooded Passage',
      icon: '🌊',
      text: 'The path ahead is completely flooded. Waist-deep murky water stretches for what could be miles. There\'s no easy way around.',
      terrain: ['plains', 'road', 'swamp'],
      choices: [
        { label: 'Wade through (take damage from cold)',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.max(1, c.hp.current - 12); }); return 'The freezing water saps your strength. -12 HP each, but you make it through.'; } },
        { label: 'Find a way around (lose time, heal)',
          effect: s => { s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.min(c.hp.max, c.hp.current + 8); }); return 'The long way around takes hours, but the rest does you good. +8 HP.'; } },
        { label: 'Build a makeshift raft',
          effect: s => { return 'Using the party\'s ingenuity, you build a raft from fallen branches. Dry crossing achieved! Morale improved.'; } }
      ]
    },
    {
      id: 'shadow_cultist',
      title: 'Shadow Cultist',
      icon: '🔮',
      text: 'A robed figure kneels before a crude altar to Malachar, chanting. They haven\'t noticed you yet.',
      terrain: ['plains', 'ruins'],
      choices: [
        { label: 'Ambush them',
          effect: s => { s.partyGold += 60; return 'You strike before they can summon shadows. The cultist is dispatched. +60 gold from their robes.'; } },
        { label: 'Listen to the ritual',
          effect: s => { return '"...and with the fourth Seal broken, Lord Malachar shall be reborn in physical form..." Now you understand the urgency.'; } },
        { label: 'Demand answers',
          effect: s => { return 'COMBAT_cultist'; } }
      ]
    },
    {
      id: 'lucky_find',
      title: 'Lucky Find',
      icon: '🍀',
      text: 'You stumble upon something completely unexpected — a discarded pack belonging to a well-equipped adventurer who won\'t be needing it anymore.',
      terrain: ['forest', 'plains', 'grass', 'mountain', 'road'],
      choices: [
        { label: 'Take everything (+100 gold)',
          effect: s => { s.partyGold += 100; return 'The pack contains plenty of useful equipment. +100 gold equivalent.'; } },
        { label: 'Take only the potions',
          effect: s => { const ch = s.party.find(c => c.alive); if (ch) { ch.inventory = ch.inventory || {}; ch.inventory.potions = ch.inventory.potions || []; ch.inventory.potions.push('pot_hp2', 'pot_mp1'); } return 'A healing and mana potion — exactly what the party needs.'; } },
        { label: 'Leave it for others',
          effect: s => { return 'Virtue is its own reward. You leave the pack and walk on.'; } }
      ]
    },
    {
      id: 'suspicious_inn',
      title: 'Suspicious Roadside Inn',
      icon: '🏠',
      text: 'An inn in a strange location. The innkeeper is too friendly, the prices suspiciously low, and the other patrons watch you with odd interest.',
      terrain: ['road', 'plains'],
      choices: [
        { label: 'Stay the night (heal 30 HP, risky)',
          effect: s => { const suspicious = Math.random() < 0.4; if (suspicious) { s.partyGold -= Math.min(50, s.partyGold); return 'You wake to find your purse lighter. -50 gold, but at least you\'re well rested.'; } s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.min(c.hp.max, c.hp.current + 30); }); return 'A good night\'s rest with no incident. +30 HP.'; } },
        { label: 'Eat and leave quickly',
          effect: s => { s.partyGold -= Math.min(20, s.partyGold); s.party.forEach(c => { if (c.alive && c.hp) c.hp.current = Math.min(c.hp.max, c.hp.current + 10); }); return 'A quick meal for 20 gold. Modest but nourishing. +10 HP.'; } },
        { label: 'Investigate the inn',
          effect: s => { return 'Beneath the floorboards you find evidence of Shadow Cult activity. The innkeeper flees. No charges tonight.'; } }
      ]
    },
    {
      id: 'ancient_map',
      title: 'Ancient Map',
      icon: '🗺',
      text: 'Scratched into a stone tablet, you find what appears to be an old map of Valdoria, showing locations long since forgotten.',
      terrain: ['ruins', 'mountain', 'forest'],
      choices: [
        { label: 'Study the map carefully',
          effect: s => { return 'The map shows the locations of all six dungeons, including Malachar\'s Citadel. "Requires the four Seals to enter," a note reads.'; } },
        { label: 'Take a rubbing (+knowledge)',
          effect: s => { s.party.forEach(c => { if (c.alive) c.xp = (c.xp || 0) + 200; }); return 'You copy the map carefully. The knowledge proves valuable. +200 XP each.'; } },
        { label: 'Leave it for scholars',
          effect: s => { return 'Knowledge belongs to all. You leave the tablet for those who come after.'; } }
      ]
    }
  ];

  /* ==========================================================
     EVENT STATE
     ========================================================== */
  let seenEvents = new Set();
  let activeEvent = null;
  let pendingCombat = null;

  /* ==========================================================
     PUBLIC FUNCTIONS
     ========================================================== */

  // Called on every overworld step. Returns true if an event was triggered.
  function checkStep(terrain) {
    const s = Game.getState();
    if (!s) return false;

    // 8% base chance
    if (Math.random() > 0.08) return false;

    // Find eligible events for this terrain
    const available = EVENTS.filter(e => {
      if (seenEvents.has(e.id)) return false;
      return e.terrain.some(t => terrain.includes(t) || t === terrain);
    });

    if (available.length === 0) {
      // Reset seen events if we've seen them all
      seenEvents.clear();
      return false;
    }

    const event = available[Math.floor(Math.random() * available.length)];
    triggerEvent(event.id);
    return true;
  }

  function triggerEvent(eventId) {
    const event = EVENTS.find(e => e.id === eventId);
    if (!event) return;
    seenEvents.add(eventId);
    activeEvent = event;
    renderEventModal(event);
  }

  function renderEventModal(event) {
    // Remove existing modal if any
    const old = document.getElementById('event-modal-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'event-modal-overlay';
    overlay.className = 'event-overlay';

    const choicesHtml = event.choices.map((c, i) =>
      `<button class="event-choice" data-idx="${i}">${c.label}</button>`
    ).join('');

    overlay.innerHTML = `
      <div class="event-modal">
        <div class="event-icon">${event.icon}</div>
        <div class="event-title">${event.title}</div>
        <div class="event-text">"${event.text}"</div>
        <div class="event-result" id="event-result"></div>
        <div class="event-choices" id="event-choices">
          ${choicesHtml}
        </div>
        <button class="event-close hidden" id="event-close">[ CONTINUE ]</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Bind choice buttons
    overlay.querySelectorAll('.event-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        resolveChoice(event, idx);
      });
    });
  }

  function resolveChoice(event, choiceIdx) {
    const choice = event.choices[choiceIdx];
    if (!choice) return;

    const s = Game.getState();
    let result;
    try {
      result = choice.effect(s);
    } catch (e) {
      result = 'Something happened.';
    }

    const resultEl = document.getElementById('event-result');
    const choicesEl = document.getElementById('event-choices');
    const closeBtn = document.getElementById('event-close');

    // Handle combat results
    if (result && result.startsWith('COMBAT')) {
      closeEventModal();
      handleEventCombat(result);
      return;
    }

    if (resultEl) resultEl.textContent = result || 'The choice is made.';
    if (choicesEl) choicesEl.classList.add('hidden');
    if (closeBtn) closeBtn.classList.remove('hidden');

    // Refresh HUD since gold/HP may have changed
    Game.renderHUD();

    // Bind close button
    if (closeBtn) {
      closeBtn.onclick = () => {
        closeEventModal();
        Game.save();
      };
    }
  }

  function closeEventModal() {
    const overlay = document.getElementById('event-modal-overlay');
    if (overlay) overlay.remove();
    activeEvent = null;
  }

  function handleEventCombat(combatType) {
    const s = Game.getState();
    let enemyIds = ['bandit', 'bandit', 'bandit'];

    if (combatType === 'COMBAT_shadow') {
      enemyIds = ['shadow_wolf', 'shadow_wolf', 'specter'];
    } else if (combatType === 'COMBAT_undead') {
      enemyIds = ['skeleton', 'skeleton', 'zombie'];
    } else if (combatType === 'COMBAT_golem') {
      enemyIds = ['golem'];
    } else if (combatType === 'COMBAT_cultist') {
      enemyIds = ['cultist', 'cultist'];
    }

    const partyLevel = Math.max(...s.party.filter(c => c.alive).map(c => c.level));
    const enemies = enemyIds.map(id => {
      const template = DATA.enemies.find(e => e.id === id);
      if (!template) return null;
      return WorldScreen.spawnEnemy(template, partyLevel);
    }).filter(Boolean);

    if (enemies.length > 0) {
      Game.addMessage('Trouble erupts from the event!', 'msg-combat');
      Game.showScreen('combat', {
        enemies,
        returnScreen: 'overworld',
        onVictory: null
      });
    }
  }

  function reset() {
    seenEvents.clear();
    activeEvent = null;
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */
  return {
    checkStep,
    triggerEvent,
    closeEventModal,
    reset,
    EVENTS
  };

})();
