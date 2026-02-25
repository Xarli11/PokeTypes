export function initTheme() {
    // 1. Detection is already handled in index.html to prevent flashbang
    // but we keep this here to ensure the UI stays in sync if called again.
    const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);

    // 2. Setup Toggle Button Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // Toggle class
            document.documentElement.classList.toggle('dark');

            // Save preference
            if (document.documentElement.classList.contains('dark')) {
                localStorage.theme = 'dark';
            } else {
                localStorage.theme = 'light';
            }
        });
    }
}
