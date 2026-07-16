import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTkgMEgwaC0wdjYwaDFWMWg1OHYtMXoiIGZpbGw9IiMzNEQzOTkiIGZpbGwtb3BhY2l0eT0iMC4xNSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-40 pointer-events-none" />

      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 80, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-glow blur-[140px] opacity-70 mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 80, -60, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-emerald-glow blur-[160px] opacity-50 mix-blend-multiply dark:mix-blend-screen"
        />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
