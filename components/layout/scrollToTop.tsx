"use client";

import { useEffect, useState } from "react";
import { ChevronsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollToTop() {
  const [showButton, setShowButton] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      setShowButton(scrollY > 300);

      if (totalHeight > 0) {
        const progress = (scrollY / totalHeight) * 100;
        setScrollPercentage(Math.min(Math.max(progress, 0), 100));
      } else {
        setScrollPercentage(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initialize on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 group flex items-center justify-center"
          aria-label="Scroll to top"
        >
          {/* Progress Ring */}
          <svg className="absolute w-14 h-14 -rotate-90 pointer-events-none">
            <circle
              cx="28"
              cy="28"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-gray-200 dark:text-gray-800"
            />
            <motion.circle
              cx="28"
              cy="28"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              animate={{
                strokeDashoffset:
                  circumference -
                  (circumference * scrollPercentage) / 100,
              }}
              className="text-[#d63031]"
          
            />
          </svg>

          {/* Button Core */}
          <div className="bg-black text-white p-3 rounded-full shadow-xl transition-colors duration-300">
            <ChevronsUp
              size={20}
              className="group-hover:-translate-y-2 group-hover:text-red-400 transition-all duration-300 ease-out"
            />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}