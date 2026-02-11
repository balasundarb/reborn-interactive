// components/home/Team.tsx
"use client";
import React from "react";
import { CircularTestimonials } from '@/components/ui/circular-testimonials';

const team = [
  {
    quote:
      "Leading Re-born Interactive has been an incredible journey. Our team's passion for creating immersive gaming experiences drives everything we do. We're committed to pushing creative boundaries.",
    name: "Ajay Rahul",
    designation: "CEO, Game Designer",
    src: "/team/ajay_rahul.webp",
  },
  {
    quote:
      "Building robust, scalable applications is my passion. At Re-born Interactive, I get to work with cutting-edge technologies and bring innovative ideas to life every day.",
    name: "Balasundar B",
    designation: "Full-Stack Developer",
    src: "/team/balasundar.webp",
  },
  {
    quote:
      "Being part of this dynamic team has accelerated my growth as a developer. Every project is a learning opportunity, and I'm excited to contribute to our innovative solutions.",
    name: "Shekinah Florance M",
    designation: "Junior Developer",
    src: "/team/Shekinah.jpg",
  },
  {
    quote:
      "Crafting compelling visual narratives is what I do best. At Re-born Interactive, creativity meets technology, allowing us to tell stories that truly resonate.",
    name: "Renin Oliver",
    designation: "Creative Editor",
    src: "/team/renin_oliver.webp",
  },
  {
    quote:
      "Creating detailed 3D environments and characters is both challenging and rewarding. Our team's collaborative spirit makes every project exceptional.",
    name: "Jegan",
    designation: "3D Artist",
    src: "/team/jegan.webp",
  },
  {
    quote:
      "3D artistry is where imagination becomes reality. Working at Re-born Interactive gives me the platform to transform creative visions into stunning digital experiences.",
    name: "Vignesh",
    designation: "3D Artist",
    src: "/team/vignesh.webp",
  },
  {
    quote:
      "Concept art sets the foundation for great games. I'm proud to contribute to the visual identity and creative direction of our groundbreaking projects.",
    name: "Abinanth K",
    designation: "Concept Artist",
    src: "/team/abinanth.webp",
  },
  {
    quote:
      "Quality assurance is crucial in game development. Ensuring every feature works flawlessly and delivers the best user experience is my mission at Re-born Interactive.",
    name: "Ajay Chandru",
    designation: "Test Engineer",
    src: "/team/ajay_chandru.webp",
  },
  {
    quote:
      "Bridging the gap between art and technology is what technical artistry is all about. Our innovative approach ensures optimal performance without compromising visual quality.",
    name: "Mahesh Krishnan",
    designation: "Technical Artist",
    src: "/team/mahesh_krishnan.webp",
  },
];

const Team = () => {
  return (
    <section className="relative z-10 py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
  Meet Our Team
</h2>
        </div>

        {/* Team Display */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-[1024px]">
            <CircularTestimonials
              testimonials={team}
              autoplay={true}
              colors={{
                name: "#f7f7ff",
                designation: "#e1e1e1",
                testimony: "#f1f1f7",
                arrowBackground: "#ff3b30",
                arrowForeground: "#ffffff",
                arrowHoverBackground: "#d63031",
              }}
              fontSizes={{
                name: "28px",
                designation: "20px",
                quote: "20px",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;