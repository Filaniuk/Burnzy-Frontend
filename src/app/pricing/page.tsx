"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { PLANS } from "./pricing";
import ConfirmModal from "./components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import CollapsibleFeatures from "./components/CollapsibleFeature";

export default function PricingPage() {
  const { user } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [selectedDowngrade, setSelectedDowngrade] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // ✅ Unified feedback modal
  const [feedback, setFeedback] = useState<{
    show: boolean;
    title: string;
    description: string;
    color?: "green" | "red" | "yellow";
  }>({ show: false, title: "", description: "", color: "green" });

  // --------------------------------------------------
  // Fetch user plan
  // --------------------------------------------------
  useEffect(() => {
    if (!user) return;
    const fetchPlan = async () => {
      try {
        const data = await apiFetch<{ plan_name: string; expires_at: string | null }>(
          "/api/v1/stripe/dashboard"
        );
        setCurrentPlan(data.plan_name.toLowerCase());
        setExpiresAt(data.expires_at);
      } catch (err) {
        console.warn("Failed to fetch billing info", err);
      }
    };
    fetchPlan();
  }, [user]);

  // --------------------------------------------------
  // Plan switching logic
  // --------------------------------------------------
  const handlePlanChange = async (planName: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const plan = planName.toLowerCase();
    try {
      setLoadingPlan(planName);

      // Free → Paid
      if (!currentPlan || currentPlan === "free") {
        const data = await apiFetch<{ checkout_url?: string }>(
          `/api/v1/billing/create_checkout_session/${plan}`,
          { method: "POST" }
        );
        if (data.checkout_url) window.location.href = data.checkout_url;
        return;
      }

      // Already on same plan
      if (currentPlan === plan) {
        setFeedback({
          show: true,
          title: "Already on this plan",
          description: `You're already subscribed to the ${planName} plan.`,
          color: "yellow",
        });
        return;
      }

      // Switch plan
      const data = await apiFetch<any>(`/api/v1/billing/switch_plan/${plan}`, {
        method: "POST",
      });

      if (data.status === "requires_checkout") {
        const checkoutData = await apiFetch<{ checkout_url?: string }>(
          `/api/v1/billing/create_checkout_session/${plan}`,
          { method: "POST" }
        );
        if (checkoutData.checkout_url)
          window.location.href = checkoutData.checkout_url;
        return;
      }

      if (data.status === "success" && data.downgraded) {
        setFeedback({
          show: true,
          title: "Plan Downgraded",
          description: `Successfully downgraded to the ${planName} plan.`,
          color: "green",
        });
        setCurrentPlan(plan);
        return;
      }

      setFeedback({
        show: true,
        title: "Plan Updated",
        description: `Your plan has been updated to ${planName}.`,
        color: "green",
      });
      setCurrentPlan(plan);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        show: true,
        title: "Error Updating Plan",
        description:
          err.message || "Something went wrong while updating your plan.",
        color: "red",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const confirmDowngrade = (planName: string) => {
    setSelectedDowngrade(planName);
    setShowDowngradeModal(true);
  };

  const handleConfirmedDowngrade = async () => {
    if (!selectedDowngrade) return;
    setShowDowngradeModal(false);
    await handlePlanChange(selectedDowngrade);
  };

  // --------------------------------------------------
  // Cancel subscription
  // --------------------------------------------------
  const handleCancelSubscription = async () => {
    if (!user) return;
    try {
      setCanceling(true);
      await apiFetch("/api/v1/billing/cancel_subscription", { method: "POST" });

      setFeedback({
        show: true,
        title: "Subscription Canceled",
        description:
          "Your subscription has been canceled and downgraded to Free.",
        color: "green",
      });
      setShowCancelModal(false);
      setCurrentPlan("free");
    } catch (err: any) {
      console.error(err);
      setFeedback({
        show: true,
        title: "Cancel Failed",
        description:
          err.message || "Failed to cancel subscription. Try again later.",
        color: "red",
      });
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0F0E17] text-white flex flex-col items-center py-16 px-4 sm:px-6 lg:px-10">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 max-w-2xl"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
          Pricing Plans
        </h1>
        <p className="text-neutral-400 mt-3 text-sm sm:text-base">
          Choose the plan that fits your content creation needs.
        </p>
        {currentPlan && (
          <p className="mt-2 text-sm text-neutral-400">
            Current plan:{" "}
            <span className="text-[#00F5A0] font-medium capitalize">
              {currentPlan}
            </span>
            {expiresAt && (
              <>
                {" "}· Renewal:{" "}
                <span className="text-[#00F5A0] font-medium">
                  {formatDate(expiresAt)}
                </span>
              </>
            )}
          </p>
        )}
      </motion.header>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {PLANS.map((plan, index) => {
          const isCurrent = currentPlan === plan.name.toLowerCase();

          const handleClick = () => {
            if (currentPlan === "business" && plan.name.toLowerCase() === "pro") {
              confirmDowngrade(plan.name);
            } else {
              handlePlanChange(plan.name);
            }
          };

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

              {/* Buttons */}
              {plan.name === "Free" ? (
                <button
                  onClick={() =>
                    (window.location.href = user ? "/auth/dashboard" : "/login")
                  }
                  className="w-full py-3 rounded-xl font-semibold transition bg-white/10 hover:bg-white/20 text-white"
                >
                  {user ? "Go to Dashboard" : "Start for Free"}
                </button>
              ) : (
                <button
                  onClick={handleClick}
                  disabled={loadingPlan === plan.name || isCurrent}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-[#00F5A0] text-black hover:bg-[#00d98b]"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  } ${loadingPlan === plan.name ? "opacity-60" : ""}`}
                >
                  {isCurrent
                    ? "Current Plan"
                    : loadingPlan === plan.name
                    ? "Processing..."
                    : plan.buttonText}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="text-neutral-500 text-sm mt-10 text-center">
        Need a custom enterprise plan?{" "}
        <a
          href="mailto:sales@contentai.com"
          className="text-[#00F5A0] hover:underline"
        >
          Contact us
        </a>
      </footer>

      {/* Cancel subscription link */}
      {user && currentPlan && currentPlan !== "free" && (
        <p className="text-neutral-500 text-sm mt-4 text-center">
          To cancel your subscription,{" "}
          <span
            onClick={() => setShowCancelModal(true)}
            className="text-[#00F5A0] hover:underline cursor-pointer"
          >
            click here
          </span>
        </p>
      )}

      {/* Modals */}
      <ConfirmModal
        show={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        confirmText="Yes, Cancel"
        title="Cancel your subscription?"
        description="You’ll lose access to exclusive features immediately after canceling."
        loading={canceling}
        confirmColor="red"
      />

      <ConfirmModal
        show={showDowngradeModal}
        onCancel={() => setShowDowngradeModal(false)}
        onConfirm={handleConfirmedDowngrade}
        confirmText="Yes, Downgrade"
        title="Downgrade your plan?"
        description="Your current billing cycle and features will remain until expiry. Downgrade now?"
        loading={loadingPlan !== null}
        confirmColor="red"
      />

      {/* Feedback modal for success/error */}
      <ConfirmModal
        show={feedback.show}
        onCancel={() => setFeedback({ ...feedback, show: false })}
        onConfirm={() => setFeedback({ ...feedback, show: false })}
        confirmText="OK"
        title={feedback.title}
        description={feedback.description}
        confirmColor={feedback.color}
      />
    </div>
  );
}
