import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Copy manifest, background, and content scripts
        const filesToCopy = ['manifest.json', 'background.js', 'content.js'];
        filesToCopy.forEach(file => {
          try {
            copyFileSync(resolve(__dirname, file), resolve(__dirname, 'dist', file));
          } catch (err) {
            console.warn(`Could not copy ${file}:`, err.message);
          }
        });
        
        // Copy icons directory if it exists
        if (existsSync(resolve(__dirname, 'icons'))) {
          mkdirSync(resolve(__dirname, 'dist', 'icons'), { recursive: true });
          const iconFiles = ['icon16.png', 'icon48.png', 'icon128.png'];
          iconFiles.forEach(file => {
            try {
              const src = resolve(__dirname, 'icons', file);
              if (existsSync(src)) {
                copyFileSync(src, resolve(__dirname, 'dist', 'icons', file));
              }
            } catch (err) {
              console.warn(`Could not copy icon ${file}:`, err.message);
            }
          });
        }
        
        // Fix popup.html - move it and fix paths
        const { readFileSync, writeFileSync } = require('fs');
        const htmlPath = resolve(__dirname, 'dist/src/popup/index.html');
        const targetPath = resolve(__dirname, 'dist/popup.html');
        
        if (existsSync(htmlPath)) {
          let htmlContent = readFileSync(htmlPath, 'utf8');
          // Fix paths to be relative
          htmlContent = htmlContent.replace('src="/popup.js"', 'src="./popup.js"');
          htmlContent = htmlContent.replace('href="/popup.css"', 'href="./popup.css"');
          writeFileSync(targetPath, htmlContent);
          console.log('✓ Created popup.html with fixed paths');
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});

