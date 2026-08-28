function syncThemeColorMeta(isDark) {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0B0E14' : '#F6F7F9');
}

export function initTheme() {
    // 1. Detection is already handled in index.html to prevent flashbang
    // but we keep this here to ensure the UI stays in sync if called again.
    const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
    syncThemeColorMeta(isDark);

    // 2. Setup Toggle Button Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // Toggle class
            document.documentElement.classList.toggle('dark');
            const nowDark = document.documentElement.classList.contains('dark');

            // Save preference
            localStorage.theme = nowDark ? 'dark' : 'light';
            syncThemeColorMeta(nowDark);
        });
    }
}
