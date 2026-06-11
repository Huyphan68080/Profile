import { useState, useRef, useEffect } from 'react';
import { FiCopy, FiCheck, FiDatabase, FiServer, FiActivity, FiTerminal } from 'react-icons/fi';

const codeFiles = {
  'Server.js': {
    name: 'Server.js',
    icon: FiServer,
    type: 'code',
    raw: `import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();

// Sliding window API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded.' }
});

app.use('/api/v1/telemetry', apiLimiter);

app.listen(8080, () => {
  console.log('API Gateway active.');
});`,
    jsx: (
      <>
        <div><span className="text-purple-600 dark:text-purple-400 font-semibold">import</span> express <span className="text-purple-600 dark:text-purple-400 font-semibold">from</span> <span className="text-emerald-600 dark:text-emerald-400">'express'</span>;</div>
        <div><span className="text-purple-600 dark:text-purple-400 font-semibold">import</span> rateLimit <span className="text-purple-600 dark:text-purple-400 font-semibold">from</span> <span className="text-emerald-600 dark:text-emerald-400">'express-rate-limit'</span>;</div>
        <div className="text-zinc-400 dark:text-zinc-500">// Initialize Server</div>
        <div><span className="text-purple-600 dark:text-purple-400 font-semibold">const</span> app = express();</div>
        <div className="h-3" />
        <div className="text-zinc-400 dark:text-zinc-500">// Sliding window API rate limiter</div>
        <div><span className="text-purple-600 dark:text-purple-400 font-semibold">const</span> apiLimiter = rateLimit(&#123;</div>
        <div>  windowMs: <span className="text-amber-600 dark:text-amber-400">15</span> * <span className="text-amber-600 dark:text-amber-400">60</span> * <span className="text-amber-600 dark:text-amber-400">1000</span>, <span className="text-zinc-400 dark:text-zinc-500">// 15 mins</span></div>
        <div>  max: <span className="text-amber-600 dark:text-amber-400">100</span>, <span className="text-zinc-400 dark:text-zinc-500">// Max requests per window</span></div>
        <div>  standardHeaders: <span className="text-blue-600 dark:text-blue-400">true</span>,</div>
        <div>  legacyHeaders: <span className="text-blue-600 dark:text-blue-400 font-semibold">false</span>,</div>
        <div>  message: &#123; error: <span className="text-emerald-600 dark:text-emerald-400">'Rate limit exceeded.'</span> &#125;</div>
        <div>&#125;);</div>
        <div className="h-3" />
        <div>app.use(<span className="text-emerald-600 dark:text-emerald-400">'/api/v1/telemetry'</span>, apiLimiter);</div>
        <div className="h-3" />
        <div>app.listen(<span className="text-amber-600 dark:text-amber-400">8080</span>, () =&gt; &#123;</div>
        <div>  console.log(<span className="text-emerald-600 dark:text-emerald-400">'API Gateway active.'</span>);</div>
        <div>&#125;);</div>
      </>
    )
  },
  'DB_Model.js': {
    name: 'DB_Model.js',
    icon: FiDatabase,
    type: 'code',
    raw: `import mongoose from 'mongoose';

const visitorLogSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  country: { type: String, default: 'Unknown' },
  provider: { type: String, default: 'Unknown' },
  timezone: { type: String, default: 'Unknown' },
  timestamp: { type: Date, default: Date.now }
});

// Compound indexing for range querying
visitorLogSchema.index({ ip: 1, timestamp: -1 });

export const VisitorLog = mongoose.model('VisitorLog', visitorLogSchema);`,
    jsx: (
      <>
        <div><span className="text-purple-600 dark:text-purple-400 font-semibold">import</span> mongoose <span className="text-purple-600 dark:text-purple-400 font-semibold">from</span> <span className="text-emerald-600 dark:text-emerald-400">'mongoose'</span>;</div>
        <div className="h-3" />
        <div><span className="text-purple-600 dark:text-purple-400 font-semibold">const</span> visitorLogSchema = <span className="text-purple-600 dark:text-purple-400 font-semibold">new</span> mongoose.Schema(&#123;</div>
        <div>  ip: &#123; type: String, required: <span className="text-blue-600 dark:text-blue-400">true</span> &#125;,</div>
        <div>  country: &#123; type: String, default: <span className="text-emerald-600 dark:text-emerald-400">'Unknown'</span> &#125;,</div>
        <div>  provider: &#123; type: String, default: <span className="text-emerald-600 dark:text-emerald-400">'Unknown'</span> &#125;,</div>
        <div>  timezone: &#123; type: String, default: <span className="text-emerald-600 dark:text-emerald-400">'Unknown'</span> &#125;,</div>
        <div>  timestamp: &#123; type: Date, default: Date.now &#125;</div>
        <div>&#125;);</div>
        <div className="h-3" />
        <div className="text-zinc-400 dark:text-zinc-500">// Compound indexing for telemetry range query</div>
        <div>visitorLogSchema.index(&#123; ip: <span className="text-amber-600 dark:text-amber-400">1</span>, timestamp: -<span className="text-amber-600 dark:text-amber-400">1</span> &#125;);</div>
        <div className="h-3" />
        <div><span className="text-purple-600 dark:text-purple-400 font-semibold">export const</span> VisitorLog = mongoose.model(<span className="text-emerald-600 dark:text-emerald-400">'VisitorLog'</span>, visitorLogSchema);</div>
      </>
    )
  },
  'Visualizer.sql': {
    name: 'Schema Visualizer',
    icon: FiActivity,
    type: 'visualizer'
  },
  'Decrypt.sh': {
    name: 'Decryptor',
    icon: FiTerminal,
    type: 'game'
  }
};

const DecryptorGame = () => {
  const [step, setStep] = useState('start'); // start, scan, key, bypass, success, fail
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [markerPos, setMarkerPos] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const logsEndRef = useRef(null);

  const addLog = (text) => {
    setLogs((prev) => {
      const next = [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${text}`];
      return next.slice(-15);
    });
  };

  const startDecoder = () => {
    setStep('scan');
    setLogs([]);
    setAttempts(3);
    setProgress(0);
    startTimeRef.current = Date.now();
    addLog('SYS_INIT: Decryption protocol started.');
    addLog('PORT_CONN: Establishing handshake at localhost...');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5 + Math.floor(Math.random() * 8);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        addLog('PORT_CONN: Handshake secure. Node handshake OK.');
        addLog('FIREWALL: SSL certificate locked. Encryption check required.');
        setTimeout(() => {
          setStep('key');
          addLog('CHALLENGE: Identify key with correct checksum hash (ends with F).');
        }, 600);
      } else {
        setProgress(currentProgress);
        if (currentProgress > 30 && currentProgress < 50 && !logs.some(l => l.includes('Sub-channels'))) {
          addLog(`SYS_SCAN: Mapping hardware network routes... ${currentProgress}%`);
        } else if (currentProgress > 70 && currentProgress < 85 && !logs.some(l => l.includes('Bypassing'))) {
          addLog(`SEC_BYPASS: Injecting memory buffer... ${currentProgress}%`);
        }
      }
    }, 100);
  };

  const handleKeySelect = (key) => {
    if (key.isCorrect) {
      addLog(`CHALLENGE: Key ${key.val} checksum MATCHED. Accessing encryption stack...`);
      setTimeout(() => {
        setStep('bypass');
        addLog('FIREWALL: Connection timeout imminent! Bypass buffer.');
        startBypassOscillator();
      }, 600);
    } else {
      const nextAttempts = attempts - 1;
      setAttempts(nextAttempts);
      addLog(`CHALLENGE: Key ${key.val} checksum FAIL. Alert trigger! (${nextAttempts} lives left).`);
      if (nextAttempts <= 0) {
        setStep('fail');
        addLog('CRITICAL_ERR: Too many failed keys. Firewall locked node.');
      }
    }
  };

  const startBypassOscillator = () => {
    let pos = 0;
    let direction = 1;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      pos += direction * 4.5;
      if (pos >= 100) {
        pos = 100;
        direction = -1;
      } else if (pos <= 0) {
        pos = 0;
        direction = 1;
      }
      setMarkerPos(pos);
    }, 30);
  };

  const handleBypassClick = () => {
    clearInterval(intervalRef.current);
    if (markerPos >= 36 && markerPos <= 64) {
      addLog('FIREWALL: Security protocol overridden! Decoding file...');
      const duration = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
      setTimeElapsed(duration);
      setTimeout(() => {
        setStep('success');
        addLog('ACCESS_GRANTED: File CORE_DATA.enc unlocked successfully.');
      }, 1000);
    } else {
      const nextAttempts = attempts - 1;
      setAttempts(nextAttempts);
      addLog(`FIREWALL_ERR: Offset deviation too high (${Math.abs(50 - markerPos).toFixed(0)}%).`);
      if (nextAttempts <= 0) {
        setStep('fail');
        addLog('CRITICAL_ERR: Bypass buffer overflow. Connection closed.');
      } else {
        startBypassOscillator();
      }
    }
  };

  const resetGame = () => {
    clearInterval(intervalRef.current);
    setStep('start');
    setLogs([]);
  };

  const keys = [
    { val: '0x9B2F', isCorrect: true },
    { val: '0xAC1E', isCorrect: false },
    { val: '0xE58C', isCorrect: false },
    { val: '0x3D72', isCorrect: false },
    { val: '0x7F4A', isCorrect: false },
    { val: '0x6A8D', isCorrect: false }
  ];

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between font-mono text-zinc-800 dark:text-zinc-200">
      <div 
        className="h-16 overflow-y-auto bg-black/40 text-emerald-500/90 dark:text-emerald-400 p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-800/40 text-[9px] leading-relaxed select-none"
        data-lenis-prevent
      >
        {logs.length === 0 ? (
          <div className="text-zinc-400 dark:text-zinc-500">// Terminal standby. Ready for execution.</div>
        ) : (
          logs.map((log, i) => <div key={i}>{log}</div>)
        )}
        <div ref={logsEndRef} />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center mt-2 min-h-[120px] bg-zinc-200/10 dark:bg-zinc-900/10 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 p-2 relative overflow-hidden">
        {step === 'start' && (
          <div className="text-center p-2">
            <h4 className="text-[11px] font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">SYS_DECRYPTOR: ACTIVE</h4>
            <p className="text-[9px] text-zinc-500 mt-1 max-w-[280px] leading-normal">
              Inject buffer overflow payload to bypass SSL lock on <code className="bg-black/5 dark:bg-black/20 px-1 rounded text-red-500">CORE_DATA.enc</code>.
            </p>
            <button
              onClick={startDecoder}
              className="mt-3 px-3 py-1.5 bg-zinc-950 text-white rounded-lg border border-zinc-800 text-[10px] hover:bg-zinc-900 active:scale-95 transition-all duration-150 uppercase tracking-widest font-bold"
            >
              Start Handshake
            </button>
          </div>
        )}

        {step === 'scan' && (
          <div className="w-full max-w-[200px] text-center">
            <div className="text-[10px] text-zinc-600 dark:text-zinc-400 animate-pulse font-bold">TUNNELING BUFFER: {progress}%</div>
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden border border-zinc-300 dark:border-zinc-700/50">
              <div 
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {step === 'key' && (
          <div className="w-full h-full flex flex-col justify-between p-1">
            <div className="flex justify-between items-center text-[9px] border-b border-zinc-200/40 dark:border-zinc-800/40 pb-1 mb-1.5">
              <span className="text-zinc-500 uppercase tracking-wider">CHALLENGE: KEY MATCH</span>
              <span className="text-red-500 font-bold">LIVES: {Array(attempts).fill('⚡').join('')}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 flex-1 items-center justify-center">
              {keys.map((k, i) => (
                <button
                  key={i}
                  onClick={() => handleKeySelect(k)}
                  className="px-2 py-1.5 rounded bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-800 dark:hover:border-zinc-400 text-[9.5px] font-bold text-center active:scale-95 transition-all duration-150"
                >
                  {k.val}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'bypass' && (
          <div className="w-full h-full flex flex-col justify-between p-1">
            <div className="flex justify-between items-center text-[9px] border-b border-zinc-200/40 dark:border-zinc-800/40 pb-1 mb-1.5">
              <span className="text-zinc-500 uppercase tracking-wider">CHALLENGE: FIREWALL BYPASS</span>
              <span className="text-red-500 font-bold">LIVES: {Array(attempts).fill('⚡').join('')}</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center w-full">
              <div className="w-[180px] h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md relative overflow-hidden border border-zinc-300 dark:border-zinc-700/50">
                <div className="absolute inset-y-0 left-[38%] right-[38%] bg-emerald-500/20 border-x border-emerald-500/30" />
                <div 
                  className="absolute inset-y-0 w-1.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"
                  style={{ left: `${markerPos}%`, transform: 'translateX(-50%)' }}
                />
              </div>
              <p className="text-[8px] text-zinc-400 mt-1 text-center font-bold uppercase tracking-wider">Lock at the center zone</p>
              <button
                onClick={handleBypassClick}
                className="mt-2.5 px-3 py-1.5 bg-zinc-950 text-white rounded-lg border border-zinc-800 text-[10px] hover:bg-zinc-900 active:scale-95 transition-all duration-150 uppercase tracking-wider font-bold"
              >
                Trigger Bypass
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center p-1.5">
            <div className="text-emerald-500 font-extrabold text-[12px] uppercase tracking-widest animate-bounce">Access Granted</div>
            <pre className="text-[6.5px] leading-tight text-emerald-500/80 my-1.5 select-none font-bold">
{`   ___ ___   ___  _  _____ ___ 
  / __/ _ \\ / _ \\| |/ /_ _/ __|
 | (_| (_) | (_) | ' < | | (__ 
  \\___\\___/ \\___/|_|\\_\\___\\___|`}
            </pre>
            <div className="text-[8.5px] font-bold text-zinc-700 dark:text-zinc-300">
              Badge: <span className="text-zinc-900 dark:text-white bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[8.5px]">Elite Decryptor</span>
            </div>
            <div className="text-[8px] text-zinc-500 mt-1">Time: {timeElapsed}s | Checksum: Secure</div>
            <button
              onClick={resetGame}
              className="mt-2 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-transparent rounded-lg text-[9px] uppercase tracking-wider"
            >
              Reset Terminal
            </button>
          </div>
        )}

        {step === 'fail' && (
          <div className="text-center p-2">
            <div className="text-red-500 font-extrabold text-[12px] uppercase tracking-widest">Intrusion Alert</div>
            <p className="text-[9px] text-zinc-500 mt-1 max-w-[280px] leading-normal uppercase">
              Terminal Locked. Secure shell connection terminated.
            </p>
            <button
              onClick={resetGame}
              className="mt-3.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white border border-transparent rounded-lg text-[10px] active:scale-95 transition-all duration-150 uppercase tracking-widest font-bold"
            >
              Reboot Terminal
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-[8px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-mono flex items-center justify-between">
        <span>SHELL: DECRYPT.SH</span>
        <span>GATEWAY: 127.0.0.1</span>
      </div>
    </div>
  );
};

const CodeSandbox = () => {
  const [activeTab, setActiveTab] = useState('Server.js');
  const [copied, setCopied] = useState(false);
  const [hoveredTable, setHoveredTable] = useState(null); // 'visitorLogs', 'sessions', 'visitorStats'
  const [hoveredLink, setHoveredLink] = useState(false);

  const handleCopy = () => {
    const rawCode = codeFiles[activeTab]?.raw;
    if (!rawCode) return;
    navigator.clipboard.writeText(rawCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const currentFile = codeFiles[activeTab];

  return (
    <div className="h-full flex flex-col justify-between">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2 mb-3">
        {/* Tabs */}
        <div className="flex gap-1">
          {Object.keys(codeFiles).map((key) => {
            const file = codeFiles[key];
            const Icon = file.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wide uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-950 font-bold shadow-md'
                    : 'text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Icon size={10} className={isActive ? 'text-inherit' : 'text-zinc-500'} />
                {file.name}
              </button>
            );
          })}
        </div>

        {/* Copy button */}
        {currentFile.type === 'code' && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[8.5px] font-mono text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-800/5 hover:bg-zinc-800/10 px-2 py-1 rounded-md border border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-200"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <FiCheck className="text-emerald-500" size={10} />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <FiCopy size={10} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Editor/Visualizer Canvas */}
      <div className="flex-1 overflow-hidden min-h-[170px] relative flex items-center justify-center">
        {currentFile.type === 'code' ? (
          /* Pre-formatted Code Block with Line Numbers */
          <div className="w-full h-full flex overflow-y-auto pr-1" data-lenis-prevent>
            {/* Line numbers */}
            <div className="select-none text-right text-zinc-400 dark:text-zinc-600 font-mono text-[9.5px] pr-2 border-r border-zinc-200/30 dark:border-zinc-800/30 w-7 flex flex-col pt-0.5 leading-relaxed">
              {Array.from({ length: currentFile.raw.split('\n').length }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code Content */}
            <div className="pl-3 font-mono text-[10.5px] leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre overflow-x-auto flex-1 select-text">
              {currentFile.jsx}
            </div>
          </div>
        ) : currentFile.type === 'game' ? (
          /* Interactive Hacking Decryption Game */
          <DecryptorGame />
        ) : (
          /* Database Schema Diagram Visualizer */
          <div className="w-full h-full flex flex-col justify-between">
            {/* Diagram Area */}
            <div className="relative flex-1 flex items-center justify-center bg-zinc-200/10 dark:bg-zinc-900/10 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 p-2 overflow-hidden">
              <svg viewBox="0 0 320 200" className="w-full h-full overflow-visible select-none">
                {/* Connection Line: visitorLogs._id -> sessions.visitorId */}
                <path
                  d="M 110 32 C 140 32, 140 46, 170 46"
                  fill="none"
                  stroke={hoveredLink || hoveredTable === 'visitorLogs' || hoveredTable === 'sessions' ? '#18181b' : 'rgba(24, 24, 27, 0.15)'}
                  strokeWidth={hoveredLink || hoveredTable === 'visitorLogs' || hoveredTable === 'sessions' ? '1.5' : '1.0'}
                  strokeDasharray={hoveredLink ? 'none' : '2, 2'}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredLink(true)}
                  onMouseLeave={() => setHoveredLink(false)}
                />
                
                {/* Table 1: VisitorLogs */}
                <g 
                  className="cursor-pointer transition-transform duration-300"
                  onMouseEnter={() => setHoveredTable('visitorLogs')}
                  onMouseLeave={() => setHoveredTable(null)}
                  transform="translate(10, 10)"
                >
                  <rect 
                    width="100" 
                    height="75" 
                    rx="6" 
                    fill={hoveredTable === 'visitorLogs' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.55)'} 
                    stroke={hoveredTable === 'visitorLogs' ? '#18181b' : 'rgba(24, 24, 27, 0.12)'}
                    strokeWidth="1"
                    className="transition-all duration-300 dark:fill-zinc-800/40 dark:stroke-zinc-700/50"
                  />
                  <text x="50" y="14" textAnchor="middle" className="font-mono text-[7.5px] font-bold fill-zinc-800 dark:fill-zinc-200 uppercase tracking-wider">VisitorLogs</text>
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(24, 24, 27, 0.08)" strokeWidth="0.75" className="dark:stroke-zinc-700/30" />
                  
                  <text x="6" y="32" className="font-mono text-[6.5px] fill-zinc-800 dark:fill-zinc-300 font-semibold">🔑 _id <tspan className="fill-zinc-400 text-[5.5px]">OID</tspan></text>
                  <text x="6" y="44" className="font-mono text-[6.5px] fill-zinc-600 dark:fill-zinc-400">🔹 ip <tspan className="fill-zinc-400 text-[5.5px]">str</tspan></text>
                  <text x="6" y="56" className="font-mono text-[6.5px] fill-zinc-600 dark:fill-zinc-400">🔹 country <tspan className="fill-zinc-400 text-[5.5px]">str</tspan></text>
                  <text x="6" y="68" className="font-mono text-[6.5px] fill-zinc-600 dark:fill-zinc-400">⚡ timestamp <tspan className="fill-zinc-400 text-[5.5px]">date</tspan></text>
                </g>

                {/* Table 2: Sessions */}
                <g 
                  className="cursor-pointer transition-transform duration-300"
                  onMouseEnter={() => setHoveredTable('sessions')}
                  onMouseLeave={() => setHoveredTable(null)}
                  transform="translate(170, 10)"
                >
                  <rect 
                    width="140" 
                    height="75" 
                    rx="6" 
                    fill={hoveredTable === 'sessions' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.55)'} 
                    stroke={hoveredTable === 'sessions' ? '#18181b' : 'rgba(24, 24, 27, 0.12)'}
                    strokeWidth="1"
                    className="transition-all duration-300 dark:fill-zinc-800/40 dark:stroke-zinc-700/50"
                  />
                  <text x="70" y="14" textAnchor="middle" className="font-mono text-[7.5px] font-bold fill-zinc-800 dark:fill-zinc-200 uppercase tracking-wider">Sessions</text>
                  <line x1="0" y1="20" x2="140" y2="20" stroke="rgba(24, 24, 27, 0.08)" strokeWidth="0.75" className="dark:stroke-zinc-700/30" />
                  
                  <text x="6" y="32" className="font-mono text-[6.5px] fill-zinc-800 dark:fill-zinc-300 font-semibold">🔑 _id <tspan className="fill-zinc-400 text-[5.5px]">OID</tspan></text>
                  <text x="6" y="44" className="font-mono text-[6.5px] fill-zinc-800 dark:fill-zinc-300">🔗 visitorId <tspan className="fill-zinc-400 text-[5.5px]">FK (logs)</tspan></text>
                  <text x="6" y="56" className="font-mono text-[6.5px] fill-zinc-600 dark:fill-zinc-400">🔹 token <tspan className="fill-zinc-400 text-[5.5px]">str</tspan></text>
                  <text x="6" y="68" className="font-mono text-[6.5px] fill-zinc-600 dark:fill-zinc-400">🔹 expires <tspan className="fill-zinc-400 text-[5.5px]">date</tspan></text>
                </g>

                {/* Table 3: VisitorStats */}
                <g 
                  className="cursor-pointer transition-transform duration-300"
                  onMouseEnter={() => setHoveredTable('visitorStats')}
                  onMouseLeave={() => setHoveredTable(null)}
                  transform="translate(90, 110)"
                >
                  <rect 
                    width="140" 
                    height="62" 
                    rx="6" 
                    fill={hoveredTable === 'visitorStats' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.55)'} 
                    stroke={hoveredTable === 'visitorStats' ? '#18181b' : 'rgba(24, 24, 27, 0.12)'}
                    strokeWidth="1"
                    className="transition-all duration-300 dark:fill-zinc-800/40 dark:stroke-zinc-700/50"
                  />
                  <text x="70" y="14" textAnchor="middle" className="font-mono text-[7.5px] font-bold fill-zinc-800 dark:fill-zinc-200 uppercase tracking-wider">VisitorStats</text>
                  <line x1="0" y1="20" x2="140" y2="20" stroke="rgba(24, 24, 27, 0.08)" strokeWidth="0.75" className="dark:stroke-zinc-700/30" />
                  
                  <text x="6" y="32" className="font-mono text-[6.5px] fill-zinc-800 dark:fill-zinc-300 font-semibold">🔑 _id <tspan className="fill-zinc-400 text-[5.5px]">OID</tspan></text>
                  <text x="6" y="44" className="font-mono text-[6.5px] fill-zinc-600 dark:fill-zinc-400">🔹 totalViews <tspan className="fill-zinc-400 text-[5.5px]">int</tspan></text>
                  <text x="6" y="54" className="font-mono text-[6.5px] fill-zinc-600 dark:fill-zinc-400">🔹 lastUpdated <tspan className="fill-zinc-400 text-[5.5px]">date</tspan></text>
                </g>
              </svg>

              {/* Float Relation Details on Link Hover */}
              {hoveredLink && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-[7.5px] tracking-wider px-2 py-1 rounded shadow-md pointer-events-none animate-pulse">
                  [ RELATION: 1-TO-MANY via visitorId ]
                </div>
              )}
            </div>

            {/* Visualizer Footer */}
            <div className="mt-2 text-[8px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-mono flex items-center justify-between">
              <span>DB: MONGODB</span>
              <span>SCHEMA_ENG: RELATION_VIRTUAL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeSandbox;
