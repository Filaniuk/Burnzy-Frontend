export default function EmptyState({ label, action, onClick }) {
  return (
    <div className="text-center mb-12">
      <p className="text-neutral-400 mb-3">{label}</p>
      <button
        onClick={onClick}
        className="text-[#6C63FF] underline text-sm"
      >
        {action} →
      </button>
    </div>
  );
}