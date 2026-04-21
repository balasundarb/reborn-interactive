"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Calendar, ChevronRight, Share2, Tag, Filter } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

// --- Types ---
interface NewsArticle {
  id: string;
  title: string;
  category: "Game Update" | "Studio" | "Community";
  date: string;
  description: string;
  image: string;
  isFeatured?: boolean;
}

// --- Dummy Data ---
const NEWS_DATA: NewsArticle[] = [
  {
    id: "1",
    title: "PROJECT 'THROUGH HER EYES' REVEALS NEW ATMOSPHERIC TRAILER",
    category: "Game Update",
    date: "2026-04-15",
    description: "Experience the haunting beauty of our upcoming psychological thriller. The new trailer showcases the soul-binding mechanics and the dynamic lighting engine that brings the father's spirit to life.",
    image: "/assets/game/through her eyes_Bg.png",
    isFeatured: true,
  },
  {
    id: "2",
    title: "THE ART OF STORYTELLING: NARRATIVE DESIGN AT REBORN",
    category: "Studio",
    date: "2026-04-10",
    description: "Go behind the scenes with our lead writers as they discuss the philosophy behind our emotionally-driven gameplay and the research into ancestral myths.",
    image: "/assets/game/1.jpg",
  },
  {
    id: "3",
    title: "COMMUNITY SPOTLIGHT: FAN ART GALLERY",
    category: "Community",
    date: "2026-04-05",
    description: "This month we're celebrating the incredible creativity of our community. From oil paintings to digital 3D models, your vision of our worlds inspires us.",
    image: "/assets/game/2.jpg",
  },
  {
    id: "4",
    title: "ZENITH ENGINE INTEGRATION COMPLETE",
    category: "Game Update",
    date: "2026-03-28",
    description: "We've successfully moved our core development to the Zenith Engine, allowing for hyper-realistic textures and real-time volumetric shadows.",
    image: "/assets/game/3.jpg",
  },
  {
    id: "5",
    title: "JOIN THE ALPHA: CLOSED PLAYTEST REGISTRATION",
    category: "Community",
    date: "2026-03-20",
    description: "Be among the first to step into the shadows. Registration for our first closed alpha playtest is now open for a limited time.",
    image: "/assets/game/through her eyes.png",
  },
  {
    id: "6",
    title: "REBORN INTERACTIVE OPENS NEW TOKYO OFFICE",
    category: "Studio",
    date: "2026-03-12",
    description: "Expanding our global reach to capture unique perspectives and local talent. Our new Tokyo studio will focus on environmental sound design and OST.",
    image: "/assets/game/image.png",
  }
];

const CATEGORIES = ["All", "Game Update", "Studio", "Community"] as const;

export default function NewsPage() {
  const t = useTranslations('GamesPage'); // Using existing namespace for safety, though keys might differ
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredNews = activeCategory === "All" 
    ? NEWS_DATA 
    : NEWS_DATA.filter(n => n.category === activeCategory);

  const featured = NEWS_DATA.find(n => n.isFeatured);

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020202] text-white overflow-hidden selection:bg-red-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Cinzel+Decorative:wght@400;700;900&display=swap');
        
        .font-cinzel { font-family: 'Cinzel Decorative', serif; }
        .font-mono-tech { font-family: 'Share Tech Mono', monospace; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(214, 48, 49, 0.3);
          box-shadow: 0 0 30px rgba(214, 48, 49, 0.1);
        }

        .glitch-text {
          position: relative;
        }

        .glitch-text::before, .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.8;
        }

        .glitch-text:hover::before {
          animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) infinite;
          color: #ff00ff;
          z-index: -1;
        }

        .glitch-text:hover::after {
          animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) reverse infinite;
          color: #00ffff;
          z-index: -2;
        }

        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
      `}</style>

      {/* --- Landing Container Scroll Decorative Hero --- */}
      <section className="relative pt-12 md:pt-20">
        <ContainerScroll
          titleComponent={
            <div className="mb-10 text-center">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono-tech text-[#d63031] text-[10px] md:text-sm tracking-[0.5em] uppercase mb-4 block"
              >
                Data // Transmission // News
              </motion.span>
              <h1 className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter">
                COMM<span className="text-[#d63031]">UNI</span>QUÉ
              </h1>
              <div className="h-[2px] w-40 bg-[#d63031] mx-auto shadow-[0_0_15px_#d63031]" />
            </div>
          }
        >
          {featured && (
            <div className="relative w-full h-full group overflow-hidden">
              <Image 
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#020202] via-[#020202]/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 mb-4"
                >
                  <span className="bg-[#d63031] text-[10px] font-mono-tech px-3 py-1 uppercase tracking-widest rounded-full">
                    Featured
                  </span>
                  <span className="text-white/60 text-xs font-mono-tech flex items-center gap-2">
                    <Calendar size={14} className="text-[#d63031]" />
                    {featured.date}
                  </span>
                </motion.div>
                
                <h2 className="font-cinzel text-3xl md:text-5xl font-bold mb-4 max-w-4xl leading-tight group-hover:text-[#d63031] transition-colors">
                  {featured.title}
                </h2>
                
                <p className="text-white/70 text-sm md:text-lg max-w-2xl mb-8 font-light line-clamp-3">
                  {featured.description}
                </p>
                
                <button className="group/btn flex items-center gap-3 font-mono-tech text-xs tracking-widest uppercase py-3 px-6 bg-white text-black hover:bg-[#d63031] hover:text-white transition-all duration-300 rounded-sm">
                  Decode Full Story
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </ContainerScroll>
      </section>

      {/* --- Filter & Action Bar --- */}
      <section className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Filter size={18} className="text-[#d63031] mr-2" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-mono-tech text-[10px] tracking-widest uppercase px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === cat 
                  ? "bg-white text-black font-bold" 
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-white/30 font-mono-tech text-[10px] tracking-widest">
              Total Logs: {filteredNews.length}
            </span>
          </div>
        </div>
      </section>

      {/* --- News Grid --- */}
      <section className="container mx-auto px-6 pb-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredNews.map((article) => (
              <motion.article
                key={article.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card group flex flex-col h-full rounded-lg overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image 
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/80 backdrop-blur-md text-[10px] font-mono-tech px-3 py-1 border border-white/20 uppercase tracking-widest rounded-sm text-[#d63031]">
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-[#020202] via-transparent to-transparent opacity-60" />
                </div>
                
                <div className="p-8 flex flex-col grow">
                  <div className="flex items-center gap-3 text-white/40 font-mono-tech text-[10px] mb-4">
                    <Calendar size={14} />
                    {article.date}
                  </div>
                  
                  <h3 className="font-cinzel text-xl font-bold mb-4 leading-tight group-hover:text-[#d63031] transition-colors truncate-2-lines">
                    {article.title}
                  </h3>
                  
                  <p className="text-white/50 text-sm font-light mb-8 line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <button className="flex items-center gap-2 font-mono-tech text-[10px] tracking-widest uppercase group/link hover:text-[#d63031] transition-colors">
                      Access File
                      <ChevronRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                    </button>
                    <button className="text-white/30 hover:text-white transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>


      
      {/* Decorative Blur Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#d63031]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#d63031]/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
