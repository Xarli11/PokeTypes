// src/lib/type-engine/modifiers.js
//
// Ability and item modifiers layered on top of the raw type-effectiveness
// map from effectiveness.js. Every entry is one of four explicit kinds so
// callers (and tests) can reason about them without guessing:
//
//   - immunity              : modifier === 0 with no flags below. Always
//                              wins over anything else applied after it.
//   - multiplier            : plain damage scaling (0.5, 1.25, 1.5, 2, ...).
//   - conditional effect    : `superEffectiveOnly` (Filter/Solid Rock/Prism
//                             Armor — only scales hits that are already
//                             super effective) or `blockNonSE` (Wonder
//                             Guard — zeroes anything that isn't already
//                             super effective; NOT a blanket immunity to
//                             all 18 types, see getImmuneTypesFromModifiers
//                             below).
//   - battle-context-gated  : `requiresContext: 'fullHp' | 'contact'` plus
//                             `contextValue` (the boolean that must be
//                             confirmed for the effect to apply — see
//                             "Battle context" below). `forceValue: true`
//                             means "set the multiplier to exactly
//                             `modifier`" instead of multiplying by it —
//                             needed for Tera Shell (see below).
//
// `type: 'Offensive'` entries describe a move-boosting effect on the
// ability holder's own STAB (Transistor, Adaptability, Tinted Lens...).
// They never change how much damage the holder TAKES, so
// `applyDefensiveModifiers` intentionally ignores them — they only exist
// for informational display (see ui.js renderAbilityAlerts and
// simulator.js's "why didn't the number change" note).
//
// ── Battle context ──────────────────────────────────────────────────────
//
// A handful of real abilities only apply under a condition PokeTypes has
// no general concept of tracking (current HP, whether the incoming move
// makes contact, weather, ...). Rather than silently assume the
// condition holds (or doesn't), those entries carry `requiresContext` +
// `contextValue`, and `applyDefensiveModifiers` takes an optional
// `context` object (e.g. `{ fullHp: true }`). A gated entry only applies
// when `context[requiresContext] === contextValue` *exactly* — an absent
// key (`undefined`, the default) never matches `true` or `false`, so the
// default behavior everywhere (Team Builder's analyzeTeamDefense, and the
// Ability Interaction Checker until it gains real HP/contact inputs) is
// to leave these modifiers un-applied rather than assume a favorable (or
// unfavorable) state. This is why analyzeTeamDefense's weak/resist/immune
// counts never silently assume "full HP" — see team.js and
// docs/type-engine.md.
//
// Known caveats, deliberately not modeled beyond this:
//   - Multiscale / Shadow Shield (`requiresContext: 'fullHp'`) only ever
//     apply when the caller explicitly confirms `fullHp: true`.
//   - Tera Shell (`requiresContext: 'fullHp'`, `forceValue: true`) forces
//     any non-immune hit down to exactly 0.5x at full HP — it is not a
//     flat ×0.5 multiplier (a 4x hit would incorrectly stay super
//     effective at 2x if it were just multiplied).
//   - Fluffy's Fire weakness (×2) only depends on the attacking type,
//     which Team Builder always knows, so it stays unconditional. Its
//     contact-based halving (×0.5, all types) requires knowing whether
//     the incoming move makes contact, which PokeTypes has no way to
//     know for a bare type combination — so it only applies when
//     `context.contact === true` is explicitly confirmed (e.g. by a
//     future simulator input), never assumed either way.
//   - Neutralizing Gas (suppresses every other ability) and Delta Stream
//     (removes a Flying-type's own weaknesses while its weather is
//     active) require cross-ability/weather state PokeTypes doesn't
//     track at all (not even as an opt-in context flag). They are listed
//     with a neutral modifier (no-op) rather than simulated.

