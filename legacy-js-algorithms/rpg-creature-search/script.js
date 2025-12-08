// RPG Creature Database
const creatures = [
  {
    name: "Ancient Red Dragon",
    type: "dragon",
    size: "gargantuan",
    hitPoints: 546,
    armorClass: 22,
    challengeRating: 24,
    experiencePoints: 62000,
    description: "A massive, ancient red dragon with gleaming crimson scales and eyes like glowing coals. These legendary creatures hoard wealth and terrorize entire kingdoms.",
    abilities: { str: 30, dex: 10, con: 29, int: 18, wis: 15, cha: 23 }
  },
  {
    name: "Goblin",
    type: "humanoid",
    size: "small",
    hitPoints: 7,
    armorClass: 15,
    challengeRating: 0.25,
    experiencePoints: 50,
    description: "Small, green-skinned humanoids known for their cunning and cowardice. They often live in tribes and raid neighboring settlements.",
    abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 }
  },
  {
    name: "Beholder",
    type: "aberration",
    size: "large",
    hitPoints: 180,
    armorClass: 18,
    challengeRating: 13,
    experiencePoints: 10000,
    description: "A floating orb with a large central eye and ten smaller eyestalks. Each eyestalk has a different magical ability.",
    abilities: { str: 10, dex: 14, con: 22, int: 17, wis: 15, cha: 17 }
  },
  {
    name: "Gelatinous Cube",
    type: "ooze",
    size: "large",
    hitPoints: 84,
    armorClass: 6,
    challengeRating: 2,
    experiencePoints: 450,
    description: "A large, transparent cube of acidic gelatin that slowly moves through dungeons, absorbing everything in its path.",
    abilities: { str: 14, dex: 3, con: 20, int: 1, wis: 6, cha: 1 }
  },
  {
    name: "Hill Giant",
    type: "giant",
    size: "huge",
    hitPoints: 105,
    armorClass: 13,
    challengeRating: 5,
    experiencePoints: 1800,
    description: "Massive humanoid giants that live in hills and mountains. They are simple-minded but incredibly strong.",
    abilities: { str: 21, dex: 8, con: 19, int: 5, wis: 9, cha: 6 }
  },
  {
    name: "Lich",
    type: "undead",
    size: "medium",
    hitPoints: 135,
    armorClass: 15,
    challengeRating: 21,
    experiencePoints: 33000,
    description: "A powerful undead spellcaster who has achieved immortality through dark rituals. They retain their intelligence and magical abilities.",
    abilities: { str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16 }
  },
  {
    name: "Owlbear",
    type: "monstrosity",
    size: "large",
    hitPoints: 59,
    armorClass: 13,
    challengeRating: 3,
    experiencePoints: 700,
    description: "A monstrous hybrid of owl and bear, created through magical experimentation. They are territorial and highly aggressive.",
    abilities: { str: 20, dex: 12, con: 17, int: 3, wis: 12, cha: 7 }
  },
  {
    name: "Pit Fiend",
    type: "fiend",
    size: "large",
    hitPoints: 300,
    armorClass: 19,
    challengeRating: 20,
    experiencePoints: 25000,
    description: "One of the most powerful devils in the Nine Hells. They command legions of lesser devils and wield devastating magical abilities.",
    abilities: { str: 26, dex: 14, con: 24, int: 22, wis: 18, cha: 24 }
  },
  {
    name: "Rakshasa",
    type: "fiend",
    size: "medium",
    hitPoints: 110,
    armorClass: 16,
    challengeRating: 13,
    experiencePoints: 10000,
    description: "Tiger-like fiends that can disguise themselves as humans. They are master deceivers and manipulators.",
    abilities: { str: 14, dex: 17, con: 18, int: 13, wis: 16, cha: 20 }
  },
  {
    name: "Tarrasque",
    type: "monstrosity",
    size: "gargantuan",
    hitPoints: 676,
    armorClass: 25,
    challengeRating: 30,
    experiencePoints: 155000,
    description: "The most destructive creature in existence. This legendary monster has destroyed entire cities and is nearly impossible to kill.",
    abilities: { str: 30, dex: 11, con: 30, int: 3, wis: 11, cha: 11 }
  },
  {
    name: "Vampire",
    type: "undead",
    size: "medium",
    hitPoints: 144,
    armorClass: 16,
    challengeRating: 13,
    experiencePoints: 10000,
    description: "Immortal undead creatures that feed on the blood of the living. They possess supernatural strength and can charm their victims.",
    abilities: { str: 18, dex: 18, con: 18, int: 17, wis: 15, cha: 18 }
  },
  {
    name: "Werewolf",
    type: "humanoid",
    size: "medium",
    hitPoints: 58,
    armorClass: 12,
    challengeRating: 3,
    experienceRating: 700,
    description: "Humans cursed to transform into wolf-like creatures during the full moon. They gain incredible strength but lose control.",
    abilities: { str: 15, dex: 13, con: 14, int: 10, wis: 11, cha: 10 }
  },
  {
    name: "Zombie",
    type: "undead",
    size: "medium",
    hitPoints: 22,
    armorClass: 8,
    challengeRating: 0.25,
    experiencePoints: 50,
    description: "Reanimated corpses that mindlessly attack the living. They are slow but relentless in their pursuit.",
    abilities: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 }
  },
  {
    name: "Adult Blue Dragon",
    type: "dragon",
    size: "huge",
    hitPoints: 225,
    armorClass: 19,
    challengeRating: 16,
    experiencePoints: 15000,
    description: "Majestic blue dragons that dwell in deserts and command the power of lightning. They are arrogant and territorial.",
    abilities: { str: 25, dex: 10, con: 23, int: 16, wis: 15, cha: 19 }
  },
  {
    name: "Displacer Beast",
    type: "monstrosity",
    size: "large",
    hitPoints: 85,
    armorClass: 13,
    challengeRating: 3,
    experiencePoints: 700,
    description: "Panther-like creatures with tentacle-like appendages near their shoulders. They can create illusory duplicates of themselves.",
    abilities: { str: 18, dex: 15, con: 16, int: 6, wis: 12, cha: 8 }
  },
  {
    name: "Mimic",
    type: "monstrosity",
    size: "medium",
    hitPoints: 58,
    armorClass: 12,
    challengeRating: 2,
    experiencePoints: 450,
    description: "Shape-shifting creatures that disguise themselves as inanimate objects to ambush prey. They are masters of deception.",
    abilities: { str: 17, dex: 12, con: 15, int: 5, wis: 13, cha: 8 }
  },
  {
    name: "Stone Golem",
    type: "construct",
    size: "large",
    hitPoints: 178,
    armorClass: 17,
    challengeRating: 10,
    experiencePoints: 5900,
    description: "Magical constructs made of stone, animated through powerful spells. They are immune to many forms of magic and incredibly durable.",
    abilities: { str: 22, dex: 9, con: 20, int: 3, wis: 11, cha: 1 }
  },
  {
    name: "Treant",
    type: "plant",
    size: "huge",
    hitPoints: 138,
    armorClass: 16,
    challengeRating: 9,
    experiencePoints: 5000,
    description: "Ancient tree-like guardians of forests. They can animate trees and plants to defend their woodland homes.",
    abilities: { str: 23, dex: 8, con: 21, int: 12, wis: 16, cha: 12 }
  },
  {
    name: "Young Green Dragon",
    type: "dragon",
    size: "large",
    hitPoints: 136,
    armorClass: 18,
    challengeRating: 8,
    experiencePoints: 3900,
    description: "Young dragons that breathe poisonous gas and dwell in swamps and jungles. They are cunning and patient hunters.",
    abilities: { str: 19, dex: 12, con: 17, int: 16, wis: 13, cha: 15 }
  },
  {
    name: "Air Elemental",
    type: "elemental",
    size: "large",
    hitPoints: 90,
    armorClass: 15,
    challengeRating: 5,
    experiencePoints: 1800,
    description: "Living embodiments of wind and air. They can create powerful gusts and fly at incredible speeds.",
    abilities: { str: 14, dex: 20, con: 14, int: 6, wis: 10, cha: 6 }
  }
];

