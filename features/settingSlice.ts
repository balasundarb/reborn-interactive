// lib/features/settings/settingsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store'
import { applyTheme } from '@/utils/theme.utils'

interface SettingsState {
    theme: 'light' | 'dark'
}

const initialState: SettingsState = {
    theme: 'light',
}

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light'
            state.theme = newTheme
            applyTheme(newTheme)
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload
            applyTheme(action.payload)
        },
        // Add initializeTheme action
        initializeTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload
            applyTheme(action.payload)
        },
    },
})

export const { toggleTheme, setTheme, initializeTheme } = settingsSlice.actions

export const selectTheme = (state: RootState) => state.settings.theme

export default settingsSlice.reducer