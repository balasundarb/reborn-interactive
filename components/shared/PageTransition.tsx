// components/PageTransition.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";

interface PageTransitionProps {
    children: React.ReactNode;
    logoImage: string;
}

export default function PageTransition({ children, logoImage }: PageTransitionProps) {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const logoCloneRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const colorOverlayRef = useRef<HTMLDivElement>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevPathname = useRef(pathname);

    // Get original logo position
    const getLogoPosition = () => {
        const originalLogo = document.querySelector('nav img') as HTMLImageElement;
        if (originalLogo) {
            const rect = originalLogo.getBoundingClientRect();
            return {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            };
        }
        return null;
    };

    // Handle page transitions
    useEffect(() => {
        // Skip if same page or first render
        if (prevPathname.current === pathname) return;

        const animateTransition = async () => {
            if (isTransitioning) return;

            setIsTransitioning(true);

            const logoPos = getLogoPosition();
            if (!logoPos || !logoCloneRef.current || !overlayRef.current || !contentRef.current || !colorOverlayRef.current) {
                setIsTransitioning(false);
                prevPathname.current = pathname;
                return;
            }

            // Kill any ongoing animations
            gsap.killTweensOf([logoCloneRef.current, overlayRef.current, contentRef.current, colorOverlayRef.current]);

            // Set initial states
            gsap.set(logoCloneRef.current, {
                position: 'fixed',
                top: logoPos.top,
                left: logoPos.left,
                width: logoPos.width,
                height: logoPos.height,
                zIndex: 10000,
                opacity: 1,
                display: 'block',
            });

            gsap.set(overlayRef.current, {
                opacity: 0,
                display: 'block',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
            });

            gsap.set(colorOverlayRef.current, {
                opacity: 0,
                display: 'block',
                backgroundColor: '#ef4444', // Bright red color
                mixBlendMode: 'multiply',
            });

            gsap.set(contentRef.current, {
                opacity: 1,
            });

            // Create main timeline
            const tl = gsap.timeline({
                defaults: { ease: "power3.inOut" },
                onComplete: () => {
                    // Clean up after animation
                    gsap.set(logoCloneRef.current, { display: 'none' });
                    gsap.set(overlayRef.current, { display: 'none' });
                    gsap.set(colorOverlayRef.current, { display: 'none' });
                    gsap.set(contentRef.current, { opacity: 1 });
                    setIsTransitioning(false);
                    prevPathname.current = pathname;
                }
            });

            // Animation sequence - Image zooms to center and turns red
            tl
                // Step 1: Fade out content slightly
                .to(contentRef.current, {
                    opacity: 0.3,
                    duration: 0.3,
                    ease: "power2.out",
                })

                // Step 2: Zoom logo to center
                .to(logoCloneRef.current, {
                    top: '50%',
                    left: '50%',
                    xPercent: -50,
                    yPercent: -50,
                    width: 'min(60vw, 400px)',
                    height: 'auto',
                    duration: 0.8,
                    ease: "power3.inOut",
                }, "-=0.2")

                // Step 3: Fade in overlay
                .to(overlayRef.current, {
                    opacity: 1,
                    duration: 0.5,
                }, "-=0.4")

                // Step 4: Add red color overlay and pulse
                .to(colorOverlayRef.current, {
                    opacity: 0.8,
                    duration: 0.4,
                    ease: "power2.in",
                })

                // Step 5: Pulse effect while red
                .to(logoCloneRef.current, {
                    scale: 1.2,
                    duration: 0.3,
                    ease: "power2.in",
                })
                .to(logoCloneRef.current, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out",
                })

                // Step 6: Intensify red
                .to(colorOverlayRef.current, {
                    opacity: 1,
                    duration: 0.2,
                })

                // Step 7: Quick rotation for dynamic feel
                .to(logoCloneRef.current, {
                    rotation: 8,
                    duration: 0.15,
                })
                .to(logoCloneRef.current, {
                    rotation: -8,
                    duration: 0.15,
                })
                .to(logoCloneRef.current, {
                    rotation: 0,
                    duration: 0.15,
                })

                // Step 8: Hold red moment
                .to({}, {
                    duration: 0.2,
                })

                // Step 9: Fade out red overlay
                .to(colorOverlayRef.current, {
                    opacity: 0,
                    duration: 0.3,
                })

                // Step 10: Zoom out back to position
                .to(logoCloneRef.current, {
                    top: logoPos.top,
                    left: logoPos.left,
                    width: logoPos.width,
                    height: logoPos.height,
                    xPercent: 0,
                    yPercent: 0,
                    duration: 0.8,
                    ease: "power3.inOut",
                }, "-=0.2")

                // Step 11: Fade out overlay
                .to(overlayRef.current, {
                    opacity: 0,
                    duration: 0.5,
                }, "-=0.4")

                // Step 12: Fade content back in
                .to(contentRef.current, {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.in",
                }, "-=0.3");
        };

        animateTransition();
    }, [pathname, isTransitioning]);

    return (
        <div ref={containerRef} className="relative min-h-screen">
            {/* Page Content */}
            <div ref={contentRef} className="relative z-10">
                {children}
            </div>

            {/* Dark Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 pointer-events-none z-[9998]"
                style={{ display: 'none' }}
            />

            {/* Red Color Overlay */}
            <div
                ref={colorOverlayRef}
                className="fixed inset-0 pointer-events-none z-[9997]"
                style={{ display: 'none' }}
            />

            {/* Logo Clone for Animation */}
            <div
                ref={logoCloneRef}
                className="fixed pointer-events-none z-[9999]"
                style={{ display: 'none' }}
            >
                <Image
                    src={logoImage}
                    alt="Logo"
                    width={600}
                    height={200}
                    className="w-full h-full object-contain"
                    priority
                />
            </div>
        </div>
    );
}