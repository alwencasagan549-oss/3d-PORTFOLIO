import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    process.env.NODE_ENV === 'development' ? basicSsl() : null
  ].filter(Boolean),

  build: {
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap'],
          vendor: ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  assetsInclude: ['**/*.glb', '**/*.fbx']
  // TODO: Add vite-plugin-gltf for compression after npm i
})
