function Toast({ title = "Aviso", message, tone = "info", closing = false, onClose }) {
  const toneClass = {
    success: "toast--success",
    error: "toast--error",
    warning: "toast--warning",
    info: "toast--info"
  }[tone] || "toast--info";

  return (
    <div
      className={[
        "toast",
        toneClass,
        closing ? "toast-exit" : "toast-enter"
      ].join(" ")}
      role="status"
    >
      <button
        type="button"
        className="toast-close"
        aria-label="Fechar notificacao"
        onClick={onClose}
      >
        x
      </button>
      <div>
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
}

export default Toast;
