"use client";

import { motion } from "framer-motion";
import CollapsibleFeatures from "./CollapsibleFeature";
import { PLANS } from "../pricing";

type Plan = (typeof PLANS)[number];

interface PricingCardProps {
  plan: Plan;
  index: number;
  currentPlan: string | null;
  loadingPlan: string | null;
  userPresent: boolean;
  onSelectPlan: (planName: string) => void;
}

export default function PricingCard({
  plan,
  index,
  currentPlan,
  loadingPlan,
  userPresent,
  onSelectPlan,
}: PricingCardProps) {
  const isCurrent = currentPlan === plan.name.toLowerCase();
  const currentObj = PLANS.find((p) => p.name.toLowerCase() === currentPlan);
  const currentPrice = currentObj?.price ?? 0;
  const isUpgrade = plan.price > currentPrice;
  const isDowngrade = plan.price < currentPrice;

  const handleClick = () => {
    onSelectPlan(plan.name);
  };

  // Button text + style (same logic as before)
  let label = "";
  let style = "";

  if (isCurrent) {
    label = "Current Plan";
    style = "bg-white/10 text-neutral-400 cursor-not-allowed";
  } else if (loadingPlan === plan.name) {
    label = "Processing...";
    style = "bg-white/20 text-white opacity-60";
  } else if (!currentPlan || currentPlan === "free" || isUpgrade) {
    label = `Upgrade to ${plan.name}`;
    style = "bg-[#00F5A0] text-black hover:bg-[#00d98b]";
  } else if (isDowngrade) {
    label = `Downgrade to ${plan.name}`;
    style = "bg-red-600 text-white hover:bg-red-700";
  }

  return (
    <motion.div
      key={plan.name}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      className={`rounded-2xl p-8 flex flex-col justify-between shadow-lg border 
        ${
          plan.highlight
            ? "border-[#00F5A0] bg-[#16151E]"
            : "border-[#1F1E29] bg-[#12111A]"
        } hover:scale-[1.02] transition-transform`}
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
        <p className="text-neutral-400 mb-6 text-sm sm:text-base">
          {plan.description}
        </p>
        <div className="flex items-baseline mb-6">
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-neutral-400 ml-2">/month</span>
        </div>

        <CollapsibleFeatures features={plan.features} />
      </div>

      {plan.name === "Free" ? (
        <button
          onClick={() =>
            (window.location.href = userPresent ? "/dashboard" : "/login")
          }
          className="w-full py-3 rounded-xl font-semibold transition bg-white/10 hover:bg-white/20 text-white"
        >
          {userPresent ? "Go to Dashboard" : "Start for Free"}
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={isCurrent || loadingPlan === plan.name}
          className={`w-full py-3 rounded-xl font-semibold transition-colors ${style}`}
        >
          {label}
        </button>
      )}
    </motion.div>
  );
}