// DOM elements
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const crFilter = document.getElementById('cr-filter');
const sizeFilter = document.getElementById('size-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
const resultsCount = document.getElementById('results-count');
const creatureGrid = document.getElementById('creature-grid');
const noResults = document.getElementById('no-results');
const creatureModal = document.getElementById('creature-modal');
const closeModalBtn = document.getElementById('close-modal');

// Current filtered creatures
let filteredCreatures = [...creatures];

// Initialize app
function init() {
  displayCreatures(creatures);
  setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
  searchInput.addEventListener('input', filterCreatures);
  typeFilter.addEventListener('change', filterCreatures);
  crFilter.addEventListener('change', filterCreatures);
  sizeFilter.addEventListener('change', filterCreatures);
  clearFiltersBtn.addEventListener('click', clearFilters);
  closeModalBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  creatureModal.addEventListener('click', (e) => {
    if (e.target === creatureModal) {
      closeModal();
    }
  });
}

// Filter creatures based on search and filters
function filterCreatures() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const typeValue = typeFilter.value;
  const crValue = crFilter.value;
  const sizeValue = sizeFilter.value;

  filteredCreatures = creatures.filter(creature => {
    // Search filter
    const matchesSearch = !searchTerm ||
      creature.name.toLowerCase().includes(searchTerm) ||
      creature.type.toLowerCase().includes(searchTerm) ||
      creature.description.toLowerCase().includes(searchTerm);

    // Type filter
    const matchesType = !typeValue || creature.type === typeValue;

    // CR filter
    let matchesCR = true;
    if (crValue) {
      const cr = creature.challengeRating;
      switch (crValue) {
        case '0-4':
          matchesCR = cr >= 0 && cr <= 4;
          break;
        case '5-10':
          matchesCR = cr >= 5 && cr <= 10;
          break;
        case '11-20':
          matchesCR = cr >= 11 && cr <= 20;
          break;
        case '21+':
          matchesCR = cr >= 21;
          break;
      }
    }

    // Size filter
    const matchesSize = !sizeValue || creature.size === sizeValue;

    return matchesSearch && matchesType && matchesCR && matchesSize;
  });

  displayCreatures(filteredCreatures);
}

