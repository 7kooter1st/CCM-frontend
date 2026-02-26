import type { AppDispatch } from './store';
import { authApi, protectedApi } from '../services/apiClient';
import { setCredentials, logout as logoutAction } from './authSlice';
import {
  setList,
  setDetail,
  setDraftInfo,
  clearDraftAndFilters,
} from './consumptionsSlice';
import { setLoading, setError } from './uiSlice';
import type { ConsumptionFilter } from '../types';

export const loginThunk =
  (login: string, password: string) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const { data } = await authApi.login(login, password);
      dispatch(
        setCredentials({
          user: { id: data.user_id, login: login, role: data.role },
          token: data.accesstoken,
          refreshToken: data.refreshtoken,
        })
      );
      dispatch(setLoading(false));
      return true;
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Ошибка входа'
        : 'Ошибка входа';
      dispatch(setError(message));
      dispatch(setLoading(false));
      return false;
    }
  };

export const registerThunk =
  (login: string, password: string) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      await authApi.register(login, password);
      dispatch(setLoading(false));
      return true;
    } catch (e: unknown) {
      const message = e && typeof e === 'object' && 'response' in e
        ? (e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Ошибка регистрации'
        : 'Ошибка регистрации';
      dispatch(setError(message));
      dispatch(setLoading(false));
      return false;
    }
  };

export const logoutThunk = () => async (dispatch: AppDispatch) => {
  try {
    await protectedApi.logout();
  } catch {
    // ignore
  }
  dispatch(logoutAction());
  dispatch(clearDraftAndFilters());
};

export const fetchConsumptionsThunk =
  (params?: ConsumptionFilter) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const { data } = await protectedApi.getConsumptions(params);
      dispatch(setList(Array.isArray(data) ? data : []));
    } catch {
      dispatch(setList([]));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const fetchDraftThunk = (userId: number) => async (dispatch: AppDispatch): Promise<void> => {
  try {
    const { data } = await protectedApi.getDraft(userId);
    dispatch(setDraftInfo(data));
  } catch {
    dispatch(setDraftInfo(null));
  }
};

export const fetchConsumptionThunk =
  (id: number, userId: number) =>
  async (dispatch: AppDispatch): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const { data } = await protectedApi.getConsumption(id, userId);
      dispatch(setDetail(data));
    } catch {
      dispatch(setDetail(null));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const createConsumptionThunk = (userId: number) => async (dispatch: AppDispatch): Promise<number | null> => {
  dispatch(setLoading(true));
  try {
    const { data } = await protectedApi.createConsumption(userId);
    dispatch(setDraftInfo({ consumption_id: data.consumption_id, use_cases_in_consumption: data.use_cases_in_consumption }));
    dispatch(setLoading(false));
    return data.consumption_id;
  } catch {
    dispatch(setLoading(false));
    return null;
  }
};

export const addUseCaseToDraftThunk =
  (consumptionId: number, useCaseId: number, userId: number) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      await protectedApi.addUseCaseToConsumption(consumptionId, useCaseId, userId);
      await dispatch(fetchDraftThunk(userId));
      await dispatch(fetchConsumptionThunk(consumptionId, userId));
      dispatch(setLoading(false));
      return true;
    } catch {
      dispatch(setLoading(false));
      return false;
    }
  };

export const changeDurationThunk =
  (consumptionId: number, useCaseId: number, duration: number, userId: number) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      await protectedApi.changeUseCaseDuration(consumptionId, useCaseId, duration, userId);
      await dispatch(fetchConsumptionThunk(consumptionId, userId));
      dispatch(setLoading(false));
      return true;
    } catch {
      dispatch(setLoading(false));
      return false;
    }
  };

export const removeUseCaseFromDraftThunk =
  (consumptionId: number, useCaseId: number, userId: number) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      await protectedApi.deleteUseCaseFromConsumption(consumptionId, useCaseId, userId);
      await dispatch(fetchDraftThunk(userId));
      await dispatch(fetchConsumptionThunk(consumptionId, userId));
      dispatch(setLoading(false));
      return true;
    } catch {
      dispatch(setLoading(false));
      return false;
    }
  };

export const formateConsumptionThunk =
  (id: number, userId: number) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      await protectedApi.formateConsumption(id, userId);
      dispatch(setDraftInfo(null));
      dispatch(setDetail(null));
      await dispatch(fetchConsumptionsThunk());
      dispatch(setLoading(false));
      return true;
    } catch {
      dispatch(setLoading(false));
      return false;
    }
  };

export const moderatorActionThunk =
  (consumptionId: number, action: string, moderatorId: number) =>
  async (dispatch: AppDispatch): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      await protectedApi.moderatorAction(consumptionId, action, moderatorId);
      await dispatch(fetchConsumptionsThunk());
      dispatch(setLoading(false));
      return true;
    } catch {
      dispatch(setLoading(false));
      return false;
    }
  };
