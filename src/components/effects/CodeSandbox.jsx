import { useState, useRef } from 'react';
import { FiCopy, FiCheck, FiDatabase, FiServer, FiActivity } from 'react-icons/fi';

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
  }
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
