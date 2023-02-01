import { kazePlugin } from '@kaze-style/vite-plugin';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid(), kazePlugin(/* { cssLayer: true, swc: true } */)],
});
