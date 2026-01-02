import { getEffectiveness } from './calculator.js';

export function createTypePill(type, contrastData) {
    const textColorClass = contrastData[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
    return `<span class="type-pill bg-type-${type.toLowerCase()} ${textColorClass}">
        ${type}
    </span>`;
}

export function getEffectivenessIcon(type) {
    switch (type) {
        case 'super': 
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>`;
        case 'resist':
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>`;
        case 'immune':
            return `<svg class="label-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                    </svg>`;
        default:
            return '';
    }
}

export function renderEffectivenessCard(cardElement, labelText, typeList, noContentText, iconType, contrastData) {
    let contentHTML = `
        <div class="label-group"> ${getEffectivenessIcon(iconType)} <span>${labelText}</span></div>
        <div class="type-pills-container">
    `;
    if (typeList.length) {
        contentHTML += typeList.map(type => createTypePill(type, contrastData)).join('');
    } else {
        contentHTML += `<span class="text-slate-300 text-xs font-bold uppercase tracking-widest">${noContentText}</span>`;
    }
    contentHTML += `</div>`;
    cardElement.innerHTML = contentHTML;
}

export function renderSplitEffectivenessCard(cardElement, labelText, x4List, x2List, noContentText, iconType, contrastData) {
    let contentHTML = `<div class="label-group">${getEffectivenessIcon(iconType)} <span>${labelText}</span></div>`;
    contentHTML += `<div class="flex flex-col gap-4">`;
    
    if (x4List && x4List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-600 text-white font-black text-xs">x4</span>
            <div class="type-pills-container">${x4List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if (x2List && x2List.length) {
        contentHTML += `<div class="flex items-center gap-3">
            <span class="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white font-black text-xs">x2</span>
            <div class="type-pills-container">${x2List.map(t => createTypePill(t, contrastData)).join('')}</div>
        </div>`;
    }
    
    if ((!x4List || !x4List.length) && (!x2List || !x2List.length)) {
        contentHTML += `<span class="text-slate-300 text-xs font-bold uppercase tracking-widest">${noContentText}</span>`;
    }
    
    contentHTML += `</div>`;
    cardElement.innerHTML = contentHTML;
}

export function generateTypeTable(containerId, types, effectiveness, contrastData) {
    const tableContainer = document.getElementById(containerId);
    let tableHTML = '<table><thead><tr><th></th>';

    types.forEach(type => {
        const textColorClass = contrastData[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
        tableHTML += `<th class="bg-type-${type.toLowerCase()} ${textColorClass} !text-[10px] min-w-[40px]">${type.substring(0, 3)}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    types.forEach(attackingType => {
        tableHTML += `<tr><td class="font-bold text-slate-700 text-left pr-4">${attackingType}</td>`;
        types.forEach(defendingType => {
            const modifier = getEffectiveness(attackingType, defendingType, effectiveness);
            let cellClass = 'interaction-1x';
            let cellText = '';

            if (modifier === 2) { cellClass = 'interaction-2x'; cellText = '2'; }
            else if (modifier === 0.5) { cellClass = 'interaction-05x'; cellText = '½'; }
            else if (modifier === 0) { cellClass = 'interaction-0x'; cellText = '0'; }

            tableHTML += `<td class="${cellClass}">${cellText}</td>`;
        });
        tableHTML += '</tr>';
    });

    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}

export function populateSelects(ids, types) {
    ids.forEach(id => {
        const select = document.getElementById(id);
        const originalFirstOption = select.options[0].text;
        select.innerHTML = `<option value="">${originalFirstOption}</option>`;
        types.forEach(type => {
            const opt = document.createElement('option');
            opt.value = type;
            opt.textContent = type;
            select.appendChild(opt);
        });
    });
}

export function capitalizeWords(str) {
    return str.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
