"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);

  const loadedRef = useRef(false);

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
    if (loadedRef.current) return;
    loadedRef.current = true;

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

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // --------------------------------------------------
  // Plan change logic
  // --------------------------------------------------
  const handlePlanChange = async (planName: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const planSlug = planName.toLowerCase();

    try {
      setLoadingPlan(planName);

      // Free → Paid (no active subscription)
      if (!currentPlan || currentPlan === "free") {
        const data = await apiFetch<{ checkout_url?: string }>(
          `/api/v1/billing/create_checkout_session/${planSlug}`,
          { method: "POST" }
        );
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
        return;
      }

      // Already on this plan
      if (currentPlan === planSlug) {
        setFeedback({
          show: true,
          title: "Already on this plan",
          description: `You're already subscribed to the ${planName} plan.`,
          color: "yellow",
        });
        return;
      }

      // Paid → Paid (upgrade or downgrade)
      const data = await apiFetch<{
        status: string;
        upgraded?: boolean;
        target_plan?: string;
        effective_at?: string | null;
      }>(`/api/v1/billing/switch_plan/${planSlug}`, {
        method: "POST",
      });

      if (data.status === "no_change") {
        setFeedback({
          show: true,
          title: "No change",
          description: "Your subscription is already on this plan.",
          color: "yellow",
        });
        return;
      }

      if (data.status === "success") {
        const upgraded = !!data.upgraded;

        setFeedback({
          show: true,
          title: upgraded ? "Plan upgraded" : "Plan downgraded",
          description: upgraded
            ? `Your subscription has been upgraded to ${planName}.`
            : `Your subscription has been downgraded to ${planName}. Billing is adjusted pro-rata according to our Cancellation & Refund Policy.`,
          color: "green",
        });

        setCurrentPlan(planSlug);
        if (data.effective_at) {
          setExpiresAt(data.effective_at);
        }
        return;
      }

      // Fallback
      setFeedback({
        show: true,
        title: "Plan update",
        description: `Your plan update request was processed.`,
        color: "green",
      });
      setCurrentPlan(planSlug);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        show: true,
        title: "Error Updating Plan",
        description:
          err?.message || "Something went wrong while updating your plan.",
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

  const handleConfirmedUpgrade = async () => {
    if (!selectedUpgrade) return;
    setShowUpgradeModal(false);
    await handlePlanChange(selectedUpgrade);
  };


  // --------------------------------------------------
  // Cancel subscription (at period end)
  // --------------------------------------------------
  const handleCancelSubscription = async () => {
    if (!user) return;
    try {
      setCanceling(true);
      const data = await apiFetch<{ status: string }>(
        "/api/v1/billing/cancel_subscription",
        { method: "POST" }
      );

      if (data.status === "canceled_scheduled") {
        setFeedback({
          show: true,
          title: "Cancellation Scheduled",
          description: expiresAt
            ? `Your subscription will end on ${formatDate(
              expiresAt
            )}. You will keep access to paid features until then.`
            : "Your subscription will be canceled at the end of your current billing period. You will keep access to paid features until then.",
          color: "green",
        });
      } else {
        setFeedback({
          show: true,
          title: "Subscription Updated",
          description:
            "Your subscription cancellation has been requested. You will keep access until the end of your billing period.",
          color: "green",
        });
      }

      setShowCancelModal(false);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        show: true,
        title: "Cancel Failed",
        description:
          err?.message || "Failed to cancel subscription. Try again later.",
        color: "red",
      });
    } finally {
      setCanceling(false);
    }
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
                {" "}
                · Renewal / End:{" "}
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
          const currentObj = PLANS.find(
            (p) => p.name.toLowerCase() === currentPlan
          );
          const currentPrice = currentObj?.price ?? 0;
          const isUpgrade = plan.price > currentPrice;
          const isDowngrade = plan.price < currentPrice;

          const handleClick = () => {
            if (!currentPlan || currentPlan === "free") {
              handlePlanChange(plan.name);
              return;
            }
            if (isDowngrade) {
              confirmDowngrade(plan.name);
              return;
            }

            // NEW — handle upgrades via modal
            if (isUpgrade) {
              setSelectedUpgrade(plan.name);
              setShowUpgradeModal(true);
              return;
            }

            handlePlanChange(plan.name);

          };

          // Button text + style
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
                ${plan.highlight
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
                    (window.location.href = user ? "/dashboard" : "/login")
                  }
                  className="w-full py-3 rounded-xl font-semibold transition bg-white/10 hover:bg-white/20 text-white"
                >
                  {user ? "Go to Dashboard" : "Start for Free"}
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
        })}
      </div>

      {/* Footer */}
      <footer className="text-neutral-500 text-sm mt-10 text-center">
        Need a custom enterprise plan?{" "}
        <a
          href="mailto:contact@burnzy.co"
          className="text-[#00F5A0] hover:underline"
        >
          contact@burnzy.co
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

      {/* Cancel Modal */}
      <ConfirmModal
        show={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        confirmText="Yes, Cancel"
        title="Cancel your subscription?"
        description="Your subscription will remain active until the end of your current billing period. You’ll keep access to paid features until then, and your plan will not renew afterward."
        loading={canceling}
        confirmColor="red"
      />

      <ConfirmModal
        show={showUpgradeModal}
        onCancel={() => setShowUpgradeModal(false)}
        onConfirm={handleConfirmedUpgrade}
        confirmText="Yes, Upgrade"
        title="Upgrade your plan?"
        description="Upgrading now will give you immediate access to the selected plan. A prorated charge for the upgrade will be applied immediately."
        loading={loadingPlan !== null}
        confirmColor="#00F5A0"
      />


      {/* Downgrade Modal */}
      <ConfirmModal
        show={showDowngradeModal}
        onCancel={() => setShowDowngradeModal(false)}
        onConfirm={handleConfirmedDowngrade}
        confirmText="Yes, Downgrade"
        title="Downgrade your plan?"
        description="Your plan will change immediately. Higher-tier features will be removed now. Any price difference will be prorated and credited to your next invoice."
        loading={loadingPlan !== null}
        confirmColor="red"
      />


      {/* Feedback Modal */}
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
