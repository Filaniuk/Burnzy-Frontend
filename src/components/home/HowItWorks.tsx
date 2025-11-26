"use client";

import { motion } from "framer-motion";
import { Lightbulb, LineChart, Rocket } from "lucide-react";

export default function HowItWorks() {
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const steps = [
    {
      number: 1,
      title: "Submit your input",
      desc: "Drop a YouTube link or enter a topic.",
      icon: <Lightbulb className="w-6 h-6 text-[#00F5A0]" />,
      glow: "from-[#00F5A0]/60 to-[#00F5A0]/0",
      ring: "border-[#00F5A0]",
    },
    {
      number: 2,
      title: "Analyze & discover",
      desc: "Our AI Model studies live trends and audience patterns to generate topic ideas and complete scripts.",
      icon: <LineChart className="w-6 h-6 text-[#6C63FF]" />,
      glow: "from-[#6C63FF]/60 to-[#6C63FF]/0",
      ring: "border-[#6C63FF]",
    },
    {
      number: 3,
      title: "Get your custom plan",
      desc: "Receive your personalized content plan written and ready to publish.",
      icon: <Rocket className="w-6 h-6 text-[#00F5A0]" />,
      glow: "from-[#00F5A0]/60 to-[#00F5A0]/0",
      ring: "border-[#00F5A0]",
    },
  ];

  return (
    <section className="w-full bg-[#0F0E17] text-white mt-8 px-6">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-center text-3xl md:text-4xl font-bold mb-4"
      >
        How it works
      </motion.h2>

      <p className="text-center text-neutral-300 max-w-2xl mx-auto mb-16">
        Submit any channel link or topic, let AI do the analysis, and receive your custom
        content plan based on real trend data.
      </p>


        {/* STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 text-center relative z-10">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              {/* Number circle */}
              <div className="relative mb-6">
                {/* Glow */}
                <div
                  className={`
                    absolute inset-0 blur-[32px]
                    bg-gradient-to-b ${s.glow}
                  `}
                />

                <div
                  className={`
                    w-16 h-16 flex items-center justify-center
                    rounded-full bg-[#0F0E17]
                    border-2 ${s.ring}
                    text-xl font-bold relative z-10
                  `}
                >
                  {s.number}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>

              {/* Description */}
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
    </section>
  );
}
