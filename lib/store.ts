import { settingsSlice } from '@/features/settingSlice'
import { configureStore } from '@reduxjs/toolkit'
import visitorStatsReducer from '@/features/visitorStats/visitorStatsSlice' // ← add

export const makeStore = () => {
    return configureStore({
        reducer: {
            settings: settingsSlice.reducer,
            visitorStats: visitorStatsReducer, // ← add
        },
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']