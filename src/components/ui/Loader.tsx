// components/Loader.tsx
'use client';
import { motion } from 'framer-motion';

export default function MilkLoader() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center gap-6">
      {/* Animated Milk Bottle */}
      <div className="relative w-20 h-24">
        {/* Bottle Outline */}
        <div className="absolute w-full h-full border-4 border-blue-400 rounded-b-lg rounded-t-full" />
        
        {/* Milk Level Animation */}
        <motion.div
          className="absolute bottom-0 left-1 right-1 bg-blue-100 rounded-b-md"
          initial={{ height: 0 }}
          animate={{ 
            height: ['0%', '30%', '70%', '100%', '70%', '30%', '0%'],
            opacity: [0.3, 0.7, 1, 0.7, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ originY: 1 }}
        />
        
        {/* Bottle Neck */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-4 border-l-4 border-r-4 border-t-4 border-blue-400 rounded-t-full" />
      </div>
      
      {/* Loading Text with Animated Dots */}
      <div className="flex items-center gap-1 text-blue-600 font-medium">
        <span>Processing Milk Data</span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
        >
          .
        </motion.span>
      </div>
    </div>
  );
}

// Smaller version for inline loading
export function SmallMilkLoader() {
  return (
    <div className="inline-flex items-center justify-center gap-2">
      <motion.div
        className="w-5 h-6 border-2 border-blue-300 rounded-b-sm rounded-t-full relative overflow-hidden"
        animate={{ 
          rotate: [0, 5, -5, 0],
        }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity
        }}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-blue-100"
          initial={{ height: '10%' }}
          animate={{ 
            height: ['10%', '30%', '60%', '30%', '10%'],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.div>
      <span className="text-blue-600">Loading</span>
    </div>
  );
}