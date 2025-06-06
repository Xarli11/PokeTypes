// script.js

// Definition of all Pokémon types in the desired order for the table
const POKEMON_TYPES = [
    'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting',
    'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Light', 
    'Ghost', 'Dragon', 'Steel', 'Fairy', 'Dark'
];

// Type interaction data
const TYPE_EFFECTIVENESS = {
    Normal: {
        Rock: 0.5, Ghost: 0
    },
    Fire: {
        Grass: 2, Ice: 2, Bug: 2, Steel: 2,
        Fire: 0.5, Water: 0.5, Rock: 0.5, Dragon: 0.5
    },
    Water: {
        Fire: 2, Ground: 2, Rock: 2,
        Water: 0.5, Grass: 0.5, Dragon: 0.5
    },
    Grass: {
        Water: 2, Ground: 2, Rock: 2,
        Fire: 0.5, Grass: 0.5, Poison: 0.5, Flying: 0.5, Bug: 0.5, Dragon: 0.5, Steel: 0.5
    },
    Electric: {
        Water: 2, Flying: 2,
        Grass: 0.5, Electric: 0.5, Dragon: 0.5, Ground: 0
    },
    Ice: {
        Grass: 2, Ground: 2, Flying: 2, Dragon: 2,
        Fire: 0.5, Water: 0.5, Ice: 0.5, Steel: 0.5
    },
    Fighting: {
        Normal: 2, Ice: 2, Rock: 2, Dark: 2, Steel: 2,
        Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Fairy: 0.5, Ghost: 0
    },
    Poison: {
        Grass: 2, Fairy: 2,
        Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0
    },
    Ground: {
        Fire: 2, Electric: 2, Poison: 2, Rock: 2, Steel: 2,
        Grass: 0.5, Bug: 0.5, Flying: 0
    },
    Flying: {
        Grass: 2, Fighting: 2, Bug: 2,
        Electric: 0.5, Rock: 0.5, Steel: 0.5
    },
    Psychic: {
        Fighting: 2, Poison: 2,
        Psychic: 0.5, Steel: 0.5, Dark: 0
    },
    Bug: {
        Grass: 2, Psychic: 2, Dark: 2,
        Fighting: 0.5, Flying: 0.5, Poison: 0.5, Ghost: 0.5, Steel: 0.5, Fire: 0.5, Fairy: 0.5
    },
    Rock: {
        Fire: 2, Ice: 2, Flying: 2, Bug: 2,
        Fighting: 0.5, Ground: 0.5, Steel: 0.5
    },
    Light: { 
        Dark: 2, Ghost: 2, 
        Fighting: 0.5, Rock: 0.5, 
        Poison: 0, Steel: 0.5,
    },
    Ghost: {
        Psychic: 2, Ghost: 2,
        Normal: 0, Fighting: 0, Dark: 0.5, Bug: 0.5
    },
    Dragon: {
        Dragon: 2,
        Steel: 0.5, Fairy: 0
    },
    Steel: {
        Ice: 2, Rock: 2, Fairy: 2,
        Fire: 0.5, Water: 0.5, Electric: 0.5, Steel: 0.5, Grass: 0.5, Ice: 0.5, Fighting: 0.5, Ground: 0.5
    },
    Fairy: {
        Fighting: 2, Dragon: 2, Dark: 2,
        Poison: 0.5, Steel: 0.5, Fire: 0.5
    },
    Dark: {
        Psychic: 2, Ghost: 2,
        Fighting: 0.5, Dark: 0.5, Fairy: 0.5
    }
};

const TYPE_COLOR_CONTRAST = {
    Normal: 'dark', 
    Fire: 'light',  
    Water: 'light',
    Grass: 'light',
    Electric: 'dark',
    Ice: 'dark',
    Fighting: 'light',
    Poison: 'light',
    Ground: 'dark',
    Flying: 'dark', 
    Psychic: 'light',
    Bug: 'light',
    Rock: 'light',
    Light: 'dark',
    Ghost: 'light',
    Dragon: 'light',
    Steel: 'dark',
    Fairy: 'dark',  
    Dark: 'light'
};


