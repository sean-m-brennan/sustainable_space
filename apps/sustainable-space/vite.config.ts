import { defineConfig } from 'vite'
import path from "node:path"
import react from '@vitejs/plugin-react-swc'
// @ts-expect-error 'types could not be resolved when respecting package.json "exports"'
import eslint from 'vite-plugin-eslint'
//import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'
import { imagetools } from 'vite-imagetools'

const plugins = [
    react(),
    //libAssetsPlugin(),
    imagetools(),
]
// vite-plugin-eslint is incompatible with turbo
if (process.env.TURBO_HASH === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-argument
    plugins.push(eslint())
}

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "locate-user/": path.resolve(__dirname, "../../packages/locate-user/src/"),
            "repoblog/": path.resolve(__dirname, "../../packages/repoblog/"),
            "space-data-api/": path.resolve(__dirname, "../../packages/space-data-api/src/"),
            "space-sim/": path.resolve(__dirname, "../../packages/space-sim"),
        },
    },
    plugins: plugins,
    base: "/sustainable-space/",
    assetsInclude: ['./public/**/*.md'],
    build: {
        sourcemap: true,
        rollupOptions: {
            /*input: {  // FIXME virtual mpa with preloading behind-the-scenes
                main: path.resolve(__dirname, "index.html"),
                tour: path.resolve(__dirname, "tour.html"),
                explore: path.resolve(__dirname, "explore.html"),
                blog: path.resolve(__dirname, "blog.html"),
                about: path.resolve(__dirname, "about.html"),
            },*/
            /*external: [
                'space-sim/images'
            ],*/
        }
    },
    server: {
        fs: {
            strict: true
        },
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Access-Control-Allow-Origin': 'http://localhost:9988',
        },
        proxy: {
            'space-data-api': {
                target: 'space-data-api.vercel.app',
                //rewrite: (path) => path.replace(/^\/nasa\/eo/, 'https://eoimages.gsfc.nasa.gov'),
                changeOrigin: true,
                secure: false,
                configure: (proxy) => {
                    proxy.on('error', (err) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (_proxyReq, req) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            }
        },
    },
})