export const ABILITY_EFFECTIVENESS = {
    'levitate': [{ type: 'Ground', modifier: 0, descriptionKey: 'modifier_ground_immunity_description' }],
    'flash-fire': [{ type: 'Fire', modifier: 0, descriptionKey: 'modifier_fire_immunity_description' }],
    'volt-absorb': [{ type: 'Electric', modifier: 0, descriptionKey: 'modifier_electric_immunity_description' }],
    'motor-drive': [{ type: 'Electric', modifier: 0, descriptionKey: 'modifier_electric_immunity_description' }],
    'lightning-rod': [{ type: 'Electric', modifier: 0, descriptionKey: 'modifier_electric_immunity_description' }],
    'sap-sipper': [{ type: 'Grass', modifier: 0, descriptionKey: 'modifier_grass_immunity_description' }],
    'water-absorb': [{ type: 'Water', modifier: 0, descriptionKey: 'modifier_water_immunity_description' }],
    'storm-drain': [{ type: 'Water', modifier: 0, descriptionKey: 'modifier_water_immunity_description' }],
    'dry-skin': [
        { type: 'Water', modifier: 0, descriptionKey: 'modifier_water_immunity_description' },
        { type: 'Fire', modifier: 1.25, descriptionKey: 'modifier_fire_damage_increase_25_description' }
    ],
    'earth-eater': [{ type: 'Ground', modifier: 0, descriptionKey: 'modifier_ground_immunity_description' }],
    'thick-fat': [
        { type: 'Fire', modifier: 0.5, descriptionKey: 'modifier_fire_damage_half_description' },
        { type: 'Ice', modifier: 0.5, descriptionKey: 'modifier_ice_damage_half_description' }
    ],
    'heatproof': [{ type: 'Fire', modifier: 0.5, descriptionKey: 'modifier_fire_damage_half_description' }],
    'purifying-salt': [{ type: 'Ghost', modifier: 0.5, descriptionKey: 'modifier_ghost_damage_half_description' }],
    'well-baked-body': [{ type: 'Fire', modifier: 0, descriptionKey: 'modifier_fire_immunity_description' }],
    'water-bubble': [{ type: 'Fire', modifier: 0.5, descriptionKey: 'modifier_fire_damage_half_description' }],
    'fluffy': [
        { type: 'Fire', modifier: 2, descriptionKey: 'modifier_fire_damage_double_description' },
        {
            type: 'All', modifier: 0.5, requiresContext: 'contact', contextValue: true,
            descriptionKey: 'modifier_contact_damage_half_description'
        }
    ],
    'filter': [{ type: 'All', modifier: 0.75, superEffectiveOnly: true, descriptionKey: 'modifier_reduce_super_effective_25_description' }],
    'solid-rock': [{ type: 'All', modifier: 0.75, superEffectiveOnly: true, descriptionKey: 'modifier_reduce_super_effective_25_description' }],
    'prism-armor': [{ type: 'All', modifier: 0.75, superEffectiveOnly: true, descriptionKey: 'modifier_reduce_super_effective_25_description' }],
    'wonder-guard': [{ type: 'All', modifier: 0, blockNonSE: true, descriptionKey: 'modifier_wonder_guard_description' }],
    'multiscale': [{
        type: 'All', modifier: 0.5, requiresContext: 'fullHp', contextValue: true,
        descriptionKey: 'modifier_half_damage_full_hp_description'
    }],
    'shadow-shield': [{
        type: 'All', modifier: 0.5, requiresContext: 'fullHp', contextValue: true,
        descriptionKey: 'modifier_half_damage_full_hp_description'
    }],
    'tera-shell': [{
        type: 'All', modifier: 0.5, forceValue: true, requiresContext: 'fullHp', contextValue: true,
        descriptionKey: 'modifier_tera_shell_description'
    }],
    'delta-stream': [{ type: 'Flying', modifier: 1, descriptionKey: 'modifier_delta_stream_description' }],
    'desolate-land': [{ type: 'Water', modifier: 0, descriptionKey: 'modifier_water_immunity_description' }],
    'primordial-sea': [{ type: 'Fire', modifier: 0, descriptionKey: 'modifier_fire_immunity_description' }],
    'neutralizing-gas': [{ type: 'All', modifier: 1, descriptionKey: 'modifier_neutralizing_gas_description' }],
    'tinted-lens': [{ type: 'Offensive', modifier: 2, descriptionKey: 'modifier_tinted_lens_description' }],
    'scrappy': [{ type: 'Offensive', modifier: 1, descriptionKey: 'modifier_hits_ghost_types_description' }],
    'minds-eye': [{ type: 'Offensive', modifier: 1, descriptionKey: 'modifier_hits_ghost_types_description' }],
    'adaptability': [{ type: 'Offensive', modifier: 2, descriptionKey: 'modifier_adaptability_description' }],
    'neuroforce': [{ type: 'Offensive', modifier: 1.25, descriptionKey: 'modifier_neuroforce_description' }],
    'galvanize': [{ type: 'Offensive', modifier: 1.2, descriptionKey: 'modifier_galvanize_description' }],
    'pixilate': [{ type: 'Offensive', modifier: 1.2, descriptionKey: 'modifier_pixilate_description' }],
    'refrigerate': [{ type: 'Offensive', modifier: 1.2, descriptionKey: 'modifier_refrigerate_description' }],
    'aerilate': [{ type: 'Offensive', modifier: 1.2, descriptionKey: 'modifier_aerilate_description' }],
    // Modern (Gen 9) Transistor boost is 1.3x — the Gen 8 value was 1.5x.
    'transistor': [{ type: 'Offensive', modifier: 1.3, descriptionKey: 'modifier_transistor_description' }],
    'dragons-maw': [{ type: 'Offensive', modifier: 1.5, descriptionKey: 'modifier_dragons_maw_description' }],
    'steelworker': [{ type: 'Offensive', modifier: 1.5, descriptionKey: 'modifier_steelworker_description' }],
    'rocky-payload': [{ type: 'Offensive', modifier: 1.5, descriptionKey: 'modifier_rocky_payload_description' }],
    'stakeout': [{ type: 'Offensive', modifier: 2, descriptionKey: 'modifier_stakeout_description' }]
};

