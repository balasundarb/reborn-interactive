export const THEME_KEY = 'reborn-theme'

export const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

export const getStoredTheme = (): 'light' | 'dark' | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null
}

export const applyTheme = (theme: 'light' | 'dark') => {
    if (typeof document === 'undefined') return

    const html = document.documentElement

    html.classList.remove('light', 'dark')
    html.classList.add(theme)
    html.setAttribute('data-theme', theme)

    localStorage.setItem(THEME_KEY, theme)

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
        meta.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff')
    }
}



export const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'

    return getStoredTheme() || getSystemTheme()
}