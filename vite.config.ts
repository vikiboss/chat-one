import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: ['chrome89', 'edge89', 'firefox89', 'safari15'],
  },
  plugins: [UnoCSS(), react()],
  define: {
    __WS_URL__: JSON.stringify(process.env.WS_URL),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
