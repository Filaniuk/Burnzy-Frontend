"use client";

interface CancelSubscriptionNoteProps {
  shouldShow: boolean;
  onClick: () => void;
}

export default function CancelSubscriptionNote({
  shouldShow,
  onClick,
}: CancelSubscriptionNoteProps) {
  if (!shouldShow) return null;

  return (
    <p className="text-neutral-500 text-sm mt-4 text-center">
      To cancel your subscription,{" "}
      <span
        onClick={onClick}
        className="text-[#00F5A0] hover:underline cursor-pointer"
      >
        click here
      </span>
    </p>
  );
}
