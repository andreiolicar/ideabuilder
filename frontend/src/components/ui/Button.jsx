const variants = {
  primary:
    "bg-teal-700 text-white shadow-sm hover:bg-teal-800 active:bg-teal-900 focus-visible:ring-teal-700/35",
  secondary:
    "bg-white text-zinc-700 border border-zinc-200/80 hover:bg-zinc-50 active:bg-zinc-100 focus-visible:ring-zinc-400/30",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-100/80 active:bg-zinc-200/80 focus-visible:ring-zinc-400/30"
};

function Button({
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium",
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-4",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
