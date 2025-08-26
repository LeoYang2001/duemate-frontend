import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getCurrentSemester } from '../../utils';

interface UiState {
  isGlobalLoading: boolean;
  loadingMessage: string;
  showSetupModal: boolean;
  selectedSemester: string;
}

const initialState: UiState = {
  isGlobalLoading: false,
  loadingMessage: '',
  showSetupModal: false,
  selectedSemester: localStorage.getItem('selectedSemester') || getCurrentSemester(),
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
