function Toast({ message, visible }) {
  return (
    <div
      className={[
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-zinc-200/80",
        "bg-white/95 px-4 py-2 text-sm text-zinc-700 shadow-md backdrop-blur transition-all duration-200",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

export default Toast;
