function Spinner({ className = "" }) {
  return <span className={["spinner", className].join(" ")} aria-hidden="true" />;
}

export default Spinner;
