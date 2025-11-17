"use client";

export function CardSection({ title, list, color }: { title: string; list: string[]; color: string }) {
  return (
    <div className="bg-[#12111A]/80 border border-[#242335] rounded-2xl p-6 shadow-lg hover:shadow-[#6C63FF]/10 transition-shadow">
      <h3 className="text-lg font-semibold mb-2" style={{ color }}>
        {title}
      </h3>
      <ul className="list-disc list-inside text-neutral-300 space-y-1">
        {(list || []).map((x, i) => (
          <li key={`${title}-${i}`}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

export function TextCard({ title, text, color }: { title: string; text: string; color: string }) {
  return (
    <div className="bg-[#12111A]/80 border border-[#242335] rounded-2xl p-6 shadow-lg hover:shadow-[#6C63FF]/10 transition-shadow">
      <h3 className="text-lg font-semibold mb-2" style={{ color }}>
        {title}
      </h3>
      <p className="text-neutral-300 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export function ListCard({ title, list, color }: { title: string; list: string[]; color: string }) {
  return (
    <div className="bg-[#12111A]/80 border border-[#242335] rounded-2xl p-6 shadow-lg hover:shadow-[#6C63FF]/10 transition-shadow">
      <h3 className="text-lg font-semibold mb-2" style={{ color }}>
        {title}
      </h3>
      <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
        {(list || []).map((x, i) => (
          <li key={`${title}-${i}`}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
