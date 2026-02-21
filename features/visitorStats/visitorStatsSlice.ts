import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/lib/store";
import type { VisitorStats } from "@/types/visitor";

// ─── State ────────────────────────────────────────────────────────────────────

interface VisitorStatsState {
  stats: VisitorStats | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastUpdated: string | null;
}

const initialState: VisitorStatsState = {
  stats: null,
  status: "idle",
  error: null,
  lastUpdated: null,
};

// ─── Thunk ────────────────────────────────────────────────────────────────────

export const fetchVisitorStats = createAsyncThunk<
  VisitorStats,
  void,
  { rejectValue: string }
>("visitorStats/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/analytics/stats");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as VisitorStats;
  } catch (err: any) {
    return rejectWithValue(err.message ?? "Failed to fetch visitor stats");
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const visitorStatsSlice = createSlice({
  name: "visitorStats",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStats: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitorStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchVisitorStats.fulfilled,
        (state, action: PayloadAction<VisitorStats>) => {
          state.status = "succeeded";
          state.stats = action.payload;
          state.lastUpdated = new Date().toISOString();
        }
      )
      .addCase(fetchVisitorStats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch visitor stats";
      });
  },
});

export const { clearError, resetStats } = visitorStatsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectVisitorStats = (state: RootState) =>
  state.visitorStats.stats;
export const selectVisitorStatsStatus = (state: RootState) =>
  state.visitorStats.status;
export const selectVisitorStatsError = (state: RootState) =>
  state.visitorStats.error;
export const selectLastUpdated = (state: RootState) =>
  state.visitorStats.lastUpdated;

export default visitorStatsSlice.reducer;