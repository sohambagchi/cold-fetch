import type { CacheSet, CacheConfig, CacheEvent } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { formatHex } from '../lib/utils'; // Implied utility needed: address construction

interface CacheGridProps {
    cache: CacheSet[];
    config: CacheConfig;
    currentEvent: CacheEvent | null;
}

export function CacheGrid({ cache, config: _config, currentEvent }: CacheGridProps) {
    // Determine highlights from event
    const highlightSet = currentEvent?.payload?.setIndex;
    const highlightWay = currentEvent?.payload?.wayIndex;
    // const isMiss = currentEvent?.type === 'MISS';

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md overflow-x-auto">
            <h2 className="text-xl font-bold mb-2">Cache Grid</h2>
            <div className="space-y-1 min-w-max">
                {cache.map((set, setIndex) => (
                    <motion.div
                        key={setIndex}
                        layout
                        className={clsx(
                            "flex gap-4 p-1 rounded transition-colors",
                            highlightSet === setIndex ? "bg-gray-700 ring-2 ring-blue-500" : "bg-gray-900"
                        )}
                    >
                        <div className="w-16 flex-shrink-0 flex items-center justify-center border-r border-gray-700 font-mono text-xs text-gray-400">
                            Set {setIndex}
                        </div>

                        <div className="flex gap-2">
                            <AnimatePresence>
                                {set.ways.map((line, wayIndex) => (
                                    <motion.div
                                        key={wayIndex}
                                        layoutId={`cache-line-${setIndex}-${wayIndex}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className={clsx(
                                            "w-24 h-16 border-2 rounded flex flex-col items-center justify-center p-1 relative",
                                            // Validation Border
                                            line.valid ? (line.dirty ? "border-red-500" : "border-green-500") : "border-gray-700 border-dashed",
                                            // Highlight Active Way
                                            highlightSet === setIndex && highlightWay === wayIndex ? "ring-2 ring-yellow-400 shadow-lg" : ""
                                        )}
                                    >
                                        {!line.valid ? (
                                            <span className="text-gray-600 text-[10px] text-center">Empty</span>
                                        ) : (
                                            <>
                                                <div className="text-[10px] text-gray-400 mb-0.5">Tag: {formatHex(line.tag, 2)}</div>
                                                <div className="font-mono font-bold text-white text-base">
                                                    {line.data !== null ? line.data : '-'}
                                                </div>
                                                <div className="absolute top-1 right-1 flex gap-1">
                                                    {line.dirty && <div className="w-2 h-2 rounded-full bg-red-500" title="Dirty"></div>}
                                                    <div className="w-2 h-2 rounded-full bg-green-500" title="Valid"></div>
                                                </div>
                                                {/* LRU Debug */}
                                                {/* <div className="text-[8px] text-gray-600 absolute bottom-1">{line.lastUsed % 10000}</div> */}
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
