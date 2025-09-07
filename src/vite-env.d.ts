/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Type declarations for Vite PWA
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  readonly VITE_VERCEL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declarations for Vite PWA
interface VitePWAOptions {
  registerType?: 'autoUpdate' | 'prompt';
  includeAssets?: string[];
  manifest: {
    name: string;
    short_name: string;
    description: string;
    theme_color: string;
    background_color: string;
    display: string;
    orientation?: string;
    start_url: string;
    scope: string;
    prefer_related_applications?: boolean;
    icons: Array<{
      src: string;
      sizes: string;
      type: string;
      purpose?: string;
    }>;
  };
  workbox?: {
    globPatterns?: string[];
    navigateFallback?: string;
    clientsClaim?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: Array<{
      urlPattern: RegExp;
      handler: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate' | 'NetworkOnly' | 'CacheOnly';
      options?: {
        cacheName?: string;
        expiration?: {
          maxEntries?: number;
          maxAgeSeconds?: number;
        };
        networkTimeoutSeconds?: number;
        cacheableResponse?: {
          statuses?: number[];
        };
      };
    }>;
  };
  devOptions?: {
    enabled?: boolean;
    type?: string;
    navigateFallback?: string;
  };
}
