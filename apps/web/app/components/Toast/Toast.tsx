"use client";
import React from 'react';
import { useToast } from './ToastContext';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="mb-6 transform transition-all duration-300 ease-in-out relative"
          style={{
            backgroundImage: 'url("/ancientframe.png")',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            minWidth: '280px',
            maxWidth: '320px',
          }}
        >
          <div 
            className="p-6 pt-7 pb-7"
            style={{
              backgroundImage: `linear-gradient(rgba(245, 222, 179, 0.9), rgba(205, 175, 149, 0.95))`,
            }}
          >
            <div className="flex justify-between items-center">
              <div className={`mr-2 ${
                toast.type === 'success'
                  ? 'text-emerald-800'
                  : toast.type === 'error'
                  ? 'text-amber-900'
                  : toast.type === 'warning'
                  ? 'text-amber-700'
                  : 'text-indigo-900'
              }`}>
                {toast.type === 'success' && (
                  <span className="text-xl">✓</span>
                )}
                {toast.type === 'error' && (
                  <span className="text-xl">✕</span>
                )}
                {toast.type === 'warning' && (
                  <span className="text-xl">!</span>
                )}
                {toast.type === 'info' && (
                  <span className="text-xl">i</span>
                )}
              </div>
              <p className="text-sm font-medium text-black flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-black hover:text-amber-900 transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>
          </div>
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("/parchedbackground.jpg")`,
              backgroundSize: 'cover',
              backgroundBlendMode: 'overlay',
              opacity: 0.15,
              mixBlendMode: 'overlay',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;