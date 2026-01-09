import { Check } from "lucide-react";
import { useState } from "react";

export default function CollapsibleFeatures({ features }: { features: string[] }) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? features : features.slice(0, 4);
  const hiddenCount = features.length - 4;

  return (
    <div className="mb-8">
      <ul className="space-y-3">
        {visible.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="text-[#00F5A0] mt-[2px]" size={18} />
            <span className="text-sm text-neutral-300">{feature}</span>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-[#00F5A0] hover:text-[#00d98b] transition-colors flex items-center gap-1"
        >
          {expanded ? "Show less" : `Show ${hiddenCount} more`}
          <span className={`${expanded ? "rotate-180" : ""} transition-transform`}>
            ▼
          </span>
        </button>
      )}
    </div>
  );
}
