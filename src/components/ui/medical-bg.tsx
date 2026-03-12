"use client";
import { motion } from "motion/react";

export const MedicalBackground = () => {
  return (
    // FIXED: Removed `bg-background` and enforced `z-0` so it sits behind text.
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      
      {/* 1. The Diagnostic Grid - Fades out at the edges for a cleaner look */}
      <div 
        className="absolute inset-0 opacity-[0.10]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, #10b981 1px, transparent 1px),
            linear-gradient(to bottom, #10b981 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          // Premium UI Trick: Fades the grid away at the edges of the screen
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }} 
      />

      {/* 2. Soft "Scanner Beam" Gradient - Much smoother than a single line */}
      <motion.div
        animate={{ 
          top: ["-20%", "120%"],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute left-0 w-full h-[10vh] bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent"
      />

    

    </div>
  );
};