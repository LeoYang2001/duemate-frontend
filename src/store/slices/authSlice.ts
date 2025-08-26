import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { isAuthenticated, getCurrentUser, getSchoolUrlKey } from '../../api/authService';
import type { User } from '../../api/userApi';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  schoolUrlKey: string | null;
  isNewUser: boolean;
  hasCompletedSetup: boolean;
}

const initialState: AuthState = {
  isAuthenticated: isAuthenticated(),
  user: getCurrentUser(),
  schoolUrlKey: getSchoolUrlKey(),
  isNewUser: false,
  hasCompletedSetup: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<{ user: User; isNewUser: boolean }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.isNewUser = action.payload.isNewUser;
      state.schoolUrlKey = action.payload.user.school;
      state.hasCompletedSetup = false; // Always require setup process for courses
    },
    setLoggedOut: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.schoolUrlKey = null;
      state.isNewUser = false;
      state.hasCompletedSetup = false;
    },
    setSetupCompleted: (state) => {
      state.hasCompletedSetup = true;
      state.isNewUser = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setAuthenticated, setLoggedOut, setSetupCompleted, updateUser } = authSlice.actions;
export default authSlice.reducer;