// Display creatures in grid
function displayCreatures(creaturesToDisplay) {
  // Update results count
  resultsCount.textContent = `${creaturesToDisplay.length} creature${creaturesToDisplay.length !== 1 ? 's' : ''} found`;

  // Clear grid
  creatureGrid.innerHTML = '';

  if (creaturesToDisplay.length === 0) {
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');

  // Create creature cards
  creaturesToDisplay.forEach(creature => {
    const card = document.createElement('div');
    card.className = 'creature-card';
    card.onclick = () => openModal(creature);

    card.innerHTML = `
      <div class="creature-name">${creature.name}</div>
      <div class="creature-type">${creature.type}</div>
      <div class="creature-stats">
        <div class="stat">
          <span class="stat-label">HP:</span>
          <span class="stat-value">${creature.hitPoints}</span>
        </div>
        <div class="stat">
          <span class="stat-label">AC:</span>
          <span class="stat-value">${creature.armorClass}</span>
        </div>
        <div class="stat">
          <span class="stat-label">CR:</span>
          <span class="stat-value">${creature.challengeRating}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Size:</span>
          <span class="stat-value">${creature.size}</span>
        </div>
      </div>
    `;

    creatureGrid.appendChild(card);
  });
}

// Clear all filters
function clearFilters() {
  searchInput.value = '';
  typeFilter.value = '';
  crFilter.value = '';
  sizeFilter.value = '';
  filterCreatures();
}

// Open creature detail modal
function openModal(creature) {
  document.getElementById('modal-name').textContent = creature.name;
  document.getElementById('modal-type').textContent = creature.type;
  document.getElementById('modal-size').textContent = creature.size;
  document.getElementById('modal-hp').textContent = creature.hitPoints;
  document.getElementById('modal-ac').textContent = creature.armorClass;
  document.getElementById('modal-cr').textContent = creature.challengeRating;
  document.getElementById('modal-xp').textContent = creature.experiencePoints.toLocaleString();
  document.getElementById('modal-description').textContent = creature.description;

  // Set ability scores
  document.getElementById('modal-str').textContent = creature.abilities.str;
  document.getElementById('modal-dex').textContent = creature.abilities.dex;
  document.getElementById('modal-con').textContent = creature.abilities.con;
  document.getElementById('modal-int').textContent = creature.abilities.int;
  document.getElementById('modal-wis').textContent = creature.abilities.wis;
  document.getElementById('modal-cha').textContent = creature.abilities.cha;

  creatureModal.classList.remove('hidden');
}

// Close modal
function closeModal() {
  creatureModal.classList.add('hidden');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
