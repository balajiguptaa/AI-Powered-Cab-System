import React, { useEffect } from 'react';

export default function Modal({ title, subtitle, onClose, children, width = 480 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: 16,
      animation: 'fadeIn 0.15s ease',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: width,
        background: 'var(--bg-2)', border: '1px solid var(--border-2)',
        borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 6px', flexShrink: 0, marginTop: -2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
