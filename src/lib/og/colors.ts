// Mirrors the `.bg-type-*` hex values in src/styles/global.css. Satori
// needs literal inline colors (no CSS classes), so this intentionally
// duplicates the palette rather than trying to share Tailwind classes with
// a non-DOM renderer — keep the two in sync if a type color ever changes.
export const TYPE_COLORS: Record<string, string> = {
    Normal: '#A8A77A',
    Fire: '#EE8130',
    Water: '#6390F0',
    Grass: '#7AC74C',
    Electric: '#F7D02C',
    Ice: '#96D9D6',
    Fighting: '#C22E28',
    Poison: '#A33EA1',
    Ground: '#E2BF65',
    Flying: '#A98FF3',
    Psychic: '#F95587',
    Bug: '#A6B91A',
    Rock: '#B6A136',
    Ghost: '#735797',
    Dragon: '#6F35FC',
    Steel: '#B7B7CE',
    Fairy: '#D685AD',
    Dark: '#705746',
};

// Same source as src/data/type-data.json's `contrast` map — light types
// need dark text/pill labels and vice versa.
const LIGHT_TEXT_TYPES = new Set(['Fire', 'Water', 'Grass', 'Fighting', 'Poison', 'Flying', 'Psychic', 'Bug', 'Ghost', 'Dragon', 'Dark']);

export function typeColor(type: string): string {
    return TYPE_COLORS[type] ?? '#6B7280';
}

export function typeTextColor(type: string): string {
    return LIGHT_TEXT_TYPES.has(type) ? '#FFFFFF' : '#0B0E14';
}

// Battle-tool dark identity — deliberately not the app's light-mode
// surfaces, and deliberately not "emerald" as a brand accent (see sprint
// brief): the card's color always comes from the type(s) it represents.
export const CARD_BG = '#0B0E14';
export const CARD_SURFACE = '#111620';
export const CARD_SURFACE_RAISED = '#161D29';
export const CARD_BORDER = '#242C3A';
export const CARD_TEXT = '#F6F7F9';
export const CARD_TEXT_MUTED = '#8B94A3';

// Same dark-mode --danger/--warning/--success tokens as global.css, for the
// small 2x/½x/0x multiplier badges on the home card.
export const SEVERITY_WEAK = '#EF4444';
export const SEVERITY_RESIST = '#22C55E';
export const SEVERITY_IMMUNE = '#8B94A3';
