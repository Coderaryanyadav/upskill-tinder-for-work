/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;

  // App Configuration
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_URL: string;
  readonly VITE_APP_DESCRIPTION: string;

  // API & Backend Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCK_API: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string;
  readonly VITE_ENABLE_LOGGING: string;
  readonly VITE_LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';

  // Authentication & OAuth
  readonly VITE_ENABLE_EMAIL_AUTH: string;
  readonly VITE_ENABLE_GOOGLE_AUTH: string;
  readonly VITE_ENABLE_FACEBOOK_AUTH: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_FACEBOOK_APP_ID?: string;
  readonly VITE_AUTH_TOKEN_EXPIRY: string;

  // Performance & Caching
  readonly VITE_ENABLE_SERVICE_WORKER: string;
  readonly VITE_ENABLE_PRECACHING: string;
  readonly VITE_API_CACHE_TTL: string;
  readonly VITE_ASSET_CACHE_TTL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
