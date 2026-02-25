"use client";
import React, { useEffect, useRef } from "react";
import { InfoCard } from "@/components/ui/info-card";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ACCENT_RED = "#d63031";

const CARD_DATA = [
  {
    id: "1",
    image: "/assets/team/ajay_rahul.webp",
    name: "Ajay Rahul R",
    designation: "Founder | Game Designer | Creative Director",
    description: "Ajay Rahul is the visionary Founder of Reborn Interactive, a creative force driven by innovation, storytelling, and immersive gameplay experiences. As a Game Designer and Director, he specializes in building worlds inspired by ancient history, mythology, and cinematic narratives — transforming powerful concepts into interactive digital experiences.\n\nWith a deep passion for game mechanics, narrative architecture, and player psychology, Ajay leads projects from concept to execution — shaping every detail from world-building and character design to gameplay systems and creative direction.\n\nHis mission is simple: To create unforgettable gaming experiences that blend history, emotion, and cutting-edge technology.\n\nAt Reborn Interactive, he focuses on:\n• Ancient & Historical Game Development\n• Narrative-Driven Game Design\n• World Building & Lore Creation\n• Creative Direction & Visual Identity\n• Publishing & Strategic Game Development\n\nAjay believes games are not just entertainment — they are interactive stories that shape imagination and culture."
  },
  {
    id: "2",
    image: "/assets/team/snega.webp",
    name: "Snegha R",
    designation: "Co-Founder | Human Resources & Talent Strategist",
    description: "Behind every great studio is a strong foundation of people, culture, and vision. Snegha R, Co-Founder of Reborn Interactive, leads the human resources and organizational development that powers the studio's creative excellence.\n\nShe is responsible for building and nurturing the team that drives innovation across game design, development, and digital production. From talent acquisition and team development to company culture and operational structure, Snegha ensures that Reborn Interactive grows with purpose and unity.\n\nHer leadership focuses on creating an environment where creativity thrives, collaboration is seamless, and every team member is empowered to perform at their highest potential.\n\nWhat She Leads:\n• Talent Acquisition & Team Building\n• Organizational Development\n• Company Culture & Employee Growth\n• Strategic Leadership\n\nLeadership Philosophy: Snegha believes that a studio's greatest asset is its people. Her mission is to cultivate a culture of innovation, discipline, and collaboration — ensuring that Reborn Interactive continues to build powerful gaming experiences driven by passionate creators."
  },
  {
    id: "3",
    image: "/assets/team/balasundar.webp",
    name: "Balasunder B",
    designation: "Visual Designer | UI Architect | Web & Game Developer",
    description: "Balasunder is the creative engine behind the visual identity and digital experiences at Reborn Interactive. Specializing in visual asset creation, UI/UX architecture, website design, and game development, he transforms ideas into immersive and visually compelling digital worlds.\n\nWith a strong eye for detail and design precision, Balasunder crafts high-quality visual assets that define atmosphere, enhance storytelling, and elevate player engagement. From intuitive game interfaces to modern website experiences, his work bridges creativity and functionality.\n\nHe focuses on creating seamless user experiences that not only look powerful but feel effortless.\n\nCore Expertise:\n• Visual Asset Creation & Game Art Integration\n• UI/UX Design for Games & Interactive Platforms\n• Website Design & Development\n• Front-End & Gameplay System Development\n• Digital Branding & Visual Identity\n\nBalasunder believes that great design is not just seen — it is experienced. His mission is to build digital environments that are immersive, intuitive, and unforgettable."
  },
  {
    id: "4",
    image: "/assets/team/shekinah.webp",
    name: "Shekinah Florance M",
    designation: "Backend Engineer | Systems Architect | Game Infrastructure Developer",
    description: "Shekinah Florance M is the backbone of technology at Reborn Interactive, specializing in backend services, APIs, database architecture, and game dashboards. She builds the systems that power seamless gameplay, secure data management, and scalable digital platforms.\n\nWith a strong foundation in system design and performance optimization, Shekinah ensures that every game and platform operates with stability, speed, and reliability. From designing secure APIs to structuring complex databases and analytics dashboards, she transforms technical challenges into efficient solutions.\n\nHer work enables real-time data flow, player management systems, and scalable game infrastructure — forming the foundation behind every immersive experience.\n\nCore Expertise:\n• Backend Services & Server Architecture\n• API Development & System Integration\n• Database Design & Optimization\n• Game Dashboards & Admin Panels\n• Security, Scalability & Performance Engineering\n\nShekinah believes that great digital experiences rely on powerful unseen systems. Her mission is to build robust infrastructure that supports creativity, innovation, and long-term growth."
  },
  {
    id: "5",
    image: "/assets/team/jegan.webp",
    name: "Jegan",
    designation: "3D Artist | VFX Specialist | Roto Artist | Game Developer",
    description: "At Reborn Interactive, visual depth and cinematic intensity come to life through powerful design and technical artistry. Jegan plays a key role in shaping immersive environments, dynamic effects, and high-quality visual assets for games and interactive experiences.\n\nSpecializing in 3D modeling, VFX creation, roto artistry, and game development, he blends creativity with technical precision to craft visually compelling digital worlds. From detailed character models and realistic environments to explosive visual effects and refined compositing, his work enhances storytelling and gameplay immersion.\n\nJegan transforms concepts into visually stunning realities — ensuring every frame, movement, and effect elevates the player experience.\n\nWhat He Creates:\n• 3D Modeling & Asset Development\n• Visual Effects (VFX)\n• Roto & Compositing\n• Game Development Support\n\nCreative Vision: Jegan believes that visuals are more than design — they are emotion in motion. His mission is to push visual boundaries and create immersive, cinematic experiences that captivate players and bring digital worlds to life."
  },
  {
    id: "6",
    image: "/assets/team/vishnu.webp",
    name: "Vishnu",
    designation: "3D Modeler | Animator | Storytelling Artist",
    description: "At Reborn Interactive, immersive worlds begin with powerful visuals and meaningful stories. Vishnu plays a vital role in shaping the artistic and emotional depth of every game through 3D modeling, animation, and narrative-driven design.\n\nSpecializing in character modeling, environment creation, and dynamic animation, he brings digital worlds to life with realism, movement, and personality. His work goes beyond visuals — integrating storytelling elements that enhance gameplay and create deeper player connections.\n\nFrom concept sketches to fully animated game-ready assets, Vishnu ensures that every model and motion contributes to a compelling and immersive experience.\n\nWhat He Creates:\n• 3D Modeling\n• Animation\n• Storytelling Through Design\n\nCreative Philosophy: Vishnu believes that great games are built at the intersection of art and emotion. His mission is to create visually captivating and story-driven experiences that resonate with players long after the game ends."
  }
];

