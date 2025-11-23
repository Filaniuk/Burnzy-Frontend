"use client";

import { motion } from "framer-motion";
import { Lightbulb, Clock, Flame } from "lucide-react"; // neon icons
// If you want custom SVGs instead, I can generate them too.

export default function WhyHard() {
  const items = [
    {
      icon: <Lightbulb strokeWidth={2} className="w-10 h-10 text-[#6C63FF]" />,
      title: "You’re always searching for the next idea",
      text: "Inspiration swings, trends shift, and the blank page wins too often. Ideas shouldn’t rely on luck.",
      glow: "from-[#6C63FF]/20",
      border: "border-[#6C63FF]/40",
    },
    {
      icon: <Clock strokeWidth={2} className="w-10 h-10 text-[#00F5A0]" />,
      title: "Planning takes forever",
      text: "Ideas → scripts → thumbnails → research → trends… Your workflow is scattered across tools.",
      glow: "from-[#00F5A0]/20",
      border: "border-[#00F5A0]/40",
    },
    {
      icon: <Flame strokeWidth={2} className="w-10 h-10 text-[#6C63FF]" />,
      title: "Creative burnout is real",
      text: "The pressure to post consistently leads to rushed videos, exhaustion, and stalled growth.",
      glow: "from-[#6C63FF]/20",
      border: "border-[#6C63FF]/40",
    },
  ];

  return (
    <section className="w-full bg-[#0F0E17] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold mb-16 tracking-tight">
          Why creating consistent content feels impossible
        </h2>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className={`
                relative rounded-3xl bg-[#13121C]/50 border ${item.border}
                p-8 shadow-xl backdrop-blur-xl
                hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]
                transition-all duration-300 group
              `}
            >
              {/* Glow behind card */}
              <div
                className={`
                  absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-40
                  bg-gradient-to-br ${item.glow} to-transparent
                  blur-2xl transition-all duration-500 -z-10
                `}
              />

              {/* ICON */}
              <div className="mb-5">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#1A1A24] border border-white/10 shadow-lg">
                  {item.icon}
                </div>
              </div>

              {/* TITLE */}
              <h3 className="text-lg font-semibold mb-3 leading-tight">
                {item.title}
              </h3>

              {/* TEXT */}
              <p className="text-neutral-400 text-sm leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
