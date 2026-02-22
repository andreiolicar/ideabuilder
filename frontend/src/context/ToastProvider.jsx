import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Toast from "../components/ui/Toast.jsx";
import ToastContext from "./toastContext.js";

const AUTO_CLOSE_MS = 3000;
const EXIT_MS = 220;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const clearTimer = (key) => {
    const timer = timersRef.current.get(key);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(key);
    }
  };

  const removeToast = useCallback((id) => {
    clearTimer(`close-${id}`);
    clearTimer(`remove-${id}`);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissToast = useCallback((id) => {
    clearTimer(`close-${id}`);

    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, closing: true } : toast
      )
    );

    clearTimer(`remove-${id}`);
    const removeTimer = setTimeout(() => removeToast(id), EXIT_MS);
    timersRef.current.set(`remove-${id}`, removeTimer);
  }, [removeToast]);

  const addToast = useCallback(({ title = "Aviso", message, tone = "info" }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setToasts((current) => [
      ...current,
      {
        id,
        title,
        message,
        tone,
        closing: false
      }
    ]);

    const closeTimer = setTimeout(() => dismissToast(id), AUTO_CLOSE_MS);
    timersRef.current.set(`close-${id}`, closeTimer);

    return id;
  }, [dismissToast]);

  const value = useMemo(() => ({ addToast, dismissToast }), [addToast, dismissToast]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            message={toast.message}
            tone={toast.tone}
            closing={toast.closing}
            onClose={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
