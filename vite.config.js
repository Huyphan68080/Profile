import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import os from 'os';
import { execSync } from 'child_process';

function getNetworkName() {
  try {
    if (process.platform === 'win32') {
      const stdout = execSync('netsh wlan show interfaces', { encoding: 'utf8', timeout: 500 });
      const match = stdout.match(/^\s*SSID\s*:\s*(.+)$/m);
      if (match && match[1]) {
        return match[1].trim();
      }
      
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            return name;
          }
        }
      }
    } else if (process.platform === 'darwin') {
      const stdout = execSync('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I', { encoding: 'utf8', timeout: 500 });
      const match = stdout.match(/^\s*SSID:\s*(.+)$/m);
      if (match && match[1]) return match[1].trim();
    } else if (process.platform === 'linux') {
      const stdout = execSync('iwgetid -r', { encoding: 'utf8', timeout: 500 });
      if (stdout.trim()) return stdout.trim();
    }
  } catch (err) {
    // Ignore errors
  }
  return 'Local Network';
}

function cpuAverage() {
  let totalIdle = 0;
  let totalTick = 0;
  const cpus = os.cpus();
  if (!cpus || cpus.length === 0) return { idle: 0, total: 0 };
  
  for (let i = 0, len = cpus.length; i < len; i++) {
    const cpu = cpus[i];
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

function getCpuUsage() {
  const startMeasure = cpuAverage();
  return new Promise((resolve) => {
    setTimeout(() => {
      const endMeasure = cpuAverage();
      const idleDifference = endMeasure.idle - startMeasure.idle;
      const totalDifference = endMeasure.total - startMeasure.total;
      if (totalDifference === 0) {
        resolve(0);
      } else {
        const percentageCPU = 100 - Math.round((100 * idleDifference) / totalDifference);
        resolve(Math.max(0, Math.min(100, percentageCPU)));
      }
    }, 100);
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'system-diagnostics-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/system-diagnostics') {
            try {
              const totalMem = os.totalmem();
              const freeMem = os.freemem();
              const usedMem = totalMem - freeMem;
              const ramPercentage = Math.round((usedMem / totalMem) * 100);
              
              const cpuPercentage = await getCpuUsage();
              const cpuModel = os.cpus()?.[0]?.model || 'Unknown CPU';
              const totalMemGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
              const netName = getNetworkName();
              
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                cpu: cpuPercentage, 
                ram: ramPercentage,
                cpuModel,
                totalMemGB,
                netName
              }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          } else {
            next();
          }
        });
      }
    }
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/gsap')) {
            return 'gsap-vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion-vendor';
          }
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
