const variants = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  ghost: "btn--ghost",
  provider: "btn--provider"
};

const sizes = {
  sm: "btn--sm",
  md: "",
  lg: "btn--lg"
};

function Button({
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className = "",
  disabled = false,
  children,
  ...props
}) {
  const resolvedVariant = variants[variant] || variants.primary;
  const resolvedSize = sizes[size] ?? "";
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        "btn",
        resolvedVariant,
        resolvedSize,
        fullWidth ? "btn--full" : "",
        loading ? "btn--loading" : "",
        className
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
