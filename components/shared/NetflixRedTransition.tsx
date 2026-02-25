"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";

export default function NetflixRedTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const overlayRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const barTopRef = useRef<HTMLDivElement>(null);
    const barBottomRef = useRef<HTMLDivElement>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevPathname = useRef(pathname);

    // Define routes that should skip the animation (without language prefix)
    const skipAnimationRoutes = [
        'about', 
        'login',
        'privacy',
        'terms',
        'cookies',
        // Add more routes as needed
    ];

    useEffect(() => {
        // Extract the last part of the pathname
        const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
        const lastSegment = pathSegments[pathSegments.length - 1] || '';
        
        // Check if the last segment matches any skip route
        const shouldSkipAnimation = skipAnimationRoutes.includes(lastSegment);

        if (shouldSkipAnimation) {
            // Ensure overlay is hidden for skipped routes
            if (overlayRef.current) {
                gsap.set(overlayRef.current, { display: 'none' });
            }
            prevPathname.current = pathname;
            return;
        }

        if (prevPathname.current === pathname) return;

        const animateTransition = () => {
            if (isTransitioning) return;
            setIsTransitioning(true);

            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(overlayRef.current, { display: 'none' });
                    setIsTransitioning(false);
                    prevPathname.current = pathname;
                }
            });

            // --- 1. INITIAL STATE ---
            tl.set(overlayRef.current, { 
                display: 'flex', 
                opacity: 0,
                background: "radial-gradient(circle, #1a1a1a 0%, #000 100%)" 
            })
            .set([barTopRef.current, barBottomRef.current], { height: "0%" })
            .set(logoRef.current, { scale: 0.6, opacity: 0, filter: "brightness(1) blur(5px)" });

            // --- 2. THE CINEMATIC ENTRANCE (FASTER) ---
            tl.to([barTopRef.current, barBottomRef.current], {
                height: "12vh",
                duration: 0.25,
                ease: "power4.out"
            })
            .to(contentRef.current, {
                opacity: 0,
                scale: 0.98,
                filter: "blur(4px)",
                duration: 0.3,
                ease: "power2.in"
            }, "-=0.2")
            .to(overlayRef.current, {
                opacity: 1,
                duration: 0.25,
            }, "-=0.25");

            // --- 3. THE LOGO REVEAL (SNAPPY TUDUM) ---
            tl.to(logoRef.current, {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.4,
                ease: "back.out(1.7)"
            })
            .to(logoRef.current, {
                filter: "brightness(1.8) drop-shadow(0 0 30px #e50914)",
                duration: 0.08,
                repeat: 1,
                yoyo: true,
            }, "-=0.2");

            // --- 4. THE EXPLOSION INTO CONTENT (AGGRESSIVE ZOOM) ---
            tl.to(logoRef.current, {
                scale: 20,
                opacity: 0,
                duration: 0.5,
                ease: "expo.in"
            })
            .to([barTopRef.current, barBottomRef.current], {
                height: "0%",
                duration: 0.3, 
                ease: "power4.in"
            }, "-=0.4")
            .fromTo(contentRef.current, 
                { opacity: 0, scale: 1.1, filter: "blur(8px)" },
                { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.4, ease: "power2.out" },
                "-=0.3"
            );
        };

        animateTransition();
    }, [pathname]);

    return (
        <div className="relative min-h-screen bg-black overflow-hidden">
            <div ref={contentRef} className="relative z-10">
                {children}
            </div>

            <div ref={overlayRef} className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none" style={{ display: 'none' }}>
                <div ref={barTopRef} className="absolute top-0 left-0 w-full bg-black z-[10001]" />
                <div ref={barBottomRef} className="absolute bottom-0 left-0 w-full bg-black z-[10001]" />
                
                <div ref={logoRef} className="relative z-[10000]">
                    <Image
                        src='/assets/navbar/Website.png'
                        alt="Logo"
                        width={400}
                        height={200}
                        className="w-auto h-auto object-contain"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}