function Input({
  label,
  helperText,
  error,
  id,
  className = "",
  ...props
}) {
  return (
    <label htmlFor={id} className="flex w-full flex-col gap-1.5">
      {label ? (
        <span className="text-sm font-medium text-zinc-700">{label}</span>
      ) : null}
      <input
        id={id}
        className={[
          "h-11 rounded-2xl border border-zinc-200/80 bg-white px-3.5 text-sm text-zinc-900 shadow-sm",
          "placeholder:text-zinc-400 transition-all duration-200",
          "focus-visible:border-teal-700/60 focus-visible:ring-4 focus-visible:ring-teal-700/20 focus-visible:outline-none",
          error ? "border-rose-300 focus-visible:ring-rose-400/20" : "",
          className
        ].join(" ")}
        {...props}
      />
      {error ? (
        <span className="text-xs text-rose-600">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-zinc-500">{helperText}</span>
      ) : null}
    </label>
  );
}

export default Input;
