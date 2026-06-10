import os from 'os';

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

function getNetworkName() {
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return name;
        }
      }
    }
  } catch (err) {
    // Ignore errors
  }
  return 'Vercel Serverless Network';
}

export default async function handler(req, res) {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramPercentage = Math.round((usedMem / totalMem) * 100);
    
    const cpuPercentage = await getCpuUsage();
    const cpuModel = os.cpus()?.[0]?.model || 'Unknown CPU';
    const totalMemGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
    const netName = getNetworkName();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      cpu: cpuPercentage,
      ram: ramPercentage,
      cpuModel,
      totalMemGB,
      netName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
