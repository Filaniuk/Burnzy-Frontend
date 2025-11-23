export default function QuoteBlock() {
  return (
    <section className="w-full bg-[#0F0E17] text-white py-4 px-6">
      <div className="max-w-4xl mx-auto text-center">

        {/* Soft glow behind the text */}
        <div className="absolute left-1/2 -translate-x-1/2 mt-[-40px] w-[300px] h-[300px] 
                        bg-gradient-to-br from-[#6C63FF]/20 to-[#00F5A0]/20 
                        blur-[120px] opacity-40 pointer-events-none" />

        {/* Quote text */}
        <h2 className="
          text-3xl md:text-4xl font-semibold leading-snug tracking-tight 
          relative z-10
        ">
          <span className="bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent font-extrabold">
            “YouTube creators don’t need more tools —
          </span>
          <br />
          they need fewer decisions.”
        </h2>

      </div>
    </section>
  );
}
