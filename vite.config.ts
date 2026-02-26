import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { api_proxy_addr, dest_root } from './target_config'

/**
 * Базовый путь для GitHub Pages — должен ТОЧНО совпадать с именем репозитория на GitHub.
 * Репозиторий у вас: CCM-frontend → сайт: https://7kooter1st.github.io/CCM-frontend/
 */
const GITHUB_PAGES_BASE = '/CCM-frontend'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isGhPages = mode === 'gh-pages'
  const base = isGhPages ? `${GITHUB_PAGES_BASE}/` : (dest_root || undefined)

  return {
    base: base || undefined,
    define: {
      /* Для HashRouter basename не меняем; base в Vite задаёт путь развёртывания. */
      'import.meta.env.VITE_APP_BASE': JSON.stringify(''),
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: api_proxy_addr,
          changeOrigin: true,
        },
        '/users': {
          target: api_proxy_addr,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: true },
        manifest: {
          name: 'CCM Manager',
          short_name: 'CCM',
          description: 'Consumption Manager — учёт потребления',
          start_url: base || '/',
          display: 'standalone',
          background_color: '#58658C',
          theme_color: '#2B385E',
          orientation: 'portrait-primary',
          icons: [
            { src: `${base || ''}icon-192.png`, type: 'image/png', sizes: '192x192' },
            { src: `${base || ''}icon-512.png`, type: 'image/png', sizes: '512x512' },
          ],
        },
      }),
    ],
  }
})
