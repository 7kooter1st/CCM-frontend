# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Деплой на GitHub Pages

Репозиторий: **CCM-frontend**. Сборка и публикация:

```bash
npm run deploy
```

**Важно:** открывать приложение нужно только по адресу:

**https://7kooter1st.github.io/CCM-frontend/**

Если открыть `.../consumption-manager/`, сервер отдаёт HTML вместо JS-файлов → в консоли ошибка MIME («text/html»). Это не баг приложения: для GitHub Pages `base` в Vite должен совпадать с именем репозитория (см. методичку), поэтому рабочий URL — только **CCM-frontend**.

**Данные на GitHub Pages:** на статическом хосте нет бэкенда, поэтому по умолчанию приложение показывает демо-данные (mock) без запросов к API и без ошибок 404. Если бэкенд развёрнут отдельно (например на Render, Fly.io или VPS), задайте при сборке переменную `VITE_API_URL` (URL бэкенда без слеша в конце), тогда запросы пойдут на него:

```bash
VITE_API_URL=https://ваш-бэкенд.example.com npm run deploy
```

Или создайте файл `.env.gh-pages` с содержимым `VITE_API_URL=https://...` и запускайте `npm run deploy` как обычно.

**GitHub Pages + локальный бэкенд:** чтобы фронт на Pages получал данные с вашего компьютера (localhost), бэкенд должен работать по **HTTPS** (иначе браузер блокирует mixed content). Создайте `.env.gh-pages` с `VITE_API_URL=https://localhost:8000`, включите HTTPS на бэкенде (например mkcert) и CORS для `https://7kooter1st.github.io`. Пошагово: [DEPLOY_PAGES.md](./DEPLOY_PAGES.md).

**Как применить изменения фронта на GitHub Pages:** после любых правок во фронте выполните `npm run deploy` — сборка и публикация в ветку `gh-pages` произойдут автоматически. Через 1–2 минуты обновите страницу (Ctrl+F5) на https://7kooter1st.github.io/CCM-frontend/.

Подробнее про варианты размещения бэкенда (Render, Fly.io, ngrok, VPS) — см. [BACKEND_DEPLOY.md](./BACKEND_DEPLOY.md).

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
