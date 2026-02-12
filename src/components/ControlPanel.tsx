import type { CacheConfig, CacheEvent } from '../lib/types';
import { Play, Pause, RotateCcw, FastForward, Settings, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlPanelProps {
    config: CacheConfig;
    updateConfig: (cfg: Partial<CacheConfig>) => void;
    onStep: () => void;
    onReset: () => void;
    isProcessing: boolean;
    isPlaying: boolean;
    setIsPlaying: (p: boolean) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (s: number) => void;
    currentEvent: CacheEvent | null;
}

export function ControlPanel({
    config,
    updateConfig,
    onStep,
    onReset,
    isProcessing,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    currentEvent
}: ControlPanelProps) {

    const handlePowerChange = (key: keyof CacheConfig, val: number) => {
        updateConfig({ [key]: val });
    };

    const totalSize = config.setCount * config.associativity * config.blockSize;

    // determine event status visual
    let statusMessage = "Idle";
    let statusColor = "bg-gray-800 border-gray-700 text-gray-500";

    if (currentEvent) {
        switch (currentEvent.type) {
            case 'START':
                statusMessage = "CPU Request";
                statusColor = "bg-white text-gray-900 border-white";
                break;
            case 'CALCULATE_BITS':
                statusMessage = "Decoding Address";
                statusColor = "bg-purple-600 text-white border-purple-500";
                break;
            case 'CHECK_SET':
                statusMessage = "Indexing Set";
                statusColor = "bg-yellow-600 text-white border-yellow-500";
                break;
            case 'CHECK_HIT':
                statusMessage = "Tag Compare";
                statusColor = "bg-orange-600 text-white border-orange-500";
                break;
            case 'HIT':
                statusMessage = "CACHE HIT";
                statusColor = "bg-green-600 text-white border-green-500";
                break;
            case 'MISS':
                statusMessage = "CACHE MISS";
                statusColor = "bg-red-600 text-white border-red-500";
                break;
            case 'FETCH_DRAM':
                statusMessage = "Fetching DRAM";
                statusColor = "bg-blue-600 text-white border-blue-500";
                break;
            case 'WRITE_BACK':
                statusMessage = "Write Back";
                statusColor = "bg-red-800 text-white border-red-700";
                break;
            case 'UPDATE_CACHE':
                statusMessage = "Update Cache";
                statusColor = "bg-green-700 text-white border-green-600";
                break;
            default:
                statusMessage = currentEvent.type;
                statusColor = "bg-gray-700 text-gray-300 border-gray-600";
        }
    }

    return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-md flex flex-wrap gap-4 items-stretch justify-between w-full border border-gray-700">

            {/* Group 1: Playback Controls (Stacked: Buttons Top, Slider Bottom) */}
            <div className="flex flex-col gap-2 border-r border-gray-700 pr-4 min-w-[140px]">
                {/* Buttons Row */}
                <div className="flex justify-between gap-1">
                    <button
                        onClick={onStep}
                        disabled={!isProcessing}
                        className="flex-1 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors flex justify-center"
                        title="Step Forward"
                    >
                        <FastForward size={16} />
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={!isProcessing}
                        className={`flex-1 p-1.5 ${isPlaying ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'} disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors flex justify-center`}
                        title={isPlaying ? "Pause" : "Auto-Play"}
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        onClick={onReset}
                        className="flex-1 p-1.5 bg-red-600 hover:bg-red-500 rounded transition-colors flex justify-center"
                        title="Reset Cache"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>

                {/* Delay Slider Row */}
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-gray-400" />
                    <input
                        type="range"
                        min="100" max="2000" step="100"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="flex-1 accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        title={`Delay: ${playbackSpeed}ms`}
                    />
                </div>
            </div>

            {/* Group 2: Configuration Sliders (Stacked Vertically) */}
            <div className="flex items-center gap-3 border-r border-gray-700 pr-4">
                <div className="flex flex-col gap-1 items-center justify-center text-gray-400 mr-1">
                    <Settings size={16} />
                    <span className="text-[10px] uppercase">Config</span>
                </div>

                <div className="grid grid-cols-1 gap-y-1 w-48">
                    {/* Sets */}
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-gray-500 text-[10px] uppercase">Sets</span>
                        <input
                            type="range"
                            min="0" max="6" step="1"
                            value={Math.log2(config.setCount)}
                            onChange={e => handlePowerChange('setCount', Math.pow(2, parseInt(e.target.value)))}
                            disabled={isProcessing}
                            className="flex-1 accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <span className="w-8 text-right font-mono text-gray-300">{config.setCount}</span>
                    </div>

                    {/* Assoc */}
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-gray-500 text-[10px] uppercase">Ways</span>
                        <input
                            type="range"
                            min="0" max="4" step="1"
                            value={Math.log2(config.associativity)}
                            onChange={e => handlePowerChange('associativity', Math.pow(2, parseInt(e.target.value)))}
                            disabled={isProcessing}
                            className="flex-1 accent-green-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <span className="w-8 text-right font-mono text-gray-300">{config.associativity}</span>
                    </div>

                    {/* Block Size */}
                    <div className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-gray-500 text-[10px] uppercase">Block</span>
                        <input
                            type="range"
                            min="2" max="6" step="1"
                            value={Math.log2(config.blockSize)}
                            onChange={e => handlePowerChange('blockSize', Math.pow(2, parseInt(e.target.value)))}
                            disabled={isProcessing}
                            className="flex-1 accent-purple-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                        />
                        <span className="w-8 text-right font-mono text-gray-300">{config.blockSize}B</span>
                    </div>
                </div>
            </div>

            {/* Group 3: Status Bubble (New!) */}
            <div className="flex-1 flex items-center justify-center min-w-[200px]">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentEvent ? currentEvent.description : 'idle'}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`w-full max-w-sm px-4 py-2 rounded border ${statusColor} shadow-inner flex flex-col items-center justify-center text-center transition-colors duration-300`}
                    >
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80">{statusMessage}</div>
                        {currentEvent ? (
                            <div className="text-sm font-mono truncate w-full" title={currentEvent.description}>
                                {currentEvent.description}
                            </div>
                        ) : (
                            <div className="text-sm italic opacity-50">Ready for next instruction...</div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Group 4: Policies & Info (Stacked compact) */}
            <div className="flex flex-col gap-2 justify-center pl-4 border-l border-gray-700">
                <div className="flex gap-2">
                    {/* Write Policy */}
                    <div className="flex bg-gray-900 rounded p-0.5 border border-gray-700">
                        {['write-back', 'write-through'].map((policy) => (
                            <button
                                key={policy}
                                onClick={() => updateConfig({ writePolicy: policy as 'write-back' | 'write-through' })}
                                className={`px-1.5 py-0.5 text-[14px] uppercase rounded transition-colors ${config.writePolicy === policy
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {policy === 'write-back' ? 'WB' : 'WT'}
                            </button>
                        ))}
                    </div>
                    {/* Alloc Policy */}
                    <div className="flex bg-gray-900 rounded p-0.5 border border-gray-700">
                        {['write-allocate', 'no-write-allocate'].map((policy) => (
                            <button
                                key={policy}
                                onClick={() => updateConfig({ allocationPolicy: policy as 'write-allocate' | 'no-write-allocate' })}
                                className={`px-1.5 py-0.5 text-[10px] uppercase rounded transition-colors ${config.allocationPolicy === policy
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {policy === 'write-allocate' ? 'WA' : 'NW'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between items-center text-[14px] text-gray-400">
                    <span className="uppercase">Capacity:</span>
                    <span className="font-mono text-white ml-2">{totalSize} B</span>
                </div>
            </div>

        </div>
    );
}
