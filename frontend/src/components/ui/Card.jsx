function Card({
  className = "",
  elevated = false,
  accent = false,
  corners = false,
  children
}) {
  return (
    <div
      className={[
        "card",
        elevated ? "card--elevated" : "",
        accent ? "card--accent" : "",
        corners ? "card--corners" : "",
        className
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export default Card;
