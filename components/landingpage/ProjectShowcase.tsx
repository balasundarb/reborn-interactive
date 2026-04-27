"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

const projects = [
  {
    title: "Cinematic Character",
    category: "Character Showcase",
    video: "/video/Character.webm",
    image: "/assets/game/through her eyes.png",
    link: "#",
    color: "#d63031"
  },
  {
    title: "Through Her Eyes",
    category: "Narrative Adventure",
    image: "/assets/game/through her eyes.png",
    link: "/games/through-her-eyes",
    color: "#d63031"
  },
  {
    title: "Project Neo",
    category: "Cyberpunk RPG",
    image: "/assets/game/1.jpg",
    link: "#",
    color: "#00ffff"
  },
  {
    title: "Zero Gravity",
    category: "Action Shooter",
    image: "/assets/game/2.jpg",
    link: "#",
    color: "#ff00ff"
  }
];

const ProjectCard = ({ project, index }: { project: any; index: number }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative group aspect-16/11 overflow-hidden rounded-xl bg-neutral-900 border border-white/5 ${
        index % 2 !== 0 ? "md:mt-24" : "" // Stagger effect
      }`}
    >
      {/* Dynamic Background Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-[100px]"
        style={{ background: `radial-gradient(circle, ${project.color} 0%, transparent 70%)` }}
      />

      {project.video ? (
        <video
          src={project.video}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover grayscale-50 group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
        />
      ) : (
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover grayscale-50 group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
        />
      )}

      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-linear-to-t from-[#020202] via-[#020202]/20 to-transparent opacity-80" />

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end" style={{ transform: "translateZ(50px)" }}>
        <div className="overflow-hidden">
          <motion.span 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            className="block text-[10px] font-mono tracking-[0.4em] text-[#d63031] uppercase mb-2"
          >
            {project.category}
          </motion.span>
        </div>
        
        <div className="overflow-hidden">
          <motion.h3 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tighter uppercase font-cinzel"
          >
            {project.title}
          </motion.h3>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href={project.link}
            className="group/btn relative overflow-hidden px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-none transition-all duration-300 hover:text-white"
          >
            <span className="relative z-10">Launch Mission</span>
            <div className="absolute inset-0 bg-[#d63031] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </a>
        </div>
      </div>

      {/* UI Accents - Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size[100%_2px,3px_100%]" />
    </motion.div>
  );
};

const ProjectShowcase = () => {
  return (
    <section className="py-32 bg-[#020202] relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-image-radial-gradient(white,transparent_85%) opacity-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
       <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-6 md:space-y-0">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-4"
            >
              <div className="h-px w-12 bg-[#d63031]" />
              <span className="text-[#d63031] font-mono text-sm tracking-[0.4em] uppercase">Operations</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase font-cinzel">
              Featured <span className="text-white/20">Works</span>
            </h2>
          </div>
          <p className="text-white/40 max-w-sm font-light leading-relaxed">
            Pushing the boundaries of interactive entertainment through cutting-edge technology and immersive storytelling.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-16">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectShowcase;