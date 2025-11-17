"use client";

export default function BoardHeader() {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-[#1d1c26]">
      <div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent tracking-tight">
          Idea Production Board
        </h1>

        <p className="text-neutral-400 mt-2 max-w-xl text-sm leading-relaxed">
          Organize, prioritize, and manage your content creation pipeline.
          Drag ideas between stages — from first spark to final publish.
        </p>
      </div>
    </header>
  );
}
