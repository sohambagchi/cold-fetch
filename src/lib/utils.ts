import type { CacheConfig } from './types';

export function getBitRange(num: number, start: number, length: number): number {
    const mask = (1 << length) - 1;
    return (num >> start) & mask;
}

export function formatBinary(num: number, width: number): string {
    return num.toString(2).padStart(width, '0');
}

export function formatHex(num: number, width: number = 2): string {
    return num.toString(16).toUpperCase().padStart(width, '0');
}

export function calculateAddressBreakdown(address: number, config: CacheConfig) {
    // Offset bits = log2(blockSize)
    const offsetBits = Math.log2(config.blockSize);

    // Index bits = log2(setCount)
    const indexBits = Math.log2(config.setCount);

    // Tag bits = remaining
    // Assuming 32-bit address space for simplicity, or configurable
    const tagBits = config.addressWidth - offsetBits - indexBits;

    const offset = getBitRange(address, 0, offsetBits);
    const index = getBitRange(address, offsetBits, indexBits);
    const tag = getBitRange(address, offsetBits + indexBits, tagBits);

    return { offset, index, tag, offsetBits, indexBits, tagBits };
}