export const ITEM_EFFECTIVENESS = {
    'air-balloon': [{ type: 'Ground', modifier: 0, descriptionKey: 'modifier_air_balloon_description' }],
    // Negates the holder's own TYPE-based immunities (Ghost immune to
    // Normal, Ground immune to Electric, Flying immune to Ground, ...) —
    // it does NOT undo an ability/item's own immunity (Levitate, Volt
    // Absorb, Flash Fire, ...). See modifiers.removesTypeImmunity below.
    'ring-target': [{ type: 'All', modifier: 1, removesTypeImmunity: true, descriptionKey: 'modifier_ring_target_description' }]
};

/**
 * Normalizes the same way getItemModifiers already does (lowercase,
 * spaces -> dashes), plus stripping apostrophes ("Dragon's Maw" ->
 * "dragons-maw"). Callers pass ability names in two different shapes
 * depending on where the data came from: PokeAPI-fetched ability
 * objects are already dash-slugged ("thick-fat"), but pokedex.json's
 * local `abilities` map (what Team Builder's ability <select> is built
 * from) stores the display form with spaces ("Thick Fat") — found via
 * real browser QA of the Team Builder's raw/effective preview: it
 * silently showed nothing for Thick Fat/Purifying Salt/every
 * multi-word ability, because `"Thick Fat".toLowerCase()` ('thick
 * fat') never matched the 'thick-fat' key. Normalizing here (matching
 * the slug format already used everywhere in ABILITY_EFFECTIVENESS)
 * makes both shapes resolve the same way.
 */
