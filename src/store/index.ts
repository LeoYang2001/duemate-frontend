import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import coursesSlice from './slices/coursesSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: coursesSlice,
    ui: uiSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
