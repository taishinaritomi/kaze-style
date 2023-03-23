import { kazePlugin } from '@kaze-style/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), kazePlugin({ cssLayer: true, swc: true })],
});
