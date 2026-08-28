// src/js/modules/typeSelector.js
//
// Visual popover replacement for the plain `Type 1 / Type 2 / Extra Type`
// native <select> elements — a button opens a compact 18-type color grid
// instead of a long alphabetical dropdown. Progressive enhancement: the
// original <select> elements stay in the DOM (visually hidden, but still
// real, functional selects with the same ids) as the single source of
// truth, so every existing main.js listener (`change` events, `.value`
// reads/writes from search selection, reset, URL restore, empty-state
// type buttons) keeps working completely unchanged — this module only
// ever does `select.value = X; select.dispatchEvent(new Event('change'))`,
// exactly like the pre-existing empty-state type buttons already did.

import { i18n } from './i18n.js';

let types = [];
let contrastData = {};
let popover = null;
let activeButton = null;
let activeSelect = null;

/** Pure — used by initTypeSelectors and by tests. */
export function buildTypeGridHTML(typeList, contrast) {
    return typeList.map(type => {
        const tc = contrast[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
        return `<button type="button" class="type-grid-option type-pill bg-type-${type.toLowerCase()} ${tc}" data-type="${type}">${i18n.tType(type)}</button>`;
    }).join('');
}

export function initTypeSelectors(allTypes, contrast) {
    types = allTypes;
    contrastData = contrast;

    if (!popover) {
        popover = document.createElement('div');
        popover.id = 'type-selector-popover';
        popover.className = 'type-selector-popover hidden';
        popover.setAttribute('role', 'dialog');
        popover.setAttribute('aria-modal', 'false');
        document.body.appendChild(popover);

        popover.addEventListener('click', (e) => {
            const clear = e.target.closest('[data-action="clear"]');
            if (clear) {
                setSelection('');
                return;
            }
            const option = e.target.closest('[data-type]');
            if (option) setSelection(option.dataset.type);
        });

        document.addEventListener('click', (e) => {
            if (popover.classList.contains('hidden')) return;
            if (!popover.contains(e.target) && !e.target.closest('.type-selector-btn')) {
                closePopover();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !popover.classList.contains('hidden')) {
                closePopover();
            }
        });

        window.addEventListener('resize', () => {
            if (!popover.classList.contains('hidden') && activeButton) positionPopover(activeButton);
        });
    }

    renderPopoverContent();

    document.querySelectorAll('.type-selector-btn').forEach(btn => {
        if (btn.dataset.tsBound) return;
        btn.dataset.tsBound = '1';
        btn.addEventListener('click', () => togglePopover(btn));

        const select = document.getElementById(btn.dataset.for);
        if (select) select.addEventListener('change', () => updateButtonLabel(btn));
    });

    refreshTypeSelectorLabels();
}

/** Re-syncs every button's displayed label/translation from its select's
 * current value — call after populateSelects() repopulates options
 * (language change) or after any external code sets a select's value
 * without going through this module. */
export function refreshTypeSelectorLabels() {
    document.querySelectorAll('.type-selector-btn').forEach(updateButtonLabel);
    if (popover) renderPopoverContent();
}

function renderPopoverContent() {
    popover.innerHTML = `
        <div class="type-selector-header">
            <span class="type-selector-title" data-i18n="choose_type">${i18n.t('choose_type')}</span>
            <button type="button" class="type-selector-clear" data-action="clear" data-i18n="clear_selection">${i18n.t('clear_selection')}</button>
        </div>
        <div class="type-selector-grid">${buildTypeGridHTML(types, contrastData)}</div>
    `;
}

function setSelection(type) {
    if (!activeSelect) return;
    activeSelect.value = type;
    activeSelect.dispatchEvent(new Event('change'));
    closePopover();
}

function updateButtonLabel(btn) {
    const select = document.getElementById(btn.dataset.for);
    const labelEl = btn.querySelector('.type-selector-label');
    if (!select || !labelEl) return;

    const value = select.value;
    if (value) {
        const tc = contrastData[value] === 'dark' ? 'type-text-dark' : 'type-text-light';
        labelEl.innerHTML = `<span class="type-pill bg-type-${value.toLowerCase()} ${tc}">${i18n.tType(value)}</span>`;
        btn.classList.add('type-selector-btn-filled');
    } else {
        labelEl.textContent = i18n.t(btn.dataset.placeholder || 'choose_type');
        btn.classList.remove('type-selector-btn-filled');
    }
}

function togglePopover(btn) {
    if (activeButton === btn && !popover.classList.contains('hidden')) {
        closePopover();
        return;
    }
    activeButton = btn;
    activeSelect = document.getElementById(btn.dataset.for);
    btn.setAttribute('aria-expanded', 'true');
    popover.classList.remove('hidden');
    positionPopover(btn);
}

function closePopover() {
    if (activeButton) {
        activeButton.setAttribute('aria-expanded', 'false');
        activeButton.focus();
    }
    popover.classList.add('hidden');
    activeButton = null;
    activeSelect = null;
}

function positionPopover(btn) {
    if (window.innerWidth < 640) {
        popover.classList.add('type-selector-sheet');
        popover.style.position = '';
        popover.style.top = '';
        popover.style.left = '';
        return;
    }

    popover.classList.remove('type-selector-sheet');
    const rect = btn.getBoundingClientRect();
    const panelWidth = 320;
    const left = Math.min(rect.left, window.innerWidth - panelWidth - 16);

    popover.style.position = 'fixed';
    popover.style.top = `${rect.bottom + 8}px`;
    popover.style.left = `${Math.max(8, left)}px`;
}
