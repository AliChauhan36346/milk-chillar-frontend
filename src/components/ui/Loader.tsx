// components/Loader.tsx
'use client';
import { motion } from 'framer-motion';

export default function MilkLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 z-50 flex flex-col items-center justify-center gap-8">
      {/* Main Animation Container */}
      <div className="relative flex items-end gap-8">
        
        {/* Farm Scene */}
        <div className="flex flex-col items-center gap-4">
          {/* Farmer with Milk Bucket */}
          <motion.div
            className="relative"
            animate={{ 
              y: [0, -3, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Farmer */}
            <div className="w-12 h-16 bg-blue-600 rounded-t-full relative">
              {/* Head */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-orange-200 rounded-full" />
              {/* Hat */}
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-green-600 rounded-full" />
              {/* Arms */}
              <div className="absolute top-2 -left-2 w-4 h-2 bg-orange-200 rounded-full rotate-45" />
              <div className="absolute top-2 -right-2 w-4 h-2 bg-orange-200 rounded-full -rotate-45" />
            </div>
            
            {/* Milk Bucket */}
            <motion.div
              className="absolute top-8 -right-6 w-8 h-6 bg-gray-300 rounded-b-lg border-2 border-gray-400"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Milk in bucket */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-b-md"
                animate={{ 
                  height: ['60%', '80%', '60%'],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              {/* Handle */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-3 border-2 border-gray-400 rounded-t-full bg-transparent" />
            </motion.div>
          </motion.div>
          
          {/* Ground */}
          <div className="w-20 h-2 bg-green-400 rounded-full" />
          <div className="text-xs text-green-700 font-medium">Farmer</div>
        </div>

        {/* Animated Milk Flow */}
        <div className="flex flex-col items-center">
          {/* Milk Drops Animation */}
          <div className="relative h-20 w-4 flex flex-col items-center">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-3 bg-white rounded-full shadow-sm"
                animate={{
                  y: [0, 80],
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                style={{
                  top: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Collection Center */}
        <div className="flex flex-col items-center gap-4">
          {/* Milk Tank */}
          <motion.div
            className="relative w-16 h-20 bg-gradient-to-b from-gray-200 to-gray-300 rounded-lg border-2 border-gray-400"
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Tank Milk Level */}
            <motion.div
              className="absolute bottom-1 left-1 right-1 bg-gradient-to-t from-white to-blue-50 rounded-md"
              animate={{ 
                height: ['20%', '40%', '70%', '40%', '20%'],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Tank Details */}
            <div className="absolute top-2 left-2 right-2 h-1 bg-gray-400 rounded-full" />
            <div className="absolute top-4 left-2 right-2 h-1 bg-gray-400 rounded-full" />
            
            {/* Valve */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-red-500 rounded-sm" />
          </motion.div>
          
          <div className="w-20 h-2 bg-gray-400 rounded-full" />
          <div className="text-xs text-gray-700 font-medium">Collection Center</div>
        </div>

        {/* Transport Arrow */}
        <div className="flex flex-col items-center">
          <motion.div
            className="flex items-center gap-1"
            animate={{ 
              x: [0, 5, 0],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Company/Factory */}
        <div className="flex flex-col items-center gap-4">
          {/* Building */}
          <motion.div
            className="relative w-14 h-16 bg-gradient-to-b from-blue-600 to-blue-700 rounded-t-lg"
            animate={{ 
              y: [0, -2, 0],
            }}
            transition={{ 
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Building Windows */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-300 rounded-sm" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-sm" />
            <div className="absolute top-6 left-2 w-2 h-2 bg-yellow-300 rounded-sm" />
            <div className="absolute top-6 right-2 w-2 h-2 bg-yellow-300 rounded-sm" />
            
            {/* Door */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gray-800 rounded-t-sm" />
            
            {/* Company Sign */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-2 bg-white rounded-full shadow-sm" />
          </motion.div>
          
          <div className="w-20 h-2 bg-gray-600 rounded-full" />
          <div className="text-xs text-blue-700 font-medium">Company</div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-blue-600 rounded-full"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <motion.h3
          className="text-xl font-bold text-gray-800 mb-2"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Connecting Farmers to Markets
        </motion.h3>
        
        <div className="flex items-center justify-center gap-1 text-blue-600 font-medium">
          <motion.span
            animate={{
              color: ['#2563eb', '#10b981', '#2563eb'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            Processing your request
          </motion.span>
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

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-60"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            style={{
              left: `${10 + i * 10}%`,
              top: '80%',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Enhanced Small Loader
export function SmallMilkLoader() {
  return (
    <div className="inline-flex items-center justify-center gap-3">
      {/* Mini Milk Flow */}
      <div className="relative">
        <motion.div
          className="w-4 h-5 border-2 border-blue-300 rounded-b-sm rounded-t-full relative overflow-hidden bg-gradient-to-b from-blue-50 to-white"
          animate={{ 
            rotate: [0, 3, -3, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity
          }}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-blue-100"
            animate={{ 
              height: ['20%', '50%', '80%', '50%', '20%'],
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
            }}
          />
        </motion.div>
        
        {/* Mini drops */}
        <motion.div
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
          animate={{
            y: [0, 8],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      </div>
      
      <motion.span 
        className="text-blue-600 font-medium text-sm"
        animate={{
          color: ['#2563eb', '#10b981', '#2563eb'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        Loading
      </motion.span>
    </div>
  );
}

// Specialized loader for data operations
export function DataProcessingLoader() {
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Data Flow Animation */}
      <div className="flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      <p className="text-sm text-gray-600 font-medium">Processing milk data...</p>
    </div>
  );
}