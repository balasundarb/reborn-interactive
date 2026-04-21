"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const projects = [
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
  },
  {
    title: "Last Stand",
    category: "Survival Horror",
    image: "/assets/game/3.jpg",
    link: "#",
    color: "#ffa500"
  }
];

const ProjectShowcase = () => {
  return (
    <section className="py-32 bg-[#020202] relative">
      <div className="max-w-7xl mx-auto px-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group relative aspect-16/10 overflow-hidden rounded-2xl bg-white/5 border border-white/10"
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              
              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-[10px] font-mono tracking-[0.5em] text-[#d63031] uppercase mb-2">
                  {project.category}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                  {project.title}
                </h3>
                
                <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <a 
                    href={project.link}
                    className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#d63031] hover:text-white transition-colors duration-300"
                  >
                    View Project
                  </a>
                </div>
              </div>

              {/* Decorative Corners */}
              <div className="absolute top-4 right-4 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 right-0 w-full h-px bg-white/40" />
                <div className="absolute top-0 right-0 h-full w-px bg-white/40" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectShowcase;
