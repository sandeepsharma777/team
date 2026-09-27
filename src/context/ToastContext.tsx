import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; message?: string; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      type = 'success',
      title,
      message,
      duration = 4000,
    }: {
      type?: ToastType;
      title: string;
      message?: string;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: 'success', title, message }),
    [addToast]
  );
  const error = useCallback(
    (title: string, message?: string) => addToast({ type: 'error', title, message }),
    [addToast]
  );
  const info = useCallback(
    (title: string, message?: string) => addToast({ type: 'info', title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
              t.type === 'success'
                ? 'bg-[#09150e]/95 border-[#22e873]/40 text-white shadow-[0_0_25px_rgba(34,232,115,0.2)]'
                : t.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-white shadow-[0_0_25px_rgba(244,63,94,0.2)]'
                : 'bg-zinc-950/90 border-zinc-700 text-white shadow-xl'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#22e873]" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold leading-snug">{t.title}</h4>
              {t.message && (
                <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
