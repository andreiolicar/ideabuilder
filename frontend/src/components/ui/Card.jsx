function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-sm backdrop-blur",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default Card;