function getEffectiveness(attackingType, defendingType) {
    const attackerEffects = TYPE_EFFECTIVENESS[attackingType];
    if (attackerEffects && attackerEffects.hasOwnProperty(defendingType)) {
        return attackerEffects[defendingType];
    }
    return 1;
}

function createTypePill(type) {
    const textColorClass = TYPE_COLOR_CONTRAST[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
    return `<span
        class="type-pill bg-type-${type.toLowerCase()} ${textColorClass} font-semibold border-2 border-lightDivider shadow-md cursor-pointer
        hover:scale-105 hover:shadow-xl hover:border-pokemonPrimary active:scale-95 active:shadow
        transition-all duration-150"
        style="min-width:64px; padding: 0.5em 1.2em; margin:0 0.35em 0.35em 0; border-radius:999px; font-size:1rem; letter-spacing:0.02em; display:inline-flex; align-items:center; justify-content:center;">
        ${type}
    </span>`;
}

// Function to get the SVG icon for detail cards
function getEffectivenessIcon(type) {
    // Crucial: fill="currentColor" makes the SVG inherit the text color
    switch (type) {
        case 'super': // Weak To / Super Effective (Check Circle)
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>`;
        case 'resist': // Resists / Not Very Effective (X Circle)
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>`;
        case 'immune': // Immune To / No Effect (Minus Circle)
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                    </svg>`;
        default:
            return '';
    }
}


function generateTypeTable() {
    const tableContainer = document.getElementById('type-table-container');
    let tableHTML = '<table><thead><tr>';

    // Top-left corner cell
    tableHTML += '<th class="sticky left-0 top-0 z-30 bento-corner-cell"><div class="bento-corner-content">Attacker <br> Defender</div></th>';

    // Table header (defending types)
    POKEMON_TYPES.forEach(type => {
        const textColorClass = TYPE_COLOR_CONTRAST[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
        tableHTML += `<th class="sticky top-0 z-20 bg-type-${type.toLowerCase()} ${textColorClass}">
                        ${type}
                      </th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // Table rows (attacking types and their interactions)
    POKEMON_TYPES.forEach(attackingType => {
        const textColorClass = TYPE_COLOR_CONTRAST[attackingType] === 'dark' ? 'type-text-dark' : 'type-text-light';
        tableHTML += '<tr>';
        
        // First column (attacking type)
        tableHTML += `<td class="sticky left-0 z-10 font-semibold bg-type-${attackingType.toLowerCase()} ${textColorClass}">
                        ${attackingType}
                      </td>`;

        POKEMON_TYPES.forEach(defendingType => {
            const modifier = getEffectiveness(attackingType, defendingType);
            let cellClass = 'interaction-1x';
            let cellText = '1x';

            if (modifier === 2) {
                cellClass = 'interaction-2x';
                cellText = '2x';
            } else if (modifier === 0.5) {
                cellClass = 'interaction-05x';
                cellText = '0.5x';
            } else if (modifier === 0) {
                cellClass = 'interaction-0x';
                cellText = '0x';
            }
            
            tableHTML += `<td class="${cellClass}">${cellText}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}

function populateTypeSelects() {
    const typeSelect = document.getElementById('type-select');
    const type2Select = document.getElementById('type2-select');
    typeSelect.innerHTML = '<option value="">Select a type...</option>';
    type2Select.innerHTML = '<option value="">Select a second type...</option>';
    POKEMON_TYPES.forEach(type => {
        const option1 = document.createElement('option');
        option1.value = type;
        option1.textContent = type;
        typeSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = type;
        option2.textContent = type;
        type2Select.appendChild(option2);
    });
}

function displayTypeDetails(type1, type2) {
    const typeDetailsDiv = document.getElementById('type-details');
    const selectedTypeNameSpan = document.getElementById('selected-type-name');
    const weaknessesCard = document.getElementById('weaknesses');
    const resistancesCard = document.getElementById('resistances');
    const immunitiesCard = document.getElementById('immunities');
    const superEffectiveCard = document.getElementById('super-effective');
    const notVeryEffectiveCard = document.getElementById('not-very-effective');
    const noEffectCard = document.getElementById('no-effect');

    if (!type1 && !type2) {
        typeDetailsDiv.style.display = 'none';
        return;
    }

    typeDetailsDiv.style.display = 'block';
    let typeLabel = type1 || '';
    if (type2) typeLabel += ` / ${type2}`;
    selectedTypeNameSpan.textContent = typeLabel;

    // Defensive calculation
    const weaknesses = [];
    const resistances = [];
    const immunities = [];

    // Offensive calculation
    const superEffective = [];
    const notVeryEffective = [];
    const noEffect = [];

    // Defensive: how much damage does the Pokémon take from each type?
    POKEMON_TYPES.forEach(attackingType => {
        let modifier = getEffectiveness(attackingType, type1);
        if (type2) modifier *= getEffectiveness(attackingType, type2);

        if (modifier === 2 || modifier === 4) {
            weaknesses.push(attackingType);
        } else if (modifier === 0.5 || modifier === 0.25) {
            resistances.push(attackingType);
        } else if (modifier === 0) {
            immunities.push(attackingType);
        }
    });

    // Offensive: how much damage does the Pokémon deal to each type?
    POKEMON_TYPES.forEach(defendingType => {
        let modifier = getEffectiveness(type1, defendingType);
        if (type2) modifier = Math.max(modifier, getEffectiveness(type2, defendingType));

        if (modifier === 2) {
            superEffective.push(defendingType);
        } else if (modifier === 0.5) {
            notVeryEffective.push(defendingType);
        } else if (modifier === 0) {
            noEffect.push(defendingType);
        }
    });

    function renderEffectivenessCard(cardElement, labelText, typeList, noContentText, iconType, textColorClass) {
        let contentHTML = `
            <div class="label-group ${textColorClass}"> ${getEffectivenessIcon(iconType)} <span class="label-text">${labelText}</span> 
            </div>
            <div class="type-pills-container">
        `;
        if (typeList.length) {
            contentHTML += typeList.map(createTypePill).join(''); 
        } else {
            contentHTML += `<span class="text-lightTextSecondary text-sm">${noContentText}</span>`;
        }
        contentHTML += `</div>`; 
        cardElement.innerHTML = contentHTML;
    }

    renderEffectivenessCard(weaknessesCard, 'Weak to (2x)', weaknesses, 'None', 'super', 'text-super-color'); 
    renderEffectivenessCard(resistancesCard, 'Resists (0.5x or less)', resistances, 'None', 'resist', 'text-resist-color'); 
    renderEffectivenessCard(immunitiesCard, 'Immune to (0x)', immunities, 'None', 'immune', 'text-immune-color'); 

    renderEffectivenessCard(superEffectiveCard, 'Very Effective (2x)', superEffective, 'None', 'super', 'text-super-color'); 
    renderEffectivenessCard(notVeryEffectiveCard, 'Not Very Effective (0.5x)', notVeryEffective, 'None', 'resist', 'text-resist-color'); 
    renderEffectivenessCard(noEffectCard, 'No Effect (0x)', noEffect, 'None', 'immune', 'text-immune-color'); 
}

document.addEventListener('DOMContentLoaded', () => {
    generateTypeTable();
    populateTypeSelects();

    const typeSelect = document.getElementById('type-select');
    const type2Select = document.getElementById('type2-select');
    const resetButton = document.getElementById('reset-button');

    function updateDetails() {
        displayTypeDetails(typeSelect.value, type2Select.value);
    }

    typeSelect.addEventListener('change', updateDetails);
    type2Select.addEventListener('change', updateDetails);

    resetButton.addEventListener('click', () => {
        typeSelect.value = '';
        type2Select.value = '';
        displayTypeDetails('', '');
    });
});