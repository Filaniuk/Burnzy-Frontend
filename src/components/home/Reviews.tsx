"use client";

import { useState } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import Image from "next/image";

export default function Reviews() {
    const reviews = [
        {
            id: 1,
            text: "Burnzy helped me plan my content 10x faster. I literally cut planning time from 2 hours to 10 minutes.",
            author: "Daniel Kim",
            avatar: "/person1.jpg",
        },
        {
            id: 2,
            text: "I’ve never seen suggestions so relevant. Feels like having a personal strategist.",
            author: "Ethan Carey",
            avatar: "/person2.jpg",
        },
        {
            id: 3,
            text: "Content burnout used to be real, this tool actually fixed that for me",
            author: "Liam Carter",
            avatar: "/person3.jpg",
        },
        {
            id: 4,
            text: "The ideas are insanely good. I generated more topics in 10 minutes than I did in a whole week.",
            author: "Jonas Berger",
            avatar: "/person4.jpg",
        },
    ];

    const [index, setIndex] = useState(0);

    const next = () => setIndex((prev) => (prev + 1) % reviews.length);
    const prev = () => setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

    return (
        <section className="w-full bg-[#0F0E17] text-white py-5 px-4">
            <div className="max-w-6xl mx-auto">

                <h2 className="text-2xl md:text-4xl font-bold mb-10 tracking-tight text-center md:text-left">
                    Creators are already using it to plan smarter
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">

                    {/* LEFT STATS */}
                    <div className="text-center md:text-left space-y-6 order-2 md:order-1">
                        <div>
                            <p className="text-[#00F5A0] font-extrabold text-3xl">4,000+</p>
                            <p className="text-neutral-400 text-sm">Ideas generated last week</p>
                        </div>
                        <div>
                            <p className="text-[#6C63FF] font-extrabold text-3xl">650+</p>
                            <p className="text-neutral-400 text-sm">Content plans generated</p>
                        </div>
                    </div>

                    {/* REVIEW CARD + ARROWS */}
                    <div className="flex flex-col items-center justify-center relative order-1 md:order-2">

                        {/* CARD WRAPPER */}
                        <div className="relative w-full max-w-[380px] sm:max-w-[450px] md:max-w-[620px] mx-auto">

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={reviews[index].id}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.28, ease: easeOut }}
                                    className="
                                bg-[#13121C]/70 backdrop-blur-xl
                                border border-[#20202A]
                                rounded-3xl shadow-xl
                                px-6 py-6 w-full
                            "
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden">
                                            <Image
                                                src={reviews[index].avatar}
                                                alt="avatar"
                                                width={50}
                                                height={50}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>

                                        <span className="text-sm sm:text-md font-semibold text-white">
                                            {reviews[index].author}
                                        </span>
                                    </div>

                                    <p className="text-neutral-300 text-sm leading-relaxed sm:text-[15px]">
                                        {reviews[index].text}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* MOBILE ARROWS BELOW CARD */}
                        <div className="flex md:hidden gap-6 mt-5">
                            <button
                                onClick={prev}
                                className="px-4 py-2 rounded-full bg-[#1A1A24] hover:bg-[#23232E] transition text-neutral-300 hover:text-white"
                            >
                                ◀
                            </button>
                            <button
                                onClick={next}
                                className="px-4 py-2 rounded-full bg-[#1A1A24] hover:bg-[#23232E] transition text-neutral-300 hover:text-white"
                            >
                                ▶
                            </button>
                        </div>

                        {/* DESKTOP ARROWS */}
                        <div className="hidden md:flex absolute inset-0 items-center justify-between pointer-events-none">
                            <button
                                onClick={prev}
                                className="pointer-events-auto ml-[-3rem] px-4 py-2 rounded-full bg-[#1A1A24] hover:bg-[#23232E] transition text-neutral-300 hover:text-white"
                            >
                                ◀
                            </button>

                            <button
                                onClick={next}
                                className="pointer-events-auto mr-[-3rem] px-4 py-2 rounded-full bg-[#1A1A24] hover:bg-[#23232E] transition text-neutral-300 hover:text-white"
                            >
                                ▶
                            </button>
                        </div>

                    </div>

                    {/* RIGHT STATS */}
                    <div className="text-center md:text-right space-y-6 order-3">
                        <div>
                            <p className="text-[#6C63FF] font-extrabold text-3xl">400+</p>
                            <p className="text-neutral-400 text-sm">Completely different niches</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
