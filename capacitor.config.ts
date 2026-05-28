import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'ReactApp',
  webDir: 'dist',
  server: {
    cleartext: true
  }
};

export default config;
