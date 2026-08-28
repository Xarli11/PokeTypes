// src/js/modules/a11y.js
//
// Small, dependency-free helpers shared by every overlay in this app —
// the search modal, delete modal, member config modal, and the type
// selector's mobile bottom sheet: a focusable-element query, a Tab/
// Shift+Tab focus trap, and a reference-counted body scroll lock so two
// overlays closing in any order (Escape, backdrop, a selection) never
// leave the page scroll-locked or double-unlocked.

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** All genuinely focusable, visible elements inside `container`, in DOM order. */
export function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter(el => el.offsetParent !== null);
}

/**
 * Keeps Tab/Shift+Tab cycling within `container`. Call from a keydown
 * listener while the overlay is open; a no-op for any key but Tab, and
 * for Tab when the container has no focusable elements.
 */
export function trapTabKey(e, container) {
    if (e.key !== 'Tab') return;
    const focusable = getFocusable(container);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}

let scrollLockCount = 0;
let savedScrollY = 0;

/** Reference-counted: safe to call once per overlay that opens, even if
 * overlays can (in theory) stack — only the first lock actually freezes
 * the page, only the last matching unlock releases it. */
export function lockBodyScroll() {
    if (scrollLockCount === 0) {
        savedScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
    }
    scrollLockCount++;
}

export function unlockBodyScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, savedScrollY);
    }
}
