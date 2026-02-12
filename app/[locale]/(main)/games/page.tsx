// app/[locale]/(main)/games/page.tsx
"use client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

export default function GamesPage() {
  const t = useTranslations('GamesPage');
  const text = "COMING SOON";
  
  const characters = text.split("");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const childVariants: Variants = {
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 80,
        mass: 0.5
      },
    },
    hidden: {
      opacity: 0,
      x: -30,
      scale: 0.9,
      filter: "blur(8px)",
    },
  };
  
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Chronicles of Bodhidharma <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                THE LAST ZEN MASTER
              </span>
            </h1>
          </>
        }
      >
        <Image
          src="/game/image.png"
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
      
      <div className="py-20 flex flex-col items-center gap-8">
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-3xl md:text-5xl lg:text-6xl font-black tracking-wider text-center text-gray-900 dark:text-white"
        >
          {characters.map((char, index) => (
            <motion.span 
              key={index} 
              variants={childVariants}
              whileHover={{ 
                scale: 1.15,
                color: "#ff3b30",
                transition: { duration: 0.2 }
              }}
              className="inline-block cursor-default"
              style={{
                textShadow: "0 0 40px rgba(255, 59, 48, 0.2), 0 0 80px rgba(255, 107, 107, 0.15)"
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.8, 
            duration: 0.5,
          }}
          viewport={{ once: true }}
          className="flex items-center gap-3"
        >
          {[0, 0.15, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay
              }}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: i === 0 ? '#ff3b30' : i === 1 ? '#ff6b6b' : '#ff4757',
                boxShadow: `0 0 10px ${i === 0 ? '#ff3b30' : i === 1 ? '#ff6b6b' : '#ff4757'}`
              }}
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 1, 
            duration: 0.6,
          }}
          viewport={{ once: true }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-400 text-center max-w-2xl px-4"
        >
          Something extraordinary is on the horizon. Stay tuned for an epic adventure.
        </motion.p>
      </div>
    </div>
  );
}