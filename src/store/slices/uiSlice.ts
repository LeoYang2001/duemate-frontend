import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isGlobalLoading: boolean;
  loadingMessage: string;
  showSetupModal: boolean;
  selectedSemester: string;
}

const getCurrentYearFall = (): string => {
  const currentYear = new Date().getFullYear();
  return `${currentYear} Fall`;
};

// Initialize selectedSemester with fallback and save to localStorage
const initializeSelectedSemester = (): string => {
  const stored = localStorage.getItem('selectedSemester');
  if (stored) {
    return stored;
  }
  
  // If nothing in localStorage, use current year Fall and save it
  const defaultSemester = getCurrentYearFall();
  localStorage.setItem('selectedSemester', defaultSemester);
  return defaultSemester;
};

const initialState: UiState = {
  isGlobalLoading: false,
  loadingMessage: '',
  showSetupModal: false,
  selectedSemester: initializeSelectedSemester(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<{ loading: boolean; message?: string }>) => {
      state.isGlobalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },
    setShowSetupModal: (state, action: PayloadAction<boolean>) => {
      state.showSetupModal = action.payload;
    },
    setSelectedSemester: (state, action: PayloadAction<string>) => {
      state.selectedSemester = action.payload;
      // Also save to localStorage
      localStorage.setItem('selectedSemester', action.payload);
    },
  },
});

export const { setGlobalLoading, setShowSetupModal, setSelectedSemester } = uiSlice.actions;
export default uiSlice.reducer;
