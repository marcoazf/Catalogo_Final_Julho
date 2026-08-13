const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 15000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
  testMatch: /.*\.spec\.js/,
  workers: 1
});
