function Skeleton({ className = "" }) {
  return (
    <div
      className={[
        "animate-pulse rounded-2xl bg-zinc-200/80",
        className
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
