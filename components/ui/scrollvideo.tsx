"use client";

import { useRef, useState } from "react";
import {
    useScroll,
    useSpring,
    useTransform,
    useMotionValueEvent,
    motion
} from "framer-motion";

export default function UltraSmoothScrollVideo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastTimeRef = useRef(0);
    const [duration, setDuration] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Balanced smooth physics (not aggressive)
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 40,
        mass: 0.3,
    });

    const targetTime = useTransform(smoothProgress, [0, 1], [0, duration]);
    const opacity = useTransform(smoothProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

    useMotionValueEvent(targetTime, "change", (latest) => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;

        // Avoid micro updates
        if (Math.abs(latest - lastTimeRef.current) < 0.01) return;

        // Smooth interpolation
        const smoothTime = lastTimeRef.current + (latest - lastTimeRef.current) * 0.25;

        video.currentTime = smoothTime;
        lastTimeRef.current = smoothTime;
    });

    return (
        <div className="relative">
            <div ref={containerRef} className="h-[350vh] bg-black">

                <motion.div 
                    style={{ opacity }}
                    className="fixed z-50 inset-0 h-screen w-full overflow-hidden pointer-events-none"
                >
                    <video
                        ref={videoRef}
                        src="/video/character.webm"
                        muted
                        playsInline
                        preload="auto"
                        className="h-full w-full object-cover"
                        style={{
                            willChange: "transform",
                            transform: "translateZ(0)"
                        }}
                        onLoadedMetadata={(e) =>
                            setDuration(e.currentTarget.duration)
                        }
                    />

                </motion.div>

                 
            </div>
        </div>
    );
}