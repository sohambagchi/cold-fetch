export type CacheLineState = 'INVALID' | 'VALID' | 'DIRTY';

export interface CacheLine {
    valid: boolean;
    dirty: boolean;
    tag: number;
    data: number | null; // Simulating data as a number or hex string
    lastUsed: number; // For LRU
}

export interface CacheSet {
    ways: CacheLine[];
}

export interface CacheConfig {
    setCount: number;      // Number of sets (S)
    associativity: number; // Ways per set (E)
    blockSize: number;     // Bytes per block (B)
    writePolicy: 'write-through' | 'write-back';
    allocationPolicy: 'write-allocate' | 'no-write-allocate';
    addressWidth: number;
}

export type CacheEventType =
    | 'START'
    | 'CALCULATE_BITS'
    | 'CHECK_SET'
    | 'CHECK_HIT'
    | 'HIT'
    | 'MISS'
    | 'EVICT'
    | 'WRITE_BACK'
    | 'unallocated-write' // for no-allocate
    | 'FETCH_DRAM'
    | 'UPDATE_CACHE'
    | 'UPDATE_LRU';

export interface CacheEvent {
    type: CacheEventType;
    description: string;
    payload?: any;
}

export interface CacheStats {
    hits: number;
    misses: number;
    evictions: number;
}

export interface SimulationState {
    memory: number[]; // Main memory (DRAM)
    cache: CacheSet[];
    config: CacheConfig;
    stats: CacheStats;
    clock: number; // Global clock for LRU
}
