import { messages } from '../lang/messages.js?v=2.22.8';

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('poketypes_lang') || 'en';
        this.abilityMap = {}; // Loaded dynamically
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('poketypes_lang', lang);
        document.documentElement.lang = lang;
    }

    setAbilityMap(map) {
        this.abilityMap = map;
    }

    t(key) {
        if (!key) return '';
        const keys = key.split('.');
        let value = messages[this.currentLang];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }
        return value;
    }

    tType(type) {
        if (!type) return '';
        // Types are keys in messages object
        const key = type.toLowerCase();
        return this.t(key) !== key ? this.t(key) : type;
    }

    tAbility(slug) {
        if (!slug) return '';
        const normalized = slug.toLowerCase().replace(/ /g, '-');
        const entry = this.abilityMap[normalized];
        if (entry) {
            return entry[this.currentLang] || entry['en'] || slug;
        }
        return slug;
    }

    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                if (el.tagName === 'INPUT') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
    }
}

export const i18n = new I18n();