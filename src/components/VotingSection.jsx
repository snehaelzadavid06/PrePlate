import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { useCanteen } from '../context/CanteenContext';

const VotingSection = () => {
    const { pollItems, voteItem } = useCanteen();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-4 mt-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20"
        >
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-bold text-white">Vote for Tomorrow 🗳️</h3>
                    <p className="text-xs text-gray-400">Help us decide the menu!</p>
                </div>
            </div>

            <div className="space-y-3">
                {pollItems.map((item, idx) => (
                    <div key={item.id || idx} className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                        <span className="text-sm text-gray-200">{item.name}</span>
                        <button
                            onClick={() => voteItem(item.id)}
                            className="flex items-center gap-1 text-xs bg-white/5 hover:bg-primary hover:text-black px-2 py-1 rounded transition-colors group"
                        >
                            <ThumbsUp size={12} className="group-hover:scale-110 transition-transform" />
                            <span>{item.votes}</span>
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default VotingSection;
