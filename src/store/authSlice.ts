import { createSlice } from '@reduxjs/toolkit';
import type { UserData } from '../types';

const token = localStorage.getItem('token');
const refreshToken = localStorage.getItem('refreshToken');
const userJson = localStorage.getItem('user');
const user: UserData | null = userJson ? JSON.parse(userJson) : null;

export interface AuthState {
  user: UserData | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user,
  token,
  refreshToken,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: {
        payload: { user: UserData; token: string; refreshToken: string };
      }
    ) => {
      const { user: u, token: t, refreshToken: r } = action.payload;
      state.user = u;
      state.token = t;
      state.refreshToken = r;
      state.isAuthenticated = true;
      localStorage.setItem('token', t);
      localStorage.setItem('refreshToken', r);
      localStorage.setItem('user', JSON.stringify(u));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    setUser: (state, action: { payload: UserData }) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
});

export const { setCredentials, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
