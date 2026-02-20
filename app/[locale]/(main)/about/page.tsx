"use client";

import React from 'react';

export default function AboutPage() {
  const accentColor = "#d63031";

  return (
    <div className="bg-neutral-950 text-neutral-100 min-h-screen font-sans selection:bg-[#d63031] selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[80vh] flex items-center justify-center text-center px-6 overflow-hidden">
        {/* Subtle background texture/gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black opacity-60" />
        
        <div className="relative z-10 max-w-5xl">
          <span className="uppercase tracking-[0.3em] text-sm mb-4 block font-semibold" style={{ color: accentColor }}>
            Reborn Interactive
          </span>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6 leading-none">
            Bringing History <br /> <span className="italic" style={{ color: accentColor }}>Back to Life</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
            We don’t just create games — we <span className="text-white font-medium">recreate moments in time.</span>
          </p>
        </div>
      </section>

      {/* --- MISSION SECTION --- */}
      <section className="py-24 px-6 border-y border-neutral-900 bg-neutral-950">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-8 flex items-center">
              <span className="w-12 h-[2px] mr-4" style={{ backgroundColor: accentColor }}></span>
              Our Mission
            </h2>
            <div className="space-y-6 text-lg text-neutral-300 leading-relaxed">
              <p>
                Reborn Interactive is a visionary video game studio dedicated to bringing history back to life 
                through immersive, cinematic storytelling.
              </p>
              <p>
                Our mission is to transform significant historical eras, events, and legends into interactive 
                experiences that allow players to witness, feel, and relive the past from a cinematic perspective.
              </p>
              <p>
                We believe history is more than dates and facts — it is drama, heroism, conflict, culture, and human emotion.
              </p>
            </div>
          </div>
          <div className="relative p-8 border border-neutral-800 rounded-sm bg-neutral-900/30">
             <p className="italic text-neutral-400 leading-loose">
               "Every project we develop is built with meticulous research, high-quality production design, 
               and storytelling techniques inspired by film-making."
             </p>
          </div>
        </div>
      </section>

      {/* --- WHAT WE DO (GRID) --- */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl font-black uppercase tracking-tighter">What We Do</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {[
              "Historical Cinematic Video Games",
              "Story-Driven Gameplay Experiences",
              "Realistic Environment & Character Design",
              "Film-Quality Visual Production",
              "Immersive Audio & Narrative Design"
            ].map((item, index) => (
              <div key={index} className="group p-10 border border-neutral-800 hover:border-[#d63031] transition-all duration-500 bg-neutral-950">
                <div className="h-1 w-8 mb-6 transition-all duration-500 group-hover:w-full" style={{ backgroundColor: accentColor }}></div>
                <h3 className="text-xl font-bold uppercase tracking-tight leading-snug">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- VISION & PHILOSOPHY --- */}
      <section className="py-32 px-6 text-center max-w-4xl mx-auto">
        <div className="mb-20">
          <h2 className="text-sm uppercase tracking-[0.5em] mb-6 opacity-50">Our Vision</h2>
          <p className="text-2xl md:text-3xl font-light leading-relaxed">
            To become a globally recognized studio that sets a new benchmark in cinematic historical gaming — where <span style={{ color: accentColor }}>education meets entertainment</span>, and history is reborn through interactive storytelling.
          </p>
        </div>

        <div className="pt-20 border-t border-neutral-900">
          <h2 className="text-sm uppercase tracking-[0.5em] mb-10 opacity-50">Our Philosophy</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            {["Authenticity", "Emotion", "Immersion"].map((word, i) => (
              <span key={i} className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
                {word}
              </span>
            ))}
          </div>
          <p className="mt-16 text-xl italic text-neutral-400">
            We create worlds that players don’t just play — <span className="text-white">they live.</span>
          </p>
        </div>
      </section>

    </div>
  );
}