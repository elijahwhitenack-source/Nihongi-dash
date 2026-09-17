import { defineConfig } from 'vitest/config';

// Kept separate from vite.config.ts so tests don't spin up the PWA plugin.
// The `._*` exclude keeps macOS AppleDouble sidecar files (this drive is
// exFAT and regenerates them constantly) out of the test run.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/._*'],
    environment: 'node',
  },
});
