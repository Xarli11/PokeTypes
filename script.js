// script.js

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

function capitalizeWords(str) {
    return str
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function populatePokemonSelect() {
    const pokemonSelect = document.getElementById('pokemon-select');
    pokemonSelect.innerHTML = '<option value="">Select a Pokemon ...</option>';
    POKEMON_LIST.forEach(pokemon => {
        const option = document.createElement('option');
        option.value = pokemon.name;
        option.textContent = capitalizeWords(pokemon.name);
        pokemonSelect.appendChild(option);
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
    if (type1 && type2) {
        selectedTypeNameSpan.innerHTML =
            createTypePill(type1) +
            '<span class="mx-1 font-bold text-lg text-lightTextPrimary">+</span>' +
            createTypePill(type2);
    } else if (type1) {
        selectedTypeNameSpan.innerHTML = createTypePill(type1);
    } else if (type2) {
        selectedTypeNameSpan.innerHTML = createTypePill(type2);
    } else {
        selectedTypeNameSpan.innerHTML = '';
    }

    // Defensive calculation
    const weaknesses = [];
    const resistances = [];
    const immunities = [];

    // Offensive calculation
    const superEffective = [];
    const notVeryEffective = [];
    const noEffect = [];

    // Defensive: how much damage does the Pokémon take from each type?
    const weaknesses4x = [];
    const weaknesses2x = [];
    POKEMON_TYPES.forEach(attackingType => {
        let modifier = getEffectiveness(attackingType, type1);
        if (type2) modifier *= getEffectiveness(attackingType, type2);

        if (modifier === 4) {
            weaknesses4x.push(attackingType);
        } else if (modifier === 2) {
            weaknesses2x.push(attackingType);
        } else if (modifier === 0.5 || modifier === 0.25) {
            resistances.push(attackingType);
        } else if (modifier === 0) {
            immunities.push(attackingType);
        }
    });

    // Offensive: how much damage does the Pokémon deal to each type?
    const superEffective4x = [];
    const superEffective2x = [];
    POKEMON_TYPES.forEach(defendingType => {
        let modifier = getEffectiveness(type1, defendingType);
        if (type2) modifier = Math.max(modifier, getEffectiveness(type2, defendingType));

        if (modifier === 4) {
            superEffective4x.push(defendingType);
        } else if (modifier === 2) {
            superEffective2x.push(defendingType);
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

    // Nueva función para renderizar x4 y x2 en la misma tarjeta
    function renderSplitEffectivenessCard(cardElement, labelText, x4List, x2List, noContentText, iconType, textColorClass) {
        let contentHTML = `
            <div class="label-group ${textColorClass}"> ${getEffectivenessIcon(iconType)} <span class="label-text">${labelText}</span> 
            </div>
            <div class="type-pills-container" style="flex-direction:column;align-items:flex-start;">
        `;
        if (x4List.length) {
            contentHTML += `<div style="margin-bottom:0.5em"><span class="font-bold" style="color:#e53935;background:#fdecea;padding:0.15em 0.8em;border-radius:999px;margin-right:0.7em;">x4</span>`;
            contentHTML += x4List.map(createTypePill).join('');
            contentHTML += `</div>`;
        }
        if (x2List.length) {
            contentHTML += `<div><span class="font-bold" style="color:#fb8c00;background:#fff3e0;padding:0.15em 0.8em;border-radius:999px;margin-right:0.7em;">x2</span>`;
            contentHTML += x2List.map(createTypePill).join('');
            contentHTML += `</div>`;
        }
        if (!x4List.length && !x2List.length) {
            contentHTML += `<span class="text-lightTextSecondary text-sm">${noContentText}</span>`;
        }
        contentHTML += `</div>`;
        cardElement.innerHTML = contentHTML;
    }

    // Usar la nueva función para Weaknesses y Very Effective
    renderSplitEffectivenessCard(weaknessesCard, 'Weak to', weaknesses4x, weaknesses2x, 'None', 'super', 'text-super-color');
    renderSplitEffectivenessCard(superEffectiveCard, 'Very Effective', superEffective4x, superEffective2x, 'None', 'super', 'text-super-color');

    // El resto igual:
    renderEffectivenessCard(resistancesCard, 'Resists (0.5x or less)', resistances, 'None', 'resist', 'text-resist-color');
    renderEffectivenessCard(immunitiesCard, 'Immune to (0x)', immunities, 'None', 'immune', 'text-immune-color');
    renderEffectivenessCard(notVeryEffectiveCard, 'Not Very Effective (0.5x)', notVeryEffective, 'None', 'resist', 'text-resist-color');
    renderEffectivenessCard(noEffectCard, 'No Effect (0x)', noEffect, 'None', 'immune', 'text-immune-color');
}

// Escucha el evento de entrada en el campo de búsqueda
const searchInput = document.getElementById('pokemon-search');
const suggestionsList = document.getElementById('suggestions');
const typeSelect = document.getElementById('type-select');
const type2Select = document.getElementById('type2-select');

// Escucha el evento de entrada en el campo de búsqueda
searchInput.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();

    // Si no hay texto, oculta las sugerencias
    if (!query) {
        suggestionsList.innerHTML = '';
        suggestionsList.classList.add('hidden');
        return;
    }

    // Filtra los Pokémon que coincidan con el texto ingresado
    const matches = POKEMON_LIST.filter(pokemon => pokemon.name.toLowerCase().includes(query));

    // Si no hay coincidencias, muestra un mensaje
    if (matches.length === 0) {
        suggestionsList.innerHTML = '<li class="p-2 text-lightTextSecondary">No Pokémon found</li>';
        suggestionsList.classList.remove('hidden');
        return;
    }

    // Genera las sugerencias con las coincidencias resaltadas
    suggestionsList.innerHTML = matches
        .map(pokemon => {
            const highlightedName = pokemon.name.replace(
                new RegExp(query, 'gi'), // Busca todas las coincidencias (case-insensitive)
                match => `<span class="highlight">${match}</span>` // Envuelve las coincidencias en un span
            );
            return `<li class="p-2 cursor-pointer hover:bg-lightBg" data-name="${pokemon.name}">${highlightedName}</li>`;
        })
        .join('');
    suggestionsList.classList.remove('hidden');

    // Añade eventos de clic a las sugerencias
    Array.from(suggestionsList.children).forEach(item => {
        item.addEventListener('click', () => {
            const selectedPokemonName = item.getAttribute('data-name');
            const selectedPokemon = POKEMON_LIST.find(p => p.name === selectedPokemonName);

            // Actualiza el campo de búsqueda con el nombre seleccionado
            searchInput.value = capitalizeWords(selectedPokemon.name);

            // Oculta las sugerencias
            suggestionsList.innerHTML = '';
            suggestionsList.classList.add('hidden');

            // Actualiza los selectores de tipo
            typeSelect.value = selectedPokemon.types[0] || ''; // Primer tipo
            type2Select.value = selectedPokemon.types[1] || ''; // Segundo tipo (si existe)

            displayTypeDetails(typeSelect.value, type2Select.value);
        });
    });
});

// Oculta las sugerencias si el usuario hace clic fuera del campo de búsqueda
document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.innerHTML = '';
        suggestionsList.classList.add('hidden');
    }
});

function displayPokemonDetails(pokemon) {
    const typeDetails = document.getElementById('type-details');
    const typeName = document.getElementById('selected-type-name');
    const weaknesses = document.getElementById('weaknesses');
    const resistances = document.getElementById('resistances');
    const immunities = document.getElementById('immunities');

    // Actualiza los detalles del Pokémon
    typeName.textContent = capitalizeWords(pokemon.name);
    weaknesses.innerHTML = ''; // Limpia datos anteriores
    resistances.innerHTML = ''; // Limpia datos anteriores
    immunities.innerHTML = ''; // Limpia datos anteriores

    // Muestra los tipos del Pokémon
    pokemon.types.forEach(type => {
        const typeElement = document.createElement('div');
        typeElement.textContent = capitalizeWords(type);
        typeElement.className = `type-pill bg-${type.toLowerCase()}`;
        weaknesses.appendChild(typeElement); // Ejemplo: Añadir a debilidades
    });

    // Muestra la sección de detalles
    typeDetails.classList.remove('hidden');
}

function clearPokemonDetails() {
    const typeDetails = document.getElementById('type-details');
    const typeName = document.getElementById('selected-type-name');
    const weaknesses = document.getElementById('weaknesses');
    const resistances = document.getElementById('resistances');
    const immunities = document.getElementById('immunities');

    // Limpia los detalles
    typeName.textContent = '';
    weaknesses.innerHTML = '';
    resistances.innerHTML = '';
    immunities.innerHTML = '';

    // Oculta la sección de detalles
    typeDetails.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    generateTypeTable();
    populateTypeSelects();
    populatePokemonSelect(); // <-- Agrega esto

    const typeSelect = document.getElementById('type-select');
    const type2Select = document.getElementById('type2-select');
    const pokemonSelect = document.getElementById('pokemon-select'); // <-- Agrega esto
    const resetButton = document.getElementById('reset-button');

    function updateDetails() {
        displayTypeDetails(typeSelect.value, type2Select.value);
    }

    typeSelect.addEventListener('change', updateDetails);
    type2Select.addEventListener('change', updateDetails);

    pokemonSelect.addEventListener('change', () => {
        const selected = POKEMON_LIST.find(p => p.name === pokemonSelect.value);
        if (selected) {
            typeSelect.value = selected.types[0] || '';
            type2Select.value = selected.types[1] || '';
        } else {
            typeSelect.value = '';
            type2Select.value = '';
        }
        updateDetails();
    });

    resetButton.addEventListener('click', () => {
        typeSelect.value = '';
        type2Select.value = '';
        pokemonSelect.value = '';
        displayTypeDetails('', '');
    });

    document.getElementById('type-select').addEventListener('change', function() {
        const pokemonSelect = document.getElementById('pokemon-select');
        if (pokemonSelect.value) {
            pokemonSelect.value = "";
        }
    });

    document.getElementById('type2-select').addEventListener('change', function() {
        const pokemonSelect = document.getElementById('pokemon-select');
        if (pokemonSelect.value) {
            pokemonSelect.value = "";
        }
    });
});