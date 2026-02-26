/** Сценарий использования (услуга) */
export interface UseCase {
  id: number;
  title: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  image?: string;
  energyConsumption: number;
  consumption?: number;
}

/** Элемент сценария в заявке (ответ бэкенда) */
export interface UseCaseInConsumption {
  id: number;
  name: string;
  description?: string;
  consumption: number;
  image?: string;
  duration: number;
  is_deleted?: boolean;
}

/** Локальный элемент заявки для UI (с минутами) */
export interface ConsumptionItem extends UseCase {
  minutes: number;
}

/** Ответ логина (бэкенд: accesstoken, refreshtoken, user_id, role) */
export interface LoginResponse {
  accesstoken: string;
  refreshtoken: string;
  user_id: number;
  role: number; // 0=User, 1=Moderator
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

/** Данные пользователя */
export interface UserData {
  id: number;
  login: string;
  role: number;
}

/** Ответ регистрации */
export interface RegisterResponse extends UserData {}

/** Черновик: id заявки и количество сценариев */
export interface DraftInfo {
  consumption_id: number;
  use_cases_in_consumption: number;
}

/** Элемент списка заявок */
export interface ConsumptionListItem {
  id: number;
  status: string;
  creator: string;
  created_at: number;
  updated_at: number;
  moderated_at: number;
  moderator: string;
  total_power: number;
  user_id: number;
}

/** Одна заявка (детали) */
export interface ConsumptionDetail {
  id: number;
  total_power: number;
  status: string;
  user_id: number;
  use_cases: UseCaseInConsumption[];
}

/** Фильтр списка заявок (даты в YYYY-MM-DD) */
export interface ConsumptionFilter {
  status?: string;
  start_date?: string;
  end_date?: string;
}
