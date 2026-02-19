import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

interface ParallaxSectionProps {
  heading: string;
  desc: string;
  img: string;
  link: string;
  imageLeft: boolean; // Control side-by-side layout
}

const Careers: React.FC = () => {
  return (
    <section className="bg-neutral-950 py-16 lg:py-24 overflow-hidden">
      <div className="max-w-[1700px] mx-auto flex flex-col gap-20 lg:gap-32 px-4">
        {/* Card 1: Image Left, Text Right */}
        <ParallaxSection 
          heading="Elevate Your Future" 
          desc="Join a team of innovators and dreamers. We don't just build products; we build legacies. Explore our open roles today."
          img="/assets/career_home.png"
          link="/news"
          imageLeft={true}
        />
        
        {/* Card 2: Image Right, Text Left */}
        <ParallaxSection 
          heading="Our Culture" 
          desc="Rooted in excellence and driven by purpose. Discover the values that guide every decision we make in our journey."
          img="/assets/career_home1.png"
          link="/about"
          imageLeft={false}
        />
      </div>
    </section>
  );
};

const ParallaxSection: React.FC<ParallaxSectionProps> = ({ 
  heading, desc, img, link, imageLeft 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const smoothProgress: MotionValue<number> = useSpring(scrollYProgress, { 
    stiffness: 40, 
    damping: 15 
  });

  // Parallax Values
  const yBg = useTransform(smoothProgress, [0, 1], ["-10%", "10%"]);
  const yText = useTransform(smoothProgress, [0, 1], ["80px", "-80px"]);
  const scaleImage = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.1, 1.2]);

  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% "}}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Container - flex changes based on imageLeft prop */}
      <div className={`relative flex flex-col ${imageLeft ? "lg:flex-row" : "lg:flex-row-reverse"} items-stretch w-full min-h-[500px] lg:h-[700px] rounded-[3rem] overflow-hidden bg-neutral-900 shadow-2xl border border-white/5`}>
        
        {/* IMAGE SIDE (55% Width) */}
        <div className="px-50 relative w-full lg:w-[55%] h-[350px] lg:h-auto overflow-hidden">
          <motion.div 
            style={{ 
              y: yBg, 
              scale: scaleImage, 
              backgroundImage: `url(${img})` 
            }}
            className="absolute inset-0 bg-cover bg-center will-change-transform"
          />
          {/* Subtle vignette on the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* CONTENT SIDE (45% Width) */}
        <div className="relative w-full lg:w-[45%] flex flex-col justify-center p-8 lg:p-20 z-20">
          <motion.div style={{ y: yText }} className="space-y-8">
            <div className="overflow-hidden">
              <motion.h2 
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-white text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-none"
              >
                {heading.split(' ')[0]} <br />
                <span className="text-red-600 italic">{heading.split(' ').slice(1).join(' ')}</span>
              </motion.h2>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-neutral-400 text-lg lg:text-xl font-light leading-relaxed max-w-md"
            >
              {desc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: imageLeft ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <a 
                href={link}
                className="group relative inline-flex items-center gap-6 px-10 py-5 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs overflow-hidden"
              >
                <span className="relative z-10 transition-colors duration-500 group-hover:text-white">Explore More</span>
                <span className="relative z-10 group-hover:translate-x-2 transition-transform duration-500 group-hover:text-white">→</span>
                <div className="absolute inset-0 bg-red-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Ambient Glow */}
        <div className={`absolute top-1/2 -translate-y-1/2 ${imageLeft ? "right-0" : "left-0"} w-64 h-64 bg-red-600/10 blur-[100px] pointer-events-none rounded-full`} />
      </div>
    </motion.div>
  );
};

export default Careers;