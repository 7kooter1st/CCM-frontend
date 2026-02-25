/**
 * Конфигурация для переключения между режимом Tauri (desktop build) и браузер/GitHub Pages.
 * Для Tauri build: target_tauri = true и укажите адрес вашего бэкенда (или ZeroTier IP).
 * Для dev/браузера: target_tauri = false — используется прокси из vite.config.
 */
const target_tauri = true;

/** Адрес бэкенда API (порт 8000). Для локальной разработки — localhost; для Tauri/доступа с другого устройства — IP машины с бэкендом (например 192.168.195.38). */
export const api_proxy_addr = "http://localhost:8000";

/** Базовый URL для API: в Tauri — полный адрес бэкенда с путём /api, в браузере — относительный путь для прокси. */
export const dest_api = target_tauri ? `${api_proxy_addr}/api` : "/api";

/** basename для Router. У вас HashRouter без basename — оставляем "". Для GitHub Pages можно указать имя репозитория. */
export const dest_root = target_tauri ? "" : "";
