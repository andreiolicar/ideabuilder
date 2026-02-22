function Input({
  label,
  helperText,
  error,
  id,
  className = "",
  ...props
}) {
  return (
    <label htmlFor={id} className="form-group">
      {label ? <span className="label">{label}</span> : null}
      <input
        id={id}
        className={["input", error ? "input--error" : "", className].join(" ")}
        {...props}
      />
      {error ? (
        <span className="form-error">{error}</span>
      ) : helperText ? (
        <span className="form-hint">{helperText}</span>
      ) : null}
    </label>
  );
}

export default Input;
