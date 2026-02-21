function Chip({ children, tone = "default", className = "" }) {
  const tones = {
    default: "border-zinc-200/80 bg-zinc-50 text-zinc-600",
    accent: "border-teal-200/80 bg-teal-50 text-teal-700"
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        tones[tone] || tones.default,
        className
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default Chip;
