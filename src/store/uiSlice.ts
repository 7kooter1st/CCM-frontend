import { createSlice } from '@reduxjs/toolkit';

export interface UiState {
  loading: boolean;
  error: string | null;
}

const initialState: UiState = {
  loading: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: { payload: boolean }) => {
      state.loading = action.payload;
    },
    setError: (state, action: { payload: string | null }) => {
      state.error = action.payload;
    },
  },
});

export const { setLoading, setError } = uiSlice.actions;
export default uiSlice.reducer;
