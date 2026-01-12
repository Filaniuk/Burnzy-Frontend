"use client";

import Image from "next/image";
import PrimaryButton from "./PrimaryButton";
import { easeOut, motion } from "framer-motion";
import { useRef } from "react";
import { CheckCircle, CalendarDays, Sparkles, PenTool } from "lucide-react";

export default function SecondHero() {
    const fadeUp = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: easeOut },
        },
    };

    const tiltRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        const card = tiltRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = (y / rect.height) * -10;
        const rotateY = (x / rect.width) * 10;

        card.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.03)
    `;
    };

    const resetTilt = () => {
        const card = tiltRef.current;
        if (!card) return;
        card.style.transform =
            "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    };

    const benefits = [
        {
            icon: <CheckCircle className="text-[#00F5A0] w-6 h-6" />,
            title: "Trend-Based Ideas, Thumbnails, Scripts and Briefs Tailored to You",
            desc: "Ideas matched to your niche, trending topics, and top-performing content formats. Receive full scripts, title ideas, thumbnails, and creative directions in seconds.",
        },
        {
            icon: <PenTool className="text-[#6C63FF] w-6 h-6" />,
            title: "Explore Own Ideas, Niches & Keywords That Actually Rank",
            desc: "Discover high-intent keywords, underestimated niches and content angles backed by real-time YouTube analytics.",
        },
        {
            icon: <CalendarDays className="text-[#6C63FF] w-6 h-6" />,
            title: "Automated YouTube Content Calendar",
            desc: "Your entire content plan auto-generated — including publishing days, video sequence, and production workflow.",
        },
        {
            icon: <Sparkles className="text-[#00F5A0] w-6 h-6" />,
            title: "Data-Driven Channel Insights & Optimization Tips",
            desc: "AI analyzes your channel performance, audience behavior, retention patterns, and niche trends.",
        },
    ];


    return (
        <section className="w-full bg-[#0F0E17] text-white mt-24 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                {/* LEFT — IMAGE WITH SAME 3D TILT + GLOW */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex justify-center"
                >
                    <div
                        ref={tiltRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={resetTilt}
                        className="
    relative rounded-[28px]
    transition-transform duration-150 ease-out
    w-full max-w-[420px]        /* smaller width */
    max-h-[70vh]                /* prevents huge height */
  "
                        style={{ transformStyle: "preserve-3d" }}
                    >

                        {/* Glow inside tilt container */}
                        <div
                            className="
                absolute inset-0 pointer-events-none
                rounded-[22px]
                bg-gradient-to-r from-[#6C63FF] to-[#00F5A0]
                blur-[20px] opacity-25
              "
                            style={{ transform: "translateZ(-1px)" }}
                        />

                        <Image
                            src="/secondhero.webp"
                            alt="Content engine dashboard"
                            width={900}
                            height={900}
                            className="w-full h-auto rounded-[28px] object-contain relative z-10"
                            priority
                        />
                    </div>
                </motion.div>

                {/* RIGHT — BENEFITS + CTA */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="max-w-xl"
                >
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                        A complete YouTube <br /> content engine
                    </h2>

                    <p className="text-neutral-300 mb-10">
                        Built from your channel, personalized for your growth.
                    </p>

                    <div className="flex flex-col gap-6 mb-10">
                        {benefits.map((b, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className="mt-1">{b.icon}</div>
                                <div>
                                    <h4 className="font-semibold text-white text-sm mb-1">{b.title}</h4>
                                    <p className="text-neutral-400 text-sm leading-relaxed">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center">
                        <PrimaryButton label="Start for free" />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
