"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { PLANS } from "./pricing";
import ConfirmModal from "./components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import PricingHeader from "./components/PricingHeader";
import PricingCard from "./components/PricingCard";
import CancelSubscriptionNote from "./components/CancelSubscriptionNote";

type FeedbackColor = "green" | "red" | "yellow";

interface BillingInfoResponse {
  plan_name: string;
  expires_at: string | null;
}

interface SwitchPlanResponse {
  status: string;
  upgraded?: boolean;
  target_plan?: string;
  effective_at?: string | null;
}

interface CancelResponse {
  status: string;
}

// Small helper to keep error messages consistent
function normalizeError(err: any): string {
  if (!err) return "Something went wrong.";
  if (typeof err === "string") return err;
  if (err.detail && typeof err.detail === "string") return err.detail;
  if (err.message && typeof err.message === "string") return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unexpected error occurred.";
  }
}

export default function PricingPage() {
  const { user } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [selectedDowngrade, setSelectedDowngrade] = useState<string | null>(
    null
  );
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
    color?: FeedbackColor;
  }>({ show: false, title: "", description: "", color: "green" });

  // --------------------------------------------------
  // Format date helper
  // --------------------------------------------------
  const formatDate = useCallback((dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // --------------------------------------------------
  // Fetch user plan
  // --------------------------------------------------
  useEffect(() => {
    if (!user) return;
    if (loadedRef.current) return;
    loadedRef.current = true;

    const fetchPlan = async () => {
      try {
        const data = await apiFetch<BillingInfoResponse>(
          "/api/v1/stripe/dashboard"
        );
        if (!data?.plan_name) {
          return;
        }
        setCurrentPlan(data.plan_name.toLowerCase());
        setExpiresAt(data.expires_at);
      } catch (err) {
        console.warn("Failed to fetch billing info", err);
        setFeedback({
          show: true,
          title: "Billing Info Unavailable",
          description:
            normalizeError(err) ||
            "We couldn't load your current plan details. You can still change plans below.",
          color: "yellow",
        });
      }
    };

    fetchPlan();
  }, [user, formatDate]);

  // --------------------------------------------------
  // Plan change logic
  // --------------------------------------------------
  const handlePlanChange = useCallback(
    async (planName: string) => {
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
        const data = await apiFetch<SwitchPlanResponse>(
          `/api/v1/billing/switch_plan/${planSlug}`,
          {
            method: "POST",
          }
        );

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
            normalizeError(err) ||
            "Something went wrong while updating your plan.",
          color: "red",
        });
      } finally {
        setLoadingPlan(null);
      }
    },
    [currentPlan, user]
  );

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
      const data = await apiFetch<CancelResponse>(
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
          normalizeError(err) ||
          "Failed to cancel subscription. Try again later.",
        color: "red",
      });
    } finally {
      setCanceling(false);
    }
  };

  // --------------------------------------------------
  // Handle card click (upgrade / downgrade / free behavior)
  // --------------------------------------------------
  const handlePlanCardClick = (planName: string) => {
    const currentObj = PLANS.find(
      (p) => p.name.toLowerCase() === currentPlan
    );
    const currentPrice = currentObj?.price ?? 0;
    const target = PLANS.find((p) => p.name === planName);
    const targetPrice = target?.price ?? 0;

    // Free or no active plan → direct change
    if (!currentPlan || currentPlan === "free") {
      handlePlanChange(planName);
      return;
    }

    const isUpgrade = targetPrice > currentPrice;
    const isDowngrade = targetPrice < currentPrice;

    if (isDowngrade) {
      setSelectedDowngrade(planName);
      setShowDowngradeModal(true);
      return;
    }

    if (isUpgrade) {
      setSelectedUpgrade(planName);
      setShowUpgradeModal(true);
      return;
    }

    // same tier / unknown → just try changing
    handlePlanChange(planName);
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0F0E17] text-white flex flex-col items-center py-8 px-4 sm:px-6 lg:px-10">
      {/* Header */}
      <PricingHeader
        currentPlan={currentPlan}
        expiresAt={expiresAt}
        formatDate={formatDate}
      />

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {PLANS.map((plan, index) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            index={index}
            currentPlan={currentPlan}
            loadingPlan={loadingPlan}
            userPresent={!!user}
            onSelectPlan={handlePlanCardClick}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-10 w-full max-w-6xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center sm:px-6">
          <p className="text-md text-neutral-300">
            Have questions or need a{" "}
            <span className="font-semibold text-white">custom enterprise plan</span>?
          </p>

          <a
            href="mailto:contact@burnzy.co"
            className="mt-2 inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15 hover:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          >
            contact@burnzy.co
          </a>
        </div>
      </footer>

      {/* Cancel subscription link */}
      <CancelSubscriptionNote
        shouldShow={!!user && !!currentPlan && currentPlan !== "free"}
        onClick={() => setShowCancelModal(true)}
      />

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

      {/* Upgrade Modal */}
      <ConfirmModal
        show={showUpgradeModal}
        onCancel={() => setShowUpgradeModal(false)}
        onConfirm={handleConfirmedUpgrade}
        confirmText="Yes, Upgrade"
        title="Upgrade your plan?"
        description="Upgrading now will give you immediate access to the selected plan. A prorated charge for the upgrade will be applied immediately."
        loading={loadingPlan !== null}
        confirmColor="green"
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