export const CreatorPage: React.FC = () => {
  // Refs for GSAP animation
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Create a GSAP context for cleanup
    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set(cardRefs.current, {
        y: 50,
        opacity: 0,
      });

      // Create scroll-triggered animation for each card
      cardRefs.current.forEach((card, index) => {
        if (!card) return;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 80%",
          onEnter: () => {
            gsap.to(cardRefs.current, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.15,
              ease: "power3.out",
            });
          },
          once: true,
        });
      });

      // Alternative approach: Animate all cards with stagger when the section comes into view
      // ScrollTrigger.create({
      //   trigger: sectionRef.current,
      //   start: "top 80%",
      //   onEnter: () => {
      //     gsap.to(cardRefs.current, {
      //       y: 0,
      //       opacity: 1,
      //       duration: 0.8,
      //       stagger: 0.15,
      //       ease: "power3.out",
      //     });
      //   },
      //   once: true,
      // });
    }, sectionRef);

    // Cleanup function
    return () => {
      ctx.revert();
      // Kill all ScrollTriggers to prevent memory leaks
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#0a0a0a] py-20 px-6 sm:px-10 lg:px-20 min-h-screen selection:bg-[#d63031] selection:text-white"
    >
      <div className="max-w-7xl mx-auto">

        <header className="mb-16 md:mb-32 text-center">
          <div
            className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-[0.2em] uppercase rounded-full border border-[#d63031]/30 text-[#d63031] bg-[#d63031]/5"
          >
            The Team
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight italic uppercase">
            Creators<span style={{ color: ACCENT_RED }}>.</span>
          </h1>
          <p className="mt-4 text-gray-400 max-w-md mx-auto text-sm md:text-base">
            The architects of digital worlds and seamless experiences.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-16 items-start">
          {CARD_DATA.map((card, index) => {
            const isRightColumn = index % 2 !== 0;

            return (
              <div
                key={card.id}
                ref={(el) => { cardRefs.current[index] = el; }}
                className={`w-full group relative transition-all duration-500 hover:z-50
                  ${isRightColumn ? "md:mt-40" : "md:mt-0"}
                `}
              >
                <div
                  className="absolute -inset-4 rounded-3xl opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-20 pointer-events-none"
                  style={{ backgroundColor: ACCENT_RED }}
                />

                <div className="relative rounded-2xl transition-colors duration-500 overflow-visible">
                  <div className="absolute inset-0 bg-[#111111] rounded-2xl border border-white/5 pointer-events-none" />
                  <InfoCard
                    image={card.image}
                    title={card.name}
                    designation={card.designation}
                    description={card.description}
                    borderColor={ACCENT_RED}
                    effectBgColor={ACCENT_RED}
                    hoverTextColor="#ffffff"
                    borderBgColor="transparent"
                    cardBgColor="#111111"
                    textColor="#cccccc"
                    contentPadding="1.5rem"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CreatorPage;