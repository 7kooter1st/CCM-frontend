# Зависимости для Tauri (обязательно установить)

Ошибки вида:
- `failed to run 'cargo metadata' ... No such file or directory (os error 2)`
- `rustc: not installed`, `Cargo: not installed`
- `webkit2gtk-4.1: not installed`, `rsvg2: not installed`

означают, что **нужно установить Rust и системные библиотеки**. Без этого ни `tauri dev`, ни `tauri build` работать не будут.

---

## Ubuntu / Debian (ваш случай)

Выполните команды **по порядку** в терминале.

### 1. Системные пакеты (WebKit, RSVG, компилятор и т.д.)

```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### 2. Rust и Cargo (rustup)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

В интерактивном меню выберите установку по умолчанию (обычно `1` — Proceed with installation).

### 3. Обновить окружение в текущем терминале

После установки rustup выполните (или закройте и откройте терминал заново):

```bash
source "$HOME/.cargo/env"
```

### 4. Проверка

```bash
rustc --version
cargo --version
npm run tauri info
```

В `tauri info` не должно быть красных крестиков (✘) у rustc, Cargo, webkit2gtk-4.1 и rsvg2.

---

После этого можно запускать:

- **Сборка desktop-приложения:**  
  `npm run tauri build`  
  Исполняемый файл будет в `src-tauri/target/release/`.

- **Режим разработки с окном Tauri:**  
  `npm run tauri dev`  
  (предварительно запустите бэкенд и при необходимости поправьте `api_proxy_addr` в `target_config.ts`.)

Подробнее: [TAURI_SETUP.md](./TAURI_SETUP.md).
