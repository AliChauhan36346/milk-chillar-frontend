// components/Loader.tsx
'use client';
import { motion } from 'framer-motion';

export default function MilkLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 z-50 flex flex-col items-center justify-center px-4 py-8">
      {/* Main Mobile-Optimized Animation */}
      <div className="flex flex-col items-center gap-8 w-full max-w-xs">
        
        {/* Central Milk Bottle Animation */}
        <div className="relative flex flex-col items-center">
          {/* Floating Milk Drops */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-3 bg-white rounded-full shadow-lg"
                animate={{
                  y: [0, 60],
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
                style={{
                  left: `${-8 + i * 8}px`,
                }}
              />
            ))}
          </div>

          {/* Main Milk Bottle */}
          <motion.div
            className="relative w-20 h-32 bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-lg rounded-b-3xl border-2 border-gray-300 shadow-lg"
            animate={{ 
              y: [0, -4, 0],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Bottle Cap */}
            <motion.div
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-red-500 rounded-t-md border-2 border-red-600"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
              }}
            />
            
            {/* Milk Level Animation */}
            <motion.div
              className="absolute bottom-2 left-2 right-2 bg-gradient-to-t from-white via-blue-50 to-transparent rounded-b-2xl"
              animate={{ 
                height: ['30%', '60%', '85%', '60%', '30%'],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Milk Surface Waves */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-blue-100 rounded-full"
                animate={{
                  scaleX: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            </motion.div>

            {/* Bottle Label */}
            <div className="absolute top-1/3 left-1 right-1 h-12 bg-white/80 rounded-lg flex flex-col items-center justify-center">
              <div className="text-xs font-bold text-blue-600">MILK</div>
              <div className="text-xs text-gray-600">FRESH</div>
            </div>

            {/* Bubbles in milk */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.sin(i) * 5, 0],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                style={{
                  bottom: '20%',
                  left: `${30 + i * 10}%`,
                }}
              />
            ))}
          </motion.div>

          {/* Milk Splash Effect */}
          <motion.div
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            <div className="w-16 h-2 bg-white/60 rounded-full blur-sm" />
          </motion.div>
        </div>

        {/* Mobile-Friendly Progress Ring */}
        <div className="relative w-20 h-20">
          {/* Background Ring */}
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center Icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Simple Text Animation */}
        <div className="text-center space-y-3">
          <motion.h3
            className="text-lg md:text-xl font-bold text-gray-800"
            animate={{
              scale: [1, 1.02, 1],
              color: ['#1f2937', '#3b82f6', '#1f2937']
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Processing Milk Data
          </motion.h3>
          
          {/* Animated Dots */}
          <div className="flex items-center justify-center gap-1">
            <span className="text-blue-600 font-medium">Loading</span>
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                className="text-blue-600 font-bold text-lg"
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [0, -2, 0]
                }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              >
                .
              </motion.span>
            ))}
          </div>
        </div>

        {/* Simple Progress Bar */}
        <div className="w-full max-w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 rounded-full"
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
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-200/40 rounded-full"
            animate={{
              y: [100, -20],
              x: [0, Math.sin(i * 2) * 30],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
            style={{
              left: `${15 + i * 15}%`,
              bottom: '10%',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Enhanced Mobile Small Loader
export function SmallMilkLoader() {
  return (
    <div className="inline-flex items-center justify-center gap-3 p-2">
      {/* Compact Milk Drop */}
      <div className="relative">
        <motion.div
          className="w-4 h-6 bg-gradient-to-b from-blue-100 to-white border border-blue-200 rounded-full rounded-t-full"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity
          }}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-b-full"
            animate={{ 
              height: ['40%', '70%', '40%'],
            }}
            transition={{ 
              duration: 1.8,
              repeat: Infinity,
            }}
          />
        </motion.div>
        
        {/* Tiny floating drop */}
        <motion.div
          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-300 rounded-full"
          animate={{
            y: [0, 8],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
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
          color: ['#2563eb', '#10b981', '#6366f1', '#2563eb'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        Loading...
      </motion.span>
    </div>
  );
}

// Mobile-optimized data processing loader
export function DataProcessingLoader() {
  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full max-w-xs mx-auto">
      {/* Stacked Data Blocks Animation */}
      <div className="flex flex-col gap-1">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"
            animate={{
              width: ['20px', '60px', '40px', '80px', '20px'],
              opacity: [0.3, 1, 0.7, 1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      {/* Compact progress indicator */}
      <div className="flex items-center gap-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
      
      <p className="text-sm text-gray-600 font-medium text-center">Processing data...</p>
    </div>
  );
}