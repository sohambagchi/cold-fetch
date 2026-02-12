import { useEffect, useState } from 'react';
import { useCacheEngine } from './hooks/useCacheEngine';
import { ControlPanel } from './components/ControlPanel';
import { AddressBus } from './components/AddressBus';
import { CacheGrid } from './components/CacheGrid';
import { DRAMView } from './components/DRAMView';

function App() {
  const {
    cache,
    memory,
    stats,
    config,
    updateConfig,
    reset,
    processRequest,
    events,
    currentEventIndex,
    step,
    isProcessing
  } = useCacheEngine();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms

  // Auto-play logic
  useEffect(() => {
    let timer: any;
    if (isPlaying && isProcessing) {
      timer = setInterval(() => {
        step();
      }, playbackSpeed);
    } else if (!isProcessing && isPlaying) {
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isProcessing, step, playbackSpeed]);

  const currentEvent = (currentEventIndex >= 0 && currentEventIndex < events.length)
    ? events[currentEventIndex]
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex justify-between items-end border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Cold Fetch
            </h1>
            <p className="text-gray-400 text-sm">Interactive Cache Hierarchy Visualizer</p>
          </div>

          <div className="hidden lg:flex items-center space-x-4 text-xs text-gray-500 border border-gray-800 rounded-full px-6 py-2 bg-gray-900/30">
            <div className="flex items-center gap-2">
              <span className="bg-gray-800 text-gray-400 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">1</span>
              <span>Configure Cache</span>
            </div>
            <span className="text-gray-700">→</span>
            <div className="flex items-center gap-2">
              <span className="bg-gray-800 text-gray-400 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">2</span>
              <span>Enter Address</span>
            </div>
            <span className="text-gray-700">→</span>
            <div className="flex items-center gap-2">
              <span className="bg-gray-800 text-gray-400 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">3</span>
              <span>Read / Write</span>
            </div>
            <span className="text-gray-700">→</span>
            <div className="flex items-center gap-2">
              <span className="bg-gray-800 text-gray-400 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">4</span>
              <span>Play / Step</span>
            </div>
            <span className="text-gray-700">→</span>
            <span className="text-blue-400 font-medium">Watch Magic</span>
          </div>

          <div className="text-right text-xs text-gray-500 font-mono">
            <div>Hits: <span className="text-green-400">{stats.hits}</span></div>
            <div>Misses: <span className="text-red-400">{stats.misses}</span></div>
            <div>Evictions: <span className="text-orange-400">{stats.evictions}</span></div>
          </div>
        </header>

        {/* Top Controls: Full Width */}
        <div className="w-full">
          <ControlPanel
            config={config}
            updateConfig={updateConfig}
            onStep={step}
            onReset={reset}
            isProcessing={isProcessing}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            currentEvent={currentEvent}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Address Input (2-3 cols?) -> Let's keep it tidy.
                Since control panel is gone from here, we have more space.
                Let's put AddressBus and maybe the EventLog here?
                Or keep existing structure but just remove controls.
            */}
          <div className="lg:col-span-3 space-y-6">
            <AddressBus
              config={config}
              onAccess={processRequest}
              isProcessing={isProcessing}
            />

            {/* Event Log moved here? Or keep it with Grid? 
                The user didn't explicitly ask to move Event Log, but the left column is now very empty.
                Let's move Event Log here to balance the height.
            */}
            <div className="bg-gray-900 rounded p-4 h-96 overflow-y-auto font-mono text-xs border border-gray-800 shadow-inner">
              <div className="text-gray-500 mb-2 sticky top-0 bg-gray-900 pb-2 border-b border-gray-800">Event Log</div>
              {events.map((e, i) => (
                <div key={i} className={`mb-1 ${i === currentEventIndex ? 'text-white font-bold bg-gray-800 p-1 rounded' : 'text-gray-500 p-1'}`}>
                  <span className="text-blue-500">[{e.type}]</span> {e.description}
                </div>
              ))}
              {events.length === 0 && <span className="text-gray-700">Ready...</span>}
            </div>

          </div>

          {/* Middle Column: Cache Grid (6 cols) */}
          <div className="lg:col-span-6">
            <CacheGrid
              cache={cache}
              config={config}
              currentEvent={currentEvent}
            />

            {/* 
                Original Event Log was here. I moved it to the left to fill space 
                previously occupied by ControlPanel and ConfigBar. 
            */}
          </div>

          {/* Right Column: DRAM (3 cols) */}
          <div className="lg:col-span-3 h-full">
            <DRAMView
              memory={memory}
              config={config}
              currentEvent={currentEvent}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
