import React from 'react';

export default function StatCard({ label, value, icon, delta, deltaLabel }) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        {icon && (
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
            {icon}
          </div>
        )}
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      {delta !== undefined && (
        <p style={{ marginTop: 6, fontSize: 12, color: delta >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {delta >= 0 ? '+' : ''}{delta} {deltaLabel}
        </p>
      )}
    </div>
  );
}
