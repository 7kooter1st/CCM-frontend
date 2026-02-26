import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import consumptionsReducer from './consumptionsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    consumptions: consumptionsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
