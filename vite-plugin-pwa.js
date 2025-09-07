import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      // Basic PWA configuration
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'safari-pinned-tab.svg',
        'sitemap.xml',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'offline.html'
      ],
      
      // Manifest configuration
      manifest: {
        name: 'Tinder for Work',
        short_name: 'T4W',
        description: 'Find your next career match with Tinder for Work',
        theme_color: '#ff4b4b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        prefer_related_applications: false,
        
        // Icons configuration
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'monochrome'
          }
        ],
        
        // Screenshots for app store
        screenshots: [
          {
            src: 'screenshots/home.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Tinder for Work Home Screen'
          },
          {
            src: 'screenshots/matches.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'View Your Matches'
          }
        ],
        
        // App shortcuts
        shortcuts: [
          {
            name: 'Find Jobs',
            short_name: 'Jobs',
            description: 'Browse available job opportunities',
            url: '/jobs',
            icons: [{ src: 'icons/briefcase-192.png', sizes: '192x192' }]
          },
          {
            name: 'My Profile',
            short_name: 'Profile',
            description: 'View and edit your profile',
            url: '/profile',
            icons: [{ src: 'icons/user-192.png', sizes: '192x192' }]
          },
          {
            name: 'Messages',
            short_name: 'Chat',
            description: 'View your messages',
            url: '/messages',
            icons: [{ src: 'icons/message-192.png', sizes: '192x192' }]
          }
        ]
      },
      
      // Workbox configuration
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,json}'],
        
        // Skip waiting for service worker updates
        skipWaiting: true,
        clientsClaim: true,
        
        // Offline fallback
        navigateFallback: '/offline.html',
        
        // Runtime caching rules
        runtimeCaching: [
          // Cache Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          
          // Cache API responses
          {
            urlPattern: /^https?:\/\/api\.yourdomain\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          
          // Cache images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      
      // Development options
      devOptions: {
        enabled: process.env.NODE_ENV !== 'production',
        type: 'module',
        navigateFallback: 'index.html',
        suppressWarnings: true,
        disableRuntimeConfig: false
      },
      
      // Build options
      build: {
        // Generate service worker in the root directory
        outDir: 'dist',
        // Generate source maps in production for better error tracking
        sourcemap: process.env.NODE_ENV !== 'production',
        // Minify the output
        minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Disable reporting compressed size
        reportCompressedSize: false,
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Rollup options
        rollupOptions: {
          output: {
            // Split vendor and app code
            manualChunks: {
              react: ['react', 'react-dom', 'react-router-dom'],
              vendor: ['lodash', 'date-fns', 'classnames'],
              firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
              ui: ['@radix-ui/react-*']
            },
            // Configure file names for better caching
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name?.split('.');
              const ext = info?.[info.length - 1];
              if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
                return 'assets/images/[name]-[hash][extname]';
              }
              if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
                return 'assets/fonts/[name]-[hash][extname]';
              }
              return `assets/${ext}/[name]-[hash][extname]`;
            }
          }
        },
        // Terser options for production
        terserOptions: process.env.NODE_ENV === 'production' ? {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        } : undefined
      }
    })
  ]
});
