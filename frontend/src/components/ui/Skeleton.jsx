function Skeleton({ className = "" }) {
  return (
    <div
      className={[
        "skeleton",
        className
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
