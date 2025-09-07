import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    // Create plugins array with proper typing
    const plugins = [
        react(),
        tsconfigPaths(),
        {
            ...visualizer({
                open: true,
                filename: 'dist/stats.html',
            }),
            // Add type assertion to handle the visualizer plugin
            name: 'rollup-plugin-visualizer',
        },
    ];
    if (isProduction) {
        plugins.push(VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'Tinder for Work',
                short_name: 'T4W',
                description: 'Find your next job opportunity',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: '/android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }));
    }
    return {
        plugins,
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        build: {
            outDir: 'dist',
            emptyOutDir: true,
            sourcemap: isProduction ? 'hidden' : true,
            chunkSizeWarningLimit: 2000,
            minify: isProduction ? 'esbuild' : false,
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        if (id.includes('node_modules')) {
                            if (id.includes('@radix-ui'))
                                return 'radix';
                            if (id.includes('firebase'))
                                return 'firebase';
                            if (id.includes('date-fns') || id.includes('date-fns'))
                                return 'date';
                            return 'vendor';
                        }
                    }
                },
                external: [
                    /^@radix-ui\/.*/,
                    'class-variance-authority',
                    'clsx',
                    'tailwind-merge',
                    'lucide-react',
                    'date-fns',
                    'react-day-picker',
                    'react-hook-form',
                    'sonner',
                    'vaul'
                ]
            },
        },
        server: {
            port: 3000,
            open: true,
        },
        preview: {
            port: 3000,
            strictPort: true,
        },
    };
});
