"use client";

import PrimaryButton from "./PrimaryButton";
import { easeOut, motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="w-full bg-[#0F0E17] text-white py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="max-w-3xl mx-auto text-center"
      >
        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">
          <span>Stop guessing. {" "}</span>
          <span className="text-[#6C63FF]">Start growing.</span>
        </h2>

        {/* DESCRIPTION */}
        <p className="text-neutral-300 text-lg leading-relaxed mb-10">
          Kick off your next phase of growth with a fully optimized content plan,
          fresh ideas, and scripts tailored to your channel’s niche and audience.
        </p>

        {/* CTA BUTTON */}
        <div className="flex justify-center">
          <PrimaryButton label="Start for free" />
        </div>

        <p className="text-neutral-500 text-sm mt-4">No payment required.</p>
      </motion.div>
    </section>
  );
}
