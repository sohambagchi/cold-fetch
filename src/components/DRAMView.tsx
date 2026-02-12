import { useRef, useEffect } from 'react';
import type { CacheEvent, CacheConfig } from '../lib/types';
import { formatHex } from '../lib/utils';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface DRAMViewProps {
    memory: number[];
    config: CacheConfig;
    currentEvent: CacheEvent | null;
}

export function DRAMView({ memory, config, currentEvent }: DRAMViewProps) {
    const activeAddress = currentEvent?.payload?.address;
    const isAccessing = currentEvent?.type === 'FETCH_DRAM' || currentEvent?.type === 'WRITE_BACK' || currentEvent?.type === 'unallocated-write';

    const scrollRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    useEffect(() => {
        if (activeAddress !== undefined && rowRefs.current.has(activeAddress)) {
            rowRefs.current.get(activeAddress)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeAddress]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-[672px]">
            <h2 className="text-xl font-bold mb-4">Main Memory (DRAM)</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar" ref={scrollRef}>
                {memory.map((value, address) => (
                    <motion.div
                        key={address}
                        ref={(el) => { if (el) rowRefs.current.set(address, el); else rowRefs.current.delete(address); }}
                        initial={false}
                        animate={activeAddress === address && isAccessing ? { backgroundColor: "#4f46e5", scale: 1.05 } : { backgroundColor: "transparent", scale: 1 }}
                        className={clsx(
                            "flex justify-between items-center p-2 rounded border-b border-gray-700 font-mono text-sm",
                            activeAddress === address ? "bg-gray-700" : ""
                        )}
                    >
                        <span className="text-gray-400">0x{formatHex(address, Math.ceil(config.addressWidth / 4))}</span>
                        <span className="text-white font-bold">{value}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
