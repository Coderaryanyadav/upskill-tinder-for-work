declare module 'vite-plugin-pwa' {
  import { Plugin } from 'vite';
  
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
        urlPattern: RegExp | string;
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

  export function VitePWA(options?: VitePWAOptions): Plugin[];
  export default VitePWA;
}
