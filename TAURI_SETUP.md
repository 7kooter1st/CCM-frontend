# Настройка Tauri для consumption-manager

Приложение настроено для работы в двух режимах:
- **Браузер / GitHub Pages / dev**: `target_tauri = false` в `target_config.ts` — API идёт через прокси Vite на `api_proxy_addr`.
- **Tauri (desktop build)**: `target_tauri = true` в `target_config.ts` — запросы идут напрямую на адрес бэкенда. **По умолчанию проект настроен на режим build.**

---

## Обязательно: установить зависимости (Rust + системные библиотеки)

Без этого команды `npm run tauri dev` и `npm run tauri build` выдают ошибку вида:
`failed to run 'cargo metadata' ... No such file or directory (os error 2)`.

**Пошаговая установка для Ubuntu:** см. **[PREREQUISITES_TAURI.md](./PREREQUISITES_TAURI.md)** — там команды для установки Rust (rustup), webkit2gtk-4.1, rsvg2 и остальных пакетов. После установки перезапустите терминал и выполните:

```bash
npm run tauri info
```

Убедитесь, что в выводе нет красных крестиков (✘) у rustc, Cargo, webkit2gtk-4.1 и rsvg2.

## Шаги для сборки и запуска Tauri

### 1. Режим Tauri dev (с hot-reload)

- В `target_config.ts` оставьте `target_tauri = false` для работы через прокси, либо `target_tauri = true` и укажите `api_proxy_addr` (например `http://192.168.195.38:8000` для ZeroTier).
- Запуск:
```bash
npm run tauri dev
```
Tauri откроет окно и подгрузит фронт с `http://localhost:3000`. В окне приложения: ПКМ → «Проверить» — откроются инструменты разработчика.

### 2. Режим Tauri build (standalone приложение)

1. В **`target_config.ts`**:
   - Установите `target_tauri = true`.
   - Задайте `api_proxy_addr` адресом вашего бэкенда (например `http://192.168.195.38:8000` для ZeroTier или `http://localhost:8000` для локального бэкенда).

2. В **`src-tauri/tauri.conf.json`** (если нужен доступ к бэкенду по IP):
   - В `app.security.csp` в `connect-src` добавьте адрес бэкенда (например `http://192.168.195.38:8000`).

3. В **`src-tauri/capabilities/default.json`**:
   - В блоке `http:default` в `allow` добавьте URL вашего бэкенда (например `{"url": "http://192.168.195.38"}`), чтобы Tauri разрешал запросы к нему.

4. Сборка:
```bash
npm run tauri build
```
Исполняемый файл и установщики появятся в `src-tauri/target/release/` и в подпапках `bundle/`.

### 3. Определение порта Tauri (для диаграммы развёртывания)

1. Запустите собранное Tauri-приложение.
2. В Wireshark выберите интерфейс Loopback, фильтр: `tcp.port == 8000` (порт вашего бэкенда).
3. В приложении выполните действие, вызывающее запрос к API (например загрузка сценариев).
4. В Wireshark откройте пакет GET-запроса и в деталях найдите **Src Port** — это порт, с которого Tauri обращается к бэкенду (его можно указать на диаграмме).

### 4. Открытие приложения с другого устройства (браузер)

- **Фронтенд (интерфейс)** доступен по адресу **http://192.168.195.38:3000** (порт 3000).
- **Бэкенд (API)** — по адресу **http://192.168.195.38:8000** (порт 8000). В браузере с другого устройства открывайте именно **:3000** — это приложение; :8000 — только API.

На машине, где всё запущено:
1. Запустите бэкенд на порту 8000.
2. Запустите фронт: `npm run dev` (Vite слушает на всех интерфейсах, `host: true`).
3. На другом устройстве в той же сети откройте в браузере: **http://192.168.195.38:3000**.

Запросы к API из браузера идут на тот же хост (:3000), прокси Vite перенаправляет их на бэкенд (:8000).

### 5. ZeroTier (опционально)

Если используете ZeroTier для фиксированного IP:

- Установите ZeroTier и подключитесь к своей сети.
- В ZeroTier Central возьмите IP, выданный вашему устройству (например `192.168.195.38`).
- В `target_config.ts` задайте `api_proxy_addr = "http://192.168.195.38:8000"`.
- В `tauri.conf.json` в `build.devUrl` для dev можно указать `http://192.168.195.38:3000`.
- В `tauri.conf.json` в `app.security.csp` и в `capabilities/default.json` в `allow` укажите этот IP (как выше).

## Структура, связанная с Tauri

- **`target_config.ts`** — переключатель Tauri/браузер и адрес API.
- **`src-tauri/`** — конфигурация и код Tauri (Rust).
- **`src/App.tsx`** — вызов `invoke('tauri', { cmd: 'create' })` при монтировании и `cmd: 'close'` при размонтировании (в браузере вызов завершится с «Tauri not launched» — это нормально).
- **`src/services/Api.ts`** — использует `dest_api` из `target_config.ts` для всех запросов к бэкенду.

Методические указания с примером: https://github.com/iu5git/Web/blob/main/tutorials/tauri/README.md
