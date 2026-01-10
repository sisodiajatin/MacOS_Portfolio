import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '#components': resolve(
        dirname(fileURLToPath(import.meta.url)),
        "src/components"
      ),
      '#constants': resolve(
        dirname(fileURLToPath(import.meta.url)),
        "src/constants"
      ),
      '#store': resolve(
        dirname(fileURLToPath(import.meta.url)),
        "src/store"
      ),
      '#hoc': resolve(
        dirname(fileURLToPath(import.meta.url)),
        "src/components"
      ),
      '#windows': resolve(
        dirname(fileURLToPath(import.meta.url)),
        "src/windows"
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Monaco Editor into its own chunk (loaded on demand)
          'monaco-editor': ['@monaco-editor/react', 'monaco-editor'],
          // Split Three.js / Shader Gradient into its own chunk
          'shader-gradient': ['@shadergradient/react', 'three', '@react-three/fiber'],
          // Split vendor libraries
          'vendor': ['react', 'react-dom', 'zustand', 'gsap'],
        },
      },
    },
  },
});
