"use client";

import { useRef, useState } from "react";
import {
    useScroll,
    useSpring,
    useTransform,
    useMotionValueEvent
} from "framer-motion";

export default function UltraSmoothScrollVideo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
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

    let lastTime = 0;

    useMotionValueEvent(targetTime, "change", (latest) => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;

        // Avoid micro updates
        if (Math.abs(latest - lastTime) < 0.01) return;

        // Smooth interpolation
        const smoothTime = lastTime + (latest - lastTime) * 0.25;

        video.currentTime = smoothTime;
        lastTime = smoothTime;
    });

    return (
        <div className="relative">
            <div ref={containerRef} className="h-[350vh] bg-black">

                <div className="fixed z-0 inset-0 h-screen w-full overflow-hidden pointer-events-none">
                    <video
                        ref={videoRef}
                        src="/video/video.webm"
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

                </div>

                <div className="relative z-10 flex h-screen items-center justify-center">
                    <h1 className="text-white text-5xl font-light tracking-widest uppercase">
                        Refined Motion
                    </h1>
                </div>
            </div>
        </div>
    );
}