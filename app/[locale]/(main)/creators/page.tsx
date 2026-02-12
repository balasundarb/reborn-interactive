'use client';

import React from 'react';
import { RadialScrollGallery } from '@/components/ui/portfolio-and-image-gallery';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const projects = [
{ id: 1, title: "Nebula", cat: "Art", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
{ id: 2, title: "Decay", cat: "Photo", img: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=400&q=80" },
{ id: 3, title: "Oceanic", cat: "Nature", img: "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?auto=format&fit=crop&w=400&q=80" },
{ id: 4, title: "Neon", cat: "Tech", img: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80" },
{ id: 5, title: "Desert", cat: "Travel", img: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=400&q=80" },
];

export default function DemoRadialScrollGalleryBento() {
return (
  <div className="bg-background min-h-[600px] text-foreground overflow-hidden rounded-lg border w-full">


    <RadialScrollGallery
      className="!min-h-[600px]"
      baseRadius={400}
      mobileRadius={250}
      visiblePercentage={50}
      scrollDuration={2000}
    >
      {(hoveredIndex) =>
        projects.map((project, index) => {
           const isActive = hoveredIndex === index;
           return (
            <div 
              key={project.id} 
              className="group relative w-[200px] h-[280px] sm:w-[240px] sm:h-[320px] overflow-hidden rounded-xl bg-card border border-border shadow-lg"
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={project.img}
                  alt={project.title}
                  className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                    isActive ? 'scale-110 blur-0' : 'scale-100 blur-[1px] grayscale-[30%]'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-60" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-background/80 backdrop-blur">
                    {project.cat}
                  </Badge>
                  <div className={`w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`}>
                    <ArrowUpRight size={12} />
                  </div>
                </div>

                <div className={`transition-transform duration-500 ${isActive ? 'translate-y-0' : 'translate-y-2'}`}>
                  <h3 className="text-xl font-bold leading-tight text-foreground">{project.title}</h3>
                  <div className={`h-0.5 bg-primary mt-2 transition-all duration-500 ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
                </div>
              </div>
            </div>
           );
        })
      }
    </RadialScrollGallery>

    <div className="h-[300px] flex items-center justify-center bg-muted/30">
      <h2 className="text-xl font-light tracking-widest uppercase text-muted-foreground">
        Footer
      </h2>
    </div>
  </div>
);
}