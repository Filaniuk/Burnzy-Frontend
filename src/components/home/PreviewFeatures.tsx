"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";

export default function PreviewFeatures() {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut },
    },
  };

  const featureCards = [
    {
      img: "/insights.png",
      tag1: "Channel Insights",
      tag2: "Health Score",
      title: "Smart Insights",
      desc: "Understand your channel like never before. Our AI scans your content, trends, and audience behavior to deliver insights that actually move the needle.",
    },
    {
      img: "/ideas.png",
      tag1: "Detailed Briefs",
      tag2: "Script Generator",
      tag3: "Thumbnail Concepts",
      title: "Trend Ideas",
      desc: "Get fresh, data-backed video ideas generated from real-time trends, competitor updates, and audience behavior—tailored to your channel.",
    },
    {
      img: "/calendar.png",
      tag1: "Content Plans",
      tag2: "Production Calendar",
      tag3: "Workspace Labels",
      title: "Content plan & Calendar",
      desc: "Your full content schedule — auto-generated. Plan weeks ahead, stay organized, and publish without burnout. Built to help creators stay consistent and grow.",
    },
  ];

  return (
    <section className="w-full bg-[#0F0E17] text-white py-16 px-6">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center text-3xl md:text-4xl font-bold mb-16"
      >
        Preview of Features
      </motion.h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
        {featureCards.map((card, idx) => (
          <motion.div
            key={idx}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col items-center text-center"
          >
            {/* Image container */}
            <div
              className="
                w-full rounded-2xl overflow-hidden bg-[#13121C]
                border border-[#1E1D27] shadow-xl cursor-pointer
                hover:opacity-95 transition
              "
              onClick={() => setZoomSrc(card.img)}
            >
              <Image
                src={card.img}
                alt="feature preview"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-2xl"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[card.tag1, card.tag2, card.tag3]
                .filter(Boolean)
                .map((tag, i) => (
                  <span
                    key={i}
                    className="px-4 py-1 text-xs rounded-full bg-[#6C63FF] text-white font-medium shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            {/* Title — FORCE SAME HEIGHT ACROSS ALL CARDS */}
            <h3 className="mt-6 text-lg font-semibold min-h-[48px] flex items-center justify-center">
              {card.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* --------------------------- */}
      {/*     ZOOM MODAL ANIMATION     */}
      {/* --------------------------- */}
      <AnimatePresence>
        {zoomSrc && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomSrc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="
    relative
    w-screen
    h-screen
    p-4
    flex 
    items-center 
    justify-center
  "
            >
              <div
                className="
      max-w-[98vw]
      max-h-[95vh]
      flex 
      items-center 
      justify-center
    "
              >
                <Image
                  src={zoomSrc}
                  alt="Zoom preview"
                  fill
                  className="
        object-contain 
        rounded-xl 
        shadow-2xl
      "
                />
              </div>
            </motion.div>


          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
