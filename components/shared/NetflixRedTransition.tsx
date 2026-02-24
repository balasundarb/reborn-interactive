// components/NetflixRedTransition.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";

interface NetflixRedTransitionProps {
    children: React.ReactNode;
    logoImage?: string; // Optional custom logo
}

export default function NetflixRedTransition({ children, logoImage = "/netflix-logo.png" }: NetflixRedTransitionProps) {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevPathname = useRef(pathname);

    useEffect(() => {
        if (prevPathname.current === pathname) return;

        const animateTransition = async () => {
            if (isTransitioning) return;
            setIsTransitioning(true);

            if (!overlayRef.current || !contentRef.current || !logoRef.current) {
                setIsTransitioning(false);
                prevPathname.current = pathname;
                return;
            }

            gsap.killTweensOf([overlayRef.current, contentRef.current, logoRef.current]);

            // Initial states
            gsap.set(overlayRef.current, {
                opacity: 0,
                display: 'block',
                backgroundColor: '#000',
            });

            gsap.set(logoRef.current, {
                display: 'none',
                opacity: 0,
                scale: 0.8,
            });

            gsap.set(contentRef.current, {
                scale: 1,
                opacity: 1,
            });

            const tl = gsap.timeline({
                defaults: { ease: "power2.inOut" },
                onComplete: () => {
                    gsap.set([overlayRef.current, logoRef.current], { display: 'none' });
                    gsap.set(contentRef.current, { scale: 1, opacity: 1 });
                    setIsTransitioning(false);
                    prevPathname.current = pathname;
                }
            });

            tl
                // Fade out current content
                .to(contentRef.current, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.3,
                })

                // Show logo
                .set(logoRef.current, {
                    display: 'block',
                    opacity: 0,
                    scale: 0.8,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    xPercent: -50,
                    yPercent: -50,
                    zIndex: 10000,
                })

                // Netflix red reveal
                .to(overlayRef.current, {
                    opacity: 1,
                    duration: 0.2,
                })

                // Logo appears with Netflix red
                .to(logoRef.current, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    ease: "back.out(1.7)",
                })

                // Hold for dramatic effect
                .to({}, {
                    duration: 0.3,
                })

                // Red pulse (Netflix signature)
                .to(logoRef.current, {
                    filter: 'brightness(1.3) drop-shadow(0 0 10px #e50914)',
                    duration: 0.2,
                })
                .to(logoRef.current, {
                    filter: 'brightness(1) drop-shadow(0 0 0px transparent)',
                    duration: 0.2,
                })

                // Logo fades out
                .to(logoRef.current, {
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.3,
                })

                // New content appears
                .set(contentRef.current, {
                    opacity: 0,
                    scale: 1.05,
                })

                .to(contentRef.current, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.out",
                })

                .to(overlayRef.current, {
                    opacity: 0,
                    duration: 0.4,
                }, "-=0.3");
        };

        animateTransition();
    }, [pathname]);

    return (
        <div ref={containerRef} className="relative min-h-screen">
            {/* Content */}
            <div ref={contentRef} className="relative z-10">
                {children}
            </div>

            {/* Dark Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 pointer-events-none z-[9998]"
                style={{ display: 'none' }}
            />

            {/* Netflix Logo */}
            <div
                ref={logoRef}
                className="fixed pointer-events-none z-[9999]"
                style={{ display: 'none' }}
            >
                <Image
                    src='/assets/navbar/Website.png'
                    alt="Reborn Interactive Logo"
                    width={200}
                    height={100}
                    className="w-auto h-auto"
                    priority
                />
            </div>
        </div>
    );
}