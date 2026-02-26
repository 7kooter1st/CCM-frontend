# Связь фронтенда с бэкендом

## Почему сервер не получает запросы

- **Локально** (`npm run dev`): запросы идут через прокси Vite на `http://localhost:8000`. Убедитесь, что бэкенд запущен на порту 8000 (`target_config.ts` → `api_proxy_addr`).
- **На GitHub Pages**: фронт открыт по `https://7kooter1st.github.io/CCM-frontend/`, а бэкенда на этом домене нет. Поэтому по умолчанию приложение **не шлёт запросы** в интернет (показывает демо-данные), и сервер действительно «не получает запросов».

Чтобы фронт на GitHub Pages общался с бэкендом, бэкенд должен быть доступен по публичному URL, а фронт — собираться с этим URL.

---

## Варианты размещения бэкенда (Go / Gin)

### 1. Локальный запуск (уже есть)

- Запуск бэкенда: `./app` или `go run` на порту 8000.
- Фронт: `npm run dev` → запросы проксируются на `localhost:8000`.
- Подходит для разработки и сдачи лабы на своём компьютере.

### 2. Туннель к локальной машине (ngrok, localtunnel)

- Бэкенд работает у вас на 8000, туннель даёт временный URL в интернет.
- **ngrok**: `ngrok http 8000` → выдаётся URL вида `https://xxxx.ngrok.io`.
- Сборка фронта с этим URL:  
  `VITE_API_URL=https://xxxx.ngrok.io npm run build && npm run deploy`  
  (или задайте `VITE_API_URL` в `.env.gh-pages` и сделайте `npm run deploy`).
- Минус: пока не закрыт туннель и запущен бэкенд, URL может меняться при перезапуске ngrok (на бесплатном плане).

### 3. Бесплатные облака для Go

- **Render** (render.com): можно задеплоить Go-сервис из репозитория, получить URL вида `https://your-app.onrender.com`. В настройках сервиса — Root Directory при необходимости, Build Command и Start Command для Go.
- **Fly.io** (fly.io): `fly launch` в папке с бэкендом, затем `fly deploy`. Дам URL вида `https://your-app.fly.dev`.
- **Railway** (railway.app): импорт репо, выбор папки/бинарника, деплой → выдают URL.

После деплоя:

1. Включите CORS на бэкенде для источника `https://7kooter1st.github.io` (у вас в Gin уже может быть `AllowAllOrigins: true` для разработки — для продакшена лучше ограничить доменом фронта).
2. Соберите фронт с URL бэкенда и задеплойте на GitHub Pages:

```bash
# Пример для Render
VITE_API_URL=https://your-app.onrender.com npm run build:pages
# или создайте .env.gh-pages:
# VITE_API_URL=https://your-app.onrender.com
npm run deploy
```

Тогда с GitHub Pages все запросы (логин, сценарии, заявки) пойдут на ваш облачный бэкенд.

### 4. VPS (VDS)

- Аренда сервера (Timeweb, Selectel, DigitalOcean и т.д.), установка Go, запуск бэкенда за nginx (прокси на порт 8000), при необходимости HTTPS через Let's Encrypt.
- На фронте в `VITE_API_URL` указать `https://ваш-домен.ru` (или IP, если без HTTPS; тогда браузер может блокировать mixed content при открытии фронта по HTTPS).

---

## Итог

| Где фронт        | Где бэкенд   | Что сделать |
|------------------|-------------|-------------|
| Локально (dev)   | localhost   | Запустить бэкенд на 8000, прокси уже настроен |
| GitHub Pages     | Нет в сети  | Работают только демо-данные, запросов к серверу нет |
| GitHub Pages     | ngrok       | Задать `VITE_API_URL` и пересобрать/задеплой фронт |
| GitHub Pages     | Render/Fly  | Задеплоить бэкенд, задать `VITE_API_URL`, CORS, затем `npm run deploy` |

Сообщение «Tauri not launched» в браузере отключено (Tauri вызывается только в десктопном приложении). Favicon задан через data URI, чтобы не было запроса к `https://7kooter1st.github.io/favicon.ico`.
