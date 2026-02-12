import { messages } from '../lang/messages.js?v=2.22.8';

class I18n {
    constructor() {
        this.currentLang = this.getPreferredLanguage();
        this.observers = [];
    }

    getPreferredLanguage() {
        const stored = localStorage.getItem('poketypes-lang');
        if (stored) return stored;
        
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.startsWith('es') ? 'es' : 'en';
    }

    setLanguage(lang) {
        if (!messages[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('poketypes-lang', lang);
        this.updateDOM();
        this.notifyObservers();
        
        // Update HTML lang attribute for accessibility/SEO
        document.documentElement.lang = lang;
    }

    t(key, replacements = {}) {
        // Handle nested keys if needed (for now flat structure is fine)
        // Also fallback to English if key missing in ES
        let text = messages[this.currentLang][key] || messages['en'][key] || key;
        
        // Simple interpolation: replace {placeholder} with value
        Object.keys(replacements).forEach(placeholder => {
            const regex = new RegExp(`{${placeholder}}`, 'g');
            text = text.replace(regex, replacements[placeholder]);
        });

        return text;
    }

    // Method to translate type names specifically (case insensitive fallback)
    tType(type) {
        if (!type) return '';
        const key = type.toLowerCase();
        return this.t(key);
    }

    updateDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                // If it's an input, update placeholder
                if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
                    el.placeholder = this.t(key);
                } else {
                    el.textContent = this.t(key);
                }
            }
        });
        
        // Update select options (Type 1 / Type 2 placeholders)
        // Note: Actual type options are dynamically generated, so they need re-generation
    }

    subscribe(callback) {
        this.observers.push(callback);
    }

    notifyObservers() {
        this.observers.forEach(cb => cb(this.currentLang));
    }
}

export const i18n = new I18n();
