import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function versionGeneratorPlugin(): Plugin {
  return {
    name: 'version-generator-plugin',
    buildStart() {
      const buildTimestamp = Date.now();
      const versionData = {
        version: `${buildTimestamp}`,
        builtAt: new Date().toISOString()
      };
      const publicDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(publicDir, 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
    }
  };
}

export default defineConfig(() => {
  const currentBuildTime = Date.now();
  return {
    define: {
      __APP_BUILD_TIME__: JSON.stringify(`${currentBuildTime}`),
    },
    plugins: [react(), tailwindcss(), versionGeneratorPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
