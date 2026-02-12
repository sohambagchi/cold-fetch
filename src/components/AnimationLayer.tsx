import type { CacheEvent } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimationLayerProps {
    currentEvent: CacheEvent | null;
}

export function AnimationLayer({ currentEvent }: AnimationLayerProps) {
    if (!currentEvent) return null;

    // Simple layout-independent animations based on event type
    // We'll place a packet in the center or move it across the screen abstractly
    // Real geometric travel requires coordinates, which is hard.
    // Instead, we show a large "Action Packet" in the center or relevant area.

    let message = "";
    let color = "bg-blue-500";
    let textColor = "text-white";

    switch (currentEvent.type) {
        case 'START':
            message = "CPU Request";
            color = "bg-white";
            textColor = "text-gray-900";
            break;
        case 'CALCULATE_BITS':
            message = "Decoding Address";
            color = "bg-purple-500";
            break;
        case 'CHECK_SET':
            message = "Indexing Set";
            color = "bg-yellow-500";
            textColor = "text-gray-900";
            break;
        case 'CHECK_HIT':
            message = "Tag Compare";
            color = "bg-orange-500";
            break;
        case 'HIT':
            message = "CACHE HIT";
            color = "bg-green-500";
            break;
        case 'MISS':
            message = "CACHE MISS";
            color = "bg-red-500";
            break;
        case 'FETCH_DRAM':
            message = "Fetching from DRAM";
            color = "bg-blue-600";
            break;
        case 'WRITE_BACK':
            message = "Writing Back to DRAM";
            color = "bg-red-700";
            break;
        case 'UPDATE_CACHE':
            message = "Updating Cache Line";
            color = "bg-green-600";
            break;
        default:
            message = currentEvent.type;
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentEvent.description} // Re-animate on description change
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className={`px-6 py-3 rounded-full shadow-xl ${color} ${textColor} font-bold text-lg border-2 border-white/20 backdrop-blur-sm`}
                >
                    {message}: {currentEvent.description}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