export function getAbilityModifiers(abilityName) {
    if (!abilityName) return [];
    const slug = abilityName.toLowerCase().replace(/'/g, '').replace(/ /g, '-');
    return ABILITY_EFFECTIVENESS[slug] || [];
}

export function getItemModifiers(itemName) {
    if (!itemName) return [];
    const slug = itemName.toLowerCase().replace(/ /g, '-');
    return ITEM_EFFECTIVENESS[slug] || [];
}

/**
 * The subset of a modifier list that represents a hard, UNCONDITIONAL
 * immunity to a type — i.e. modifier === 0 with none of the conditional
 * flags. Deliberately excludes `blockNonSE` (Wonder Guard is not immune
 * to all 18 types — it only blocks hits that aren't already super
 * effective) and anything gated behind `requiresContext` that isn't
 * known to be satisfied (this function has no context to check against,
 * so it conservatively never counts those as immunities).
 * @param {Array<{type: string, modifier: number, blockNonSE?: boolean, superEffectiveOnly?: boolean, requiresContext?: string}>} modifiers
 * @param {string[]} allTypes
 * @returns {Set<string>}
 */
export function getImmuneTypesFromModifiers(modifiers, allTypes) {
    const immune = new Set();
    modifiers.forEach(mod => {
        if (mod.modifier !== 0) return;
        if (mod.blockNonSE || mod.superEffectiveOnly || mod.requiresContext) return;
        const types = mod.type === 'All' ? allTypes : [mod.type];
        types.forEach(t => immune.add(t));
    });
    return immune;
}

/**
 * Applies a combined list of ability/item defensive modifiers on top of a
 * raw per-attacking-type multiplier map (see effectiveness.computeDefenseMap).
 * Pure — returns a new map, never mutates `defenseMap`.
 *
 * Only entries whose `type` is a real type name (or 'All') can affect
 * anything here: `type: 'Offensive'` entries never match a real type key
 * and are therefore always a no-op in this function, by construction.
 *
 * @param {Record<string, number>} defenseMap
 * @param {Array<{type: string, modifier: number, superEffectiveOnly?: boolean, blockNonSE?: boolean, removesTypeImmunity?: boolean, forceValue?: boolean, requiresContext?: string, contextValue?: boolean}>} modifiers
 * @param {string[]} allTypes
 * @param {object} [options]
 * @param {Record<string, boolean>} [options.context] - confirmed battle-state flags, e.g. `{ fullHp: true }`. A key that's absent (or `undefined`) never satisfies a `requiresContext` gate.
 * @param {Record<string, number>} [options.ignoringTypeImmunityMap] - result of `computeDefenseMapIgnoringTypeImmunities` for the same defending combination; required for `removesTypeImmunity` (Ring Target) entries to have any effect. If omitted, those entries are a documented no-op rather than a guess.
 * @returns {Record<string, number>}
 */
export function applyDefensiveModifiers(defenseMap, modifiers, allTypes, options = {}) {
    const { context = {}, ignoringTypeImmunityMap = null } = options;
    const result = { ...defenseMap };

    const isGateSatisfied = (mod) => !mod.requiresContext || context[mod.requiresContext] === mod.contextValue;

    // Stage 1: unconditional hard immunities (modifier === 0, no flags).
    // Tracked separately so Ring Target (stage 2) can tell a TYPE-based
    // immunity (present in the original `defenseMap`, negatable) apart
    // from an ABILITY/ITEM-based one recorded here (never negatable).
    const hardImmuneTypes = new Set();
    modifiers.forEach(mod => {
        if (mod.modifier !== 0 || mod.blockNonSE || mod.superEffectiveOnly || mod.removesTypeImmunity) return;
        if (!isGateSatisfied(mod)) return;
        const types = mod.type === 'All' ? allTypes : (Object.prototype.hasOwnProperty.call(result, mod.type) ? [mod.type] : []);
        types.forEach(type => {
            result[type] = 0;
            hardImmuneTypes.add(type);
        });
    });

    // Stage 2: Ring Target — negate TYPE-based immunities only. Never
    // touches a type that an ability/item made immune in stage 1 above.
    if (ignoringTypeImmunityMap) {
        modifiers.forEach(mod => {
            if (!mod.removesTypeImmunity || !isGateSatisfied(mod)) return;
            allTypes.forEach(type => {
                const wasTypeImmune = defenseMap[type] === 0;
                if (wasTypeImmune && !hardImmuneTypes.has(type)) {
                    result[type] = ignoringTypeImmunityMap[type];
                }
            });
        });
    }

    // Stage 3: everything else — conditional effects and plain multipliers.
    modifiers.forEach(mod => {
        if (mod.removesTypeImmunity) return; // handled in stage 2
        if (mod.modifier === 0 && !mod.blockNonSE && !mod.superEffectiveOnly) return; // handled in stage 1
        if (!isGateSatisfied(mod)) return; // e.g. fullHp/contact not confirmed — leave untouched

        const types = mod.type === 'All'
            ? allTypes
            : (Object.prototype.hasOwnProperty.call(result, mod.type) ? [mod.type] : []);

        types.forEach(type => {
            const current = result[type];

            if (mod.blockNonSE) {
                // Wonder Guard: only super-effective hits get through.
                if (current < 2) result[type] = 0;
            } else if (mod.superEffectiveOnly) {
                // Filter / Solid Rock / Prism Armor: only softens hits that
                // are already super effective; neutral/resisted/immune are
                // untouched.
                if (current >= 2) result[type] = current * mod.modifier;
            } else if (mod.forceValue) {
                // Tera Shell: any hit that connects becomes exactly
                // `modifier` (0.5x) — natural immunities (0x) stay 0.
                if (current !== 0) result[type] = mod.modifier;
            } else {
                result[type] = current * mod.modifier;
            }
        });
    });

    return result;
}
