import { useEffect, useRef } from "react";

function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ];

  return Array.from(container.querySelectorAll(selectors.join(",")));
}

function Modal({
  open,
  title,
  onClose,
  children,
  className = "",
  closeOnBackdrop = true,
  closeOnEscape = true
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const panel = panelRef.current;
    const focusables = getFocusableElements(panel);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && closeOnEscape && onClose) {
        onClose();
      }

      if (event.key === "Tab" && focusables.length > 1) {
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, closeOnEscape]);

  return (
    <div
      className={["modal-backdrop", open ? "modal-backdrop-open" : "modal-backdrop-closed"].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label={title}
    >
      <div
        className="absolute inset-0"
        onClick={open && closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={panelRef}
        className={["modal card--corners", open ? "modal-open" : "modal-closed", className].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
