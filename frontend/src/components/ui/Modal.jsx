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

function Modal({ open, title, onClose, children }) {
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
      if (event.key === "Escape") {
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
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-zinc-950/35 backdrop-blur-[2px] transition-opacity duration-200"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-md transition-all duration-200"
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
