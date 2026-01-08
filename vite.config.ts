import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Rock Fun project. Uses the React plugin to
// support TSX files and enables fast refresh in development.
export default defineConfig({
  plugins: [react()],
});
