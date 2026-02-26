import { createSlice } from '@reduxjs/toolkit';
import type { ConsumptionListItem, ConsumptionDetail, DraftInfo, ConsumptionFilter } from '../types';

export interface ConsumptionsState {
  list: ConsumptionListItem[];
  detail: ConsumptionDetail | null;
  draftInfo: DraftInfo | null;
  filters: ConsumptionFilter;
  creatorFilter: string; // фронт-фильтр по создателю (для модератора)
}

const initialState: ConsumptionsState = {
  list: [],
  detail: null,
  draftInfo: null,
  filters: {},
  creatorFilter: '',
};

const consumptionsSlice = createSlice({
  name: 'consumptions',
  initialState,
  reducers: {
    setList: (state, action: { payload: ConsumptionListItem[] }) => {
      state.list = action.payload;
    },
    setDetail: (state, action: { payload: ConsumptionDetail | null }) => {
      state.detail = action.payload;
    },
    setDraftInfo: (state, action: { payload: DraftInfo | null }) => {
      state.draftInfo = action.payload;
    },
    setFilters: (state, action: { payload: Partial<ConsumptionFilter> }) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCreatorFilter: (state, action: { payload: string }) => {
      state.creatorFilter = action.payload;
    },
    clearDraftAndFilters: (state) => {
      state.draftInfo = null;
      state.detail = null;
      state.filters = {};
      state.creatorFilter = '';
    },
  },
});

export const {
  setList,
  setDetail,
  setDraftInfo,
  setFilters,
  setCreatorFilter,
  clearDraftAndFilters,
} = consumptionsSlice.actions;
export default consumptionsSlice.reducer;
