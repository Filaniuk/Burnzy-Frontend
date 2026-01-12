"use client";

import Image from "next/image";
import PrimaryButton from "./PrimaryButton";
import { easeOut, motion } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut }
    }
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

  return (
    <section className="bg-[#0F0E17] text-white w-full overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-16 flex flex-col lg:flex-row gap-10 items-center justify-between lg:py-20">

        {/* RIGHT ON MOBILE — LEFT ON DESKTOP */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="
            flex justify-center
            w-full
            max-w-[90%]
            sm:max-w-[400px]
            md:max-w-[430px]
            lg:max-w-[470px]
            xl:max-w-[520px]
            order-1 lg:order-2
          "
        >
          {/* Tilt wrapper */}
          <div
            ref={tiltRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
            className="
              relative
              rounded-[28px]
              transition-transform duration-150 ease-out
            "
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Glow */}
            <div
              className="
                absolute inset-0
                pointer-events-none
                rounded-[18px]
                bg-gradient-to-r from-[#6C63FF] to-[#00F5A0]
                blur-[20px]
                opacity-20
              "
              style={{ transform: "translateZ(-1px)" }}
            />

            {/* Image */}
            <Image
              src="/firsthero1248.webp"
              alt="Glowing dashboard"
              width={900}
              height={560}
              priority
              className="w-full h-auto rounded-[28px] object-contain relative z-10"
            />
          </div>
        </motion.div>

        {/* LEFT ON MOBILE — RIGHT ON DESKTOP */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="max-w-xl w-full order-2 lg:order-1"
        >
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            <span className="block">More views.</span>
            <span className="block bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
              Less burnout.
            </span>
          </h1>

          <p className="mt-5 text-base text-neutral-300 sm:text-lg">
            Boost your content with next-gen AI that studies real-time trends,
            audience behavior, and channel performance to help you scale faster.
          </p>

          <div className="mt-8">
            <PrimaryButton label="Start for free" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
