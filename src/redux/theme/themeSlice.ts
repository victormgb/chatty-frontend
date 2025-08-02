import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define the state interface for the theme slice
export interface ThemeState {
  theme: string;
}

// Define the initial state
// It reads the theme from localStorage or defaults to 'coffee'
const initialState: ThemeState = {
  theme: localStorage.getItem("chat-theme") || "coffee",
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Sets the theme and updates localStorage.
     * The payload should be the theme string.
     */
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
      localStorage.setItem("chat-theme", action.payload);
    },
  },
});

// Export the action creator
export const { setTheme } = themeSlice.actions;

// Export the reducer
export default themeSlice.reducer;

// Selector to easily get the current theme from the Redux store
// Assuming RootState is defined in your store.ts
export const selectTheme = (state: RootState) => state.theme.theme;