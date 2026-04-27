import { createRequire } from 'node:module'
import path from 'path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const require = createRequire(import.meta.url)

/** Prints a terminal QR (like Expo) when a LAN URL exists so phones on the same Wi‑Fi can open the app. */
function demoQrPlugin(): Plugin {
  return {
    name: 'simplechef-demo-qr',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          const urls = server.resolvedUrls
          const target = urls?.network?.[0] ?? urls?.local?.[0]
          if (!target) return
          try {
            const qrcode = require('qrcode-terminal') as { generate: (url: string, opts?: { small?: boolean }) => void }
            console.log('\n\x1b[36m%s\x1b[0m', '  SimpleChef (Vite) — scan to open in your phone browser (same Wi‑Fi):')
            qrcode.generate(target, { small: true })
            console.log('\x1b[2m%s\x1b[0m\n', `  ${target}`)
            console.log(
              '\x1b[2m%s\x1b[0m',
              '  Tip: set VITE_API_URL in .env to this machine’s LAN API URL (e.g. http://192.168.x.x:8000/api/v1) so the app can reach the backend from a phone.\n'
            )
          } catch {
            /* qrcode-terminal optional at runtime */
          }
        }, 120)
      })
    },
  }
}

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  // Bind 0.0.0.0 so phones on the same Wi‑Fi can open http://<your-pc-ip>:5173 (Expo Go cannot run this stack).
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    demoQrPlugin(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
