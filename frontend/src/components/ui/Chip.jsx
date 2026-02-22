function Chip({ children, tone = "default", className = "" }) {
  const tones = {
    default: "badge--default",
    accent: "badge--accent",
    success: "badge--success",
    warning: "badge--warning",
    error: "badge--error",
    info: "badge--info"
  };

  return (
    <span
      className={[
        "badge",
        tones[tone] || tones.default,
        className
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default Chip;
