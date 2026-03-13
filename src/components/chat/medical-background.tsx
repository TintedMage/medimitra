"use client";

import { motion } from "motion/react";

export const MedicalBackground = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 text-primary opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(circle at center, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 40%, transparent 100%)",
        }}
      />

      <motion.div
        animate={{
          top: ["-20%", "120%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 h-[10vh] w-full bg-linear-to-b from-transparent via-primary/20 to-transparent"
      />
    </div>
  );
};
