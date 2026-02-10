'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../store'
import { initializeTheme } from '@/features/settingSlice'
import { THEME_KEY } from '@/utils/theme.utils'

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const storeRef = useRef<AppStore>(undefined)
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore()

        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            const initialTheme = storedTheme || systemTheme

            storeRef.current.dispatch(initializeTheme(initialTheme))
        }
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}