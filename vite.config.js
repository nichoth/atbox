import { defineConfig } from 'vite'
import fs from 'node:fs'
import preact from '@preact/preset-vite'
import postcssNesting from 'postcss-nesting'
import cssnanoPlugin from 'cssnano'

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        global: 'globalThis'
    },
    plugins: [
        preact({
            devtoolsInProd: false,
            prefreshEnabled: true,
            babel: {
                sourceMaps: 'both'
            }
        })
    ],
    // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    publicDir: '_public',
    css: {
        postcss: {
            plugins: [
                postcssNesting,
                cssnanoPlugin
            ],
        },
    },
    server: {
        https: {
            key: fs.readFileSync('./key.pem'),
            cert: fs.readFileSync('./cert.pem')
        },
        port: 8888,
        host: 'atbox.test',
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:9999/.netlify/functions',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, ''),
            },
        },
    },
    build: {
        target: 'esnext',
        minify: false,
        outDir: './public',
        emptyOutDir: true,
        sourcemap: 'inline'
    }
})
