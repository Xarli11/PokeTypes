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
//
// Accessibility model: below the `sm` breakpoint the popover becomes a
// full bottom sheet and behaves like a real modal (aria-modal, body
// scroll lock, Tab trapped inside). At `sm` and above it's a lightweight
// anchored popover — not modal: Tab is allowed to move focus out of it
// (closing it, like a native <select>'s dropdown would), and clicking
// outside also closes it. Either way, closing always returns focus to
// the trigger button that opened it.

import { i18n } from './i18n.js';
import { getFocusable, trapTabKey, lockBodyScroll, unlockBodyScroll } from './a11y.js';

const MOBILE_BREAKPOINT = 640;

let types = [];
let contrastData = {};
let popover = null;
let backdrop = null;
let activeButton = null;
let activeSelect = null;
let isSheetMode = false;

/** Pure — used by initTypeSelectors and by tests. */
export function buildTypeGridHTML(typeList, contrast, selectedType = '') {
    return typeList.map(type => {
        const tc = contrast[type] === 'dark' ? 'type-text-dark' : 'type-text-light';
        const pressed = type === selectedType;
        return `<button type="button" class="type-grid-option type-pill bg-type-${type.toLowerCase()} ${tc}" data-type="${type}" role="button" aria-pressed="${pressed}">${i18n.tType(type)}</button>`;
    }).join('');
}

export function initTypeSelectors(allTypes, contrast) {
    types = allTypes;
    contrastData = contrast;

    if (!popover) {
        backdrop = document.createElement('div');
        backdrop.id = 'type-selector-backdrop';
        backdrop.className = 'type-selector-backdrop hidden';
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', closePopover);

        popover = document.createElement('div');
        popover.id = 'type-selector-popover';
        popover.className = 'type-selector-popover hidden';
        popover.setAttribute('role', 'dialog');
        popover.setAttribute('aria-modal', 'false');
        popover.setAttribute('aria-label', i18n.t('choose_type'));
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

        popover.addEventListener('keydown', handlePopoverKeydown);

        document.addEventListener('click', (e) => {
            if (popover.classList.contains('hidden')) return;
            if (!popover.contains(e.target) && !e.target.closest('.type-selector-btn')) {
                closePopover();
            }
        });

        // Non-modal desktop popover: Tab moving focus out of it (to
        // anything other than the popover itself or its trigger) closes
        // it, same as a native <select> losing focus.
        popover.addEventListener('focusout', (e) => {
            if (isSheetMode) return;
            const next = e.relatedTarget;
            if (next && (popover.contains(next) || next === activeButton)) return;
            closePopover();
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
        btn.setAttribute('aria-controls', 'type-selector-popover');
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
    const selectedType = activeSelect ? activeSelect.value : '';
    popover.innerHTML = `
        <div class="type-selector-header">
            <span class="type-selector-title" data-i18n="choose_type">${i18n.t('choose_type')}</span>
            <button type="button" class="type-selector-clear" data-action="clear" data-i18n="clear_selection">${i18n.t('clear_selection')}</button>
        </div>
        <div class="type-selector-grid">${buildTypeGridHTML(types, contrastData, selectedType)}</div>
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

    isSheetMode = window.innerWidth < MOBILE_BREAKPOINT;
    popover.setAttribute('aria-modal', String(isSheetMode));
    backdrop.classList.toggle('hidden', !isSheetMode);
    if (isSheetMode) lockBodyScroll();

    renderPopoverContent(); // reflect current selection's aria-pressed
    popover.classList.remove('hidden');
    positionPopover(btn);

    // Move focus into the panel: the currently selected type if there is
    // one, otherwise the first focusable control (Clear or the first
    // type option).
    const selected = popover.querySelector('[data-type][aria-pressed="true"]');
    const target = selected || getFocusable(popover)[0];
    target?.focus();
}

function closePopover() {
    const wasSheet = isSheetMode;
    if (activeButton) {
        activeButton.setAttribute('aria-expanded', 'false');
        activeButton.focus();
    }
    popover.classList.add('hidden');
    backdrop.classList.add('hidden');
    if (wasSheet) unlockBodyScroll();
    isSheetMode = false;
    activeButton = null;
    activeSelect = null;
}

function positionPopover(btn) {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
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

function handlePopoverKeydown(e) {
    if (isSheetMode) trapTabKey(e, popover);

    const options = Array.from(popover.querySelectorAll('.type-selector-grid [data-type]'));
    const currentIndex = options.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (!arrowKeys.includes(e.key)) return;

    const grid = popover.querySelector('.type-selector-grid');
    const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 3;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowLeft') nextIndex = currentIndex - 1;
    else if (e.key === 'ArrowRight') nextIndex = currentIndex + 1;
    else if (e.key === 'ArrowUp') nextIndex = currentIndex - columns;
    else if (e.key === 'ArrowDown') nextIndex = currentIndex + columns;

    if (nextIndex >= 0 && nextIndex < options.length) {
        e.preventDefault();
        options[nextIndex].focus();
    }
}
