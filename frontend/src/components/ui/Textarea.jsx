function Textarea({
  label,
  helperText,
  error,
  id,
  className = "",
  rows = 4,
  ...props
}) {
  return (
    <label htmlFor={id} className="form-group">
      {label ? <span className="label">{label}</span> : null}
      <textarea
        id={id}
        rows={rows}
        className={[
          "input textarea",
          error ? "input--error" : "",
          className
        ].join(" ")}
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

export default Textarea;
