import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/test.github.io/tools/AnimPSD/', // リポジトリ名を設定
})
