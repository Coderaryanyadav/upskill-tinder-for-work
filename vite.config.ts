import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

// Security headers configuration
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site'
};

// Content Security Policy configuration
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'img-src': ["'self'"],
  'connect-src': ["'self'"],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'frame-src': ["'self'"],
  'worker-src': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': []
};

// Convert CSP object to header string
const csp = Object.entries(cspDirectives)
  .map(([key, values]) => values.length ? `${key} ${values.join(' ')}` : key)
  .join('; ');

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isAnalyze = process.env.ANALYZE === 'true';

  const config = {
    base: '/',
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        tsDecorators: true,
      }),
      tsconfigPaths(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'robots.txt',
          'apple-touch-icon.png',
          'safari-pinned-tab.svg',
        ],
        manifest: {
          name: 'Tinder for Work',
          short_name: 'T4W',
          description: 'Find your dream job with Tinder for Work',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    server: {
      port: 3000,
      strictPort: true,
      open: !process.env.CI,
      headers: {
        ...securityHeaders,
        'Content-Security-Policy': csp,
      },
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
    build: {
      target: 'esnext',
      minify: isProduction,
      cssMinify: isProduction,
      sourcemap: isProduction ? false : true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor_react';
              }
              if (id.includes('@radix-ui')) {
                return 'vendor_radix';
              }
              if (id.includes('firebase')) {
                return 'vendor_firebase';
              }
              return 'vendor_other';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo: { name?: string }) => {
            if (/\\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(assetInfo.name || '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            if (/\\.css$/i.test(assetInfo.name || '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      esbuildOptions: {
        target: 'esnext',
      },
    },
    esbuild: {
      target: 'esnext',
    },
    logLevel: isProduction ? 'warn' as const : 'info' as const,
    clearScreen: !isProduction,
  };

  // Add bundle analyzer in development
  if (isAnalyze) {
    config.plugins.push(
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }) as any
    );
  }

  return config;
});
