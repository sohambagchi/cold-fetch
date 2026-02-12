import { useState, useCallback } from 'react';
import type { CacheConfig, CacheSet, CacheStats, CacheEvent } from '../lib/types';
import { calculateAddressBreakdown } from '../lib/utils';

const DEFAULT_CONFIG: CacheConfig = {
    setCount: 4,
    associativity: 4,
    blockSize: 4,
    writePolicy: 'write-back',
    allocationPolicy: 'write-allocate',
    addressWidth: 8, // 8-bit for easier visualization
};

// Initialize empty cache
const createInitialCache = (config: CacheConfig): CacheSet[] => {
    return Array.from({ length: config.setCount }, () => ({
        ways: Array.from({ length: config.associativity }, () => ({
            valid: false,
            dirty: false,
            tag: 0,
            data: null,
            lastUsed: 0,
        })),
    }));
};

// Initialize memory (2^addressWidth bytes)
const createInitialMemory = (addressWidth: number): number[] => {
    // Simple: store 0 or index as value
    const size = Math.pow(2, addressWidth);
    return Array.from({ length: size }, (_, i) => i); // Value = Address initially
};

export function useCacheEngine() {
    const [config, setConfig] = useState<CacheConfig>(DEFAULT_CONFIG);
    const [cache, setCache] = useState<CacheSet[]>(() => createInitialCache(DEFAULT_CONFIG));
    const [memory, setMemory] = useState<number[]>(() => createInitialMemory(DEFAULT_CONFIG.addressWidth));
    const [stats, setStats] = useState<CacheStats>({ hits: 0, misses: 0, evictions: 0 });
    const [events, setEvents] = useState<CacheEvent[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentEventIndex, setCurrentEventIndex] = useState(-1);

    // Helper to deep copy cache for state updates
    const cloneCache = (c: CacheSet[]) => c.map(s => ({ ways: s.ways.map(w => ({ ...w })) }));

    const reset = useCallback(() => {
        setCache(createInitialCache(config));
        setMemory(createInitialMemory(config.addressWidth));
        setStats({ hits: 0, misses: 0, evictions: 0 });
        setEvents([]);
        setCurrentEventIndex(-1);
        setIsProcessing(false);
    }, [config]);

    // Update config and reset
    // Update config and reset
    const updateConfig = useCallback((updates: Partial<CacheConfig>) => {
        const nextConfig = { ...config, ...updates };
        setConfig(nextConfig);

        setCache(createInitialCache(nextConfig));

        // Only reset memory if the address space changes
        if (config.addressWidth !== nextConfig.addressWidth) {
            setMemory(createInitialMemory(nextConfig.addressWidth));
        }

        setStats({ hits: 0, misses: 0, evictions: 0 });
        setEvents([]);
        setCurrentEventIndex(-1);
        setIsProcessing(false);
    }, [config]);

    // Main Logic
    const processRequest = useCallback(async (type: 'READ' | 'WRITE', address: number, data?: number) => {
        if (isProcessing) return;
        setIsProcessing(true);
        const trace: CacheEvent[] = [];
        const { index, tag, offset } = calculateAddressBreakdown(address, config);

        trace.push({ type: 'START', description: `Request: ${type} at Address ${address} (0x${address.toString(16)})` });
        trace.push({
            type: 'CALCULATE_BITS',
            description: `Tag: ${tag}, Index: ${index}, Offset: ${offset}`,
            payload: { tag, index, offset }
        });

        // 1. Check Cache
        trace.push({ type: 'CHECK_SET', description: `Check Set ${index}`, payload: { setIndex: index } });

        // We need working copies to simulate
        // But since we want to animate, we might just record the *intended* changes or apply them step-by-step.
        // Ideally, we run the logic instantly to know the outcome, verify it, then play it back.
        // Or we just build the plan.

        // Let's build a plan based on current state.
        // Note: React state 'cache' is the source of truth.
        const currentCache = cache; // Valid because we are inside callback and dependency 'cache' should be fresh if included
        // But 'cache' in dependency array means function turns over on every render.
        // Use functional state update or refs if we want to avoid re-creating this function?
        // Actually, 'cache' as dependency is fine.

        const set = currentCache[index];
        const wayIndex = set.ways.findIndex(line => line.valid && line.tag === tag);
        const hit = wayIndex !== -1;

        trace.push({ type: 'CHECK_HIT', description: `Checking ways for Tag ${tag}...`, payload: { setIndex: index } });

        if (hit) {
            trace.push({ type: 'HIT', description: `Hit in Set ${index}, Way ${wayIndex}` });
            // LRU Update
            trace.push({ type: 'UPDATE_LRU', description: `Update LRU for Set ${index}, Way ${wayIndex}`, payload: { setIndex: index, wayIndex } });

            if (type === 'WRITE') {
                if (config.writePolicy === 'write-through') {
                    trace.push({ type: 'UPDATE_CACHE', description: `Write to Cache (WT)`, payload: { setIndex: index, wayIndex, data } });
                    trace.push({ type: 'WRITE_BACK', description: `Write Through to Memory`, payload: { address, data } });
                } else {
                    // Write-Back
                    trace.push({ type: 'UPDATE_CACHE', description: `Write to Cache (WB) - Mark Dirty`, payload: { setIndex: index, wayIndex, data, dirty: true } });
                }
            } else {
                // READ Hit - just data available
            }
        } else {
            trace.push({ type: 'MISS', description: `Miss in Set ${index}` });

            // Allocation Logic
            const shouldAllocate = type === 'READ' || config.allocationPolicy === 'write-allocate';

            if (!shouldAllocate) {
                // Write Miss, No-Allocate
                trace.push({ type: 'unallocated-write', description: `Write direct to Memory (No-Allocate)`, payload: { address, data } });
            } else {
                // Need to allocate. Find victim.
                // Find invalid line first
                let victimIndex = set.ways.findIndex(line => !line.valid);
                if (victimIndex === -1) {
                    // LRU Eviction: Find min lastUsed.
                    // We need a global counter or timestamp.
                    // Here we assume lastUsed is a timestamp.
                    // We'll simulate finding the oldest.
                    // In a real hook, we need access to the values.
                    let minLru = Infinity;
                    set.ways.forEach((line, idx) => {
                        if (line.lastUsed < minLru) {
                            minLru = line.lastUsed;
                            victimIndex = idx;
                        }
                    });
                    trace.push({ type: 'EVICT', description: `Evicting Way ${victimIndex} (LRU)`, payload: { setIndex: index, wayIndex: victimIndex } });

                    const victim = set.ways[victimIndex];
                    if (victim.dirty) {
                        // Construct victim address
                        // We need to know how to reconstruct address from tag/index.
                        // Address = (Tag << (indexBits + offsetBits)) | (Index << offsetBits) 
                        // We don't track offset in cache line, usually assumed 0 for block start.
                        const { indexBits, offsetBits } = calculateAddressBreakdown(0, config); // Get widths
                        const victimAddr = (victim.tag << (indexBits + offsetBits)) | (index << offsetBits);
                        trace.push({ type: 'WRITE_BACK', description: `Write Back Dirty Line to Mem 0x${victimAddr.toString(16)}`, payload: { address: victimAddr, data: victim.data } });
                    }
                }

                // Fetch from DRAM
                trace.push({ type: 'FETCH_DRAM', description: `Fetch block from Memory 0x${address.toString(16)}`, payload: { address } });
                trace.push({ type: 'UPDATE_CACHE', description: `Update Cache Set ${index}, Way ${victimIndex}`, payload: { setIndex: index, wayIndex: victimIndex, tag, data: type === 'WRITE' ? data : 0, dirty: type === 'WRITE' && config.writePolicy === 'write-back' } }); // data 0 is placeholder for read
            }
        }

        setEvents(trace);
        setCurrentEventIndex(0); // Start animation
        // We don't update state here; the Step function or Effect will handle state updates based on events.
    }, [cache, config, isProcessing]);

    // Step function to advance animation and apply state
    const step = useCallback(() => {
        if (currentEventIndex === -1 || currentEventIndex >= events.length) {
            setIsProcessing(false);
            setCurrentEventIndex(-1);
            return;
        }

        const event = events[currentEventIndex];
        // Apply logic based on event type
        // This means we need to replicate the logic in 'step' or have 'payload' contain the exact new state?
        // Better: Payload contains the specific delta.

        if (event.type === 'UPDATE_CACHE') {
            setCache(prev => {
                const newCache = cloneCache(prev);
                const { setIndex, wayIndex, tag, data, dirty } = event.payload;
                const line = newCache[setIndex].ways[wayIndex];
                if (tag !== undefined) line.tag = tag;
                if (data !== undefined) line.data = data;
                if (dirty !== undefined) line.dirty = dirty;
                line.valid = true;
                line.lastUsed = Date.now(); // Simple LRU
                return newCache;
            });
        } else if (event.type === 'UPDATE_LRU') {
            setCache(prev => {
                const newCache = cloneCache(prev);
                const { setIndex, wayIndex } = event.payload;
                newCache[setIndex].ways[wayIndex].lastUsed = Date.now();
                return newCache;
            });
        } else if (event.type === 'WRITE_BACK' || event.type === 'unallocated-write') {
            // Update Memory
            // In real sim, we might update a block.
        }

        // Update stats
        if (event.type === 'HIT') setStats(s => ({ ...s, hits: s.hits + 1 }));
        if (event.type === 'MISS') setStats(s => ({ ...s, misses: s.misses + 1 }));
        if (event.type === 'EVICT') setStats(s => ({ ...s, evictions: s.evictions + 1 }));

        setCurrentEventIndex(prev => prev + 1);
    }, [events, currentEventIndex]);

    // Auto-play effect? Or manual step.
    // We'll expose 'step' and maybe 'play' later.

    return {
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
    };
}
