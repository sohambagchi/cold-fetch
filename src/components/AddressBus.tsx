
import { useState } from 'react';
import { calculateAddressBreakdown, formatBinary } from '../lib/utils';
import type { CacheConfig } from '../lib/types';
import { ArrowDown } from 'lucide-react';

interface AddressBusProps {
    config: CacheConfig;
    onAccess: (type: 'READ' | 'WRITE', address: number, data?: number) => void;
    isProcessing: boolean;
}

export function AddressBus({ config, onAccess, isProcessing }: AddressBusProps) {
    const [addressInput, setAddressInput] = useState<string>('0');
    const [dataInput, setDataInput] = useState<string>('0');

    const address = parseInt(addressInput, 16) || 0;
    const breakDown = calculateAddressBreakdown(address, config);

    const handleAccess = (type: 'READ' | 'WRITE') => {
        onAccess(type, address, type === 'WRITE' ? parseInt(dataInput) || 0 : undefined);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <ArrowDown size={20} /> Address Bus
            </h2>

            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Address (Hex)</label>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">0x</span>
                        <input
                            type="text"
                            value={addressInput}
                            onChange={e => setAddressInput(e.target.value)}
                            className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-white w-full font-mono transition-colors"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Data (Dec)</label>
                    <input
                        type="number"
                        value={dataInput}
                        onChange={e => setDataInput(e.target.value)}
                        className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-white w-full font-mono transition-colors"
                    />
                </div>
            </div>

            {/* Bit Breakdown Visualizer */}
            <div className="flex gap-1 text-center text-xs font-mono mt-2">
                <div className="flex-1 bg-yellow-100 dark:bg-yellow-900/50 p-1 rounded border border-yellow-300 dark:border-yellow-700" title="Tag">
                    <div className="text-yellow-700 dark:text-yellow-400 font-bold">{formatBinary(breakDown.tag, breakDown.tagBits)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Tag ({breakDown.tagBits})</div>
                </div>
                <div className="flex-1 bg-green-100 dark:bg-green-900/50 p-1 rounded border border-green-300 dark:border-green-700" title="Index">
                    <div className="text-green-700 dark:text-green-400 font-bold">{formatBinary(breakDown.index, breakDown.indexBits)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Index ({breakDown.indexBits})</div>
                </div>
                <div className="flex-1 bg-blue-100 dark:bg-blue-900/50 p-1 rounded border border-blue-300 dark:border-blue-700" title="Offset">
                    <div className="text-blue-700 dark:text-blue-400 font-bold">{formatBinary(breakDown.offset, breakDown.offsetBits)}</div>
                    <div className="text-gray-500 dark:text-gray-400">Offset ({breakDown.offsetBits})</div>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => handleAccess('READ')}
                    disabled={isProcessing}
                    className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                >
                    READ
                </button>
                <button
                    onClick={() => handleAccess('WRITE')}
                    disabled={isProcessing}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                >
                    WRITE
                </button>
            </div>
        </div>
    );
}
