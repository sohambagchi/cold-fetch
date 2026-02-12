import type { CacheConfig } from '../lib/types';
import { Play, Pause, RotateCcw, FastForward, Settings, Activity, Cpu } from 'lucide-react';

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
    setPlaybackSpeed
}: ControlPanelProps) {

    const handlePowerChange = (key: keyof CacheConfig, val: number) => {
        updateConfig({ [key]: val });
    };

    const totalSize = config.setCount * config.associativity * config.blockSize;

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between w-full border border-gray-700">

            {/* Group 1: Playback Controls */}
            <div className="flex items-center gap-4 border-r border-gray-700 pr-6">
                <div className="flex space-x-2">
                    <button
                        onClick={onStep}
                        disabled={!isProcessing}
                        className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        title="Step Forward"
                    >
                        <FastForward size={20} />
                    </button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={!isProcessing}
                        className={`p-2 ${isPlaying ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'} disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors`}
                        title={isPlaying ? "Pause" : "Auto-Play"}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                        onClick={onReset}
                        className="p-2 bg-red-600 hover:bg-red-500 rounded transition-colors"
                        title="Reset Cache"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

                <div className="flex flex-col w-32">
                    <label className="text-xs text-gray-400 flex items-center gap-1">
                        <Activity size={12} /> Delay: {playbackSpeed}ms
                    </label>
                    <input
                        type="range"
                        min="100" max="2000" step="100"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            {/* Group 2: Configuration Sliders */}
            <div className="flex-1 flex flex-wrap gap-6 items-center border-r border-gray-700 pr-6">
                <div className="flex items-center gap-2 text-gray-300 font-semibold mr-2">
                    <Settings size={18} /> <span className="hidden lg:inline">Config</span>
                </div>

                <div className="flex flex-col w-32">
                    <label className="text-xs text-gray-400 flex justify-between">
                        <span>Sets (S)</span> <span className="text-white">{config.setCount}</span>
                    </label>
                    <input
                        type="range"
                        min="0" max="6" step="1"
                        value={Math.log2(config.setCount)}
                        onChange={e => handlePowerChange('setCount', Math.pow(2, parseInt(e.target.value)))}
                        disabled={isProcessing}
                        className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                </div>

                <div className="flex flex-col w-32">
                    <label className="text-xs text-gray-400 flex justify-between">
                        <span>Assoc (E)</span> <span className="text-white">{config.associativity}</span>
                    </label>
                    <input
                        type="range"
                        min="0" max="4" step="1"
                        value={Math.log2(config.associativity)}
                        onChange={e => handlePowerChange('associativity', Math.pow(2, parseInt(e.target.value)))}
                        disabled={isProcessing}
                        className="w-full accent-green-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                </div>

                <div className="flex flex-col w-32">
                    <label className="text-xs text-gray-400 flex justify-between">
                        <span>Block (B)</span> <span className="text-white">{config.blockSize} B</span>
                    </label>
                    <input
                        type="range"
                        min="2" max="6" step="1"
                        value={Math.log2(config.blockSize)}
                        onChange={e => handlePowerChange('blockSize', Math.pow(2, parseInt(e.target.value)))}
                        disabled={isProcessing}
                        className="w-full accent-purple-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                </div>

                <div className="flex flex-col justify-center items-center bg-gray-900 px-3 py-1 rounded border border-gray-700">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Capacity</div>
                    <div className="text-sm font-mono text-white">{totalSize} B</div>
                </div>
            </div>

            {/* Group 3: Policies */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Write Policy</label>
                    <div className="flex bg-gray-900 rounded p-0.5 border border-gray-700">
                        {['write-back', 'write-through'].map((policy) => (
                            <button
                                key={policy}
                                onClick={() => updateConfig({ writePolicy: policy as any })}
                                className={`px-2 py-1 text-xs rounded transition-colors ${config.writePolicy === policy
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {policy === 'write-back' ? 'Back' : 'Thru'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Alloc Policy</label>
                    <div className="flex bg-gray-900 rounded p-0.5 border border-gray-700">
                        {['write-allocate', 'no-write-allocate'].map((policy) => (
                            <button
                                key={policy}
                                onClick={() => updateConfig({ allocationPolicy: policy as any })}
                                className={`px-2 py-1 text-xs rounded transition-colors ${config.allocationPolicy === policy
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {policy === 'write-allocate' ? 'Alloc' : 'No Alloc'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
