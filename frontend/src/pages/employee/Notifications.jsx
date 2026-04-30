import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getNotifications, markRead, markAllRead } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

const typeStyle = {
  SUCCESS: { bg: 'rgba(34,197,94,0.07)', border: 'rgba(34,197,94,0.2)', color: '#4ade80' },
  INFO:    { bg: 'rgba(79,110,247,0.07)', border: 'rgba(79,110,247,0.2)', color: '#818cf8' },
  WARNING: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
};

const TypeIcon = ({ type }) => {
  if (type === 'SUCCESS') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
  if (type === 'WARNING') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
};

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const load = () => { if (user?.userId) getNotifications(user.userId).then(r => setItems(r.data)).catch(() => {}); };
  useEffect(() => { load(); }, [user]);

  const unread = items.filter(n => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        action={unread > 0 && (
          <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => markAllRead(user.userId).then(load)}>
            Mark all read
          </button>
        )}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
        {items.map(n => {
          const style = typeStyle[n.type] || typeStyle.INFO;
          return (
            <div key={n.id} style={{
              padding: '14px 16px', borderRadius: 9,
              background: n.read ? 'var(--bg-2)' : style.bg,
              border: `1px solid ${n.read ? 'var(--border)' : style.border}`,
              display: 'flex', alignItems: 'flex-start', gap: 12,
              opacity: n.read ? 0.6 : 1, transition: 'opacity 0.2s',
            }}>
              <div style={{ color: style.color, flexShrink: 0, marginTop: 1 }}>
                <TypeIcon type={n.type} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: 'var(--text-1)', margin: 0 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </p>
              </div>
              {!n.read && (
                <button className="btn-ghost" style={{ fontSize: 11, flexShrink: 0, padding: '4px 8px' }} onClick={() => markRead(n.id).then(load)}>
                  Dismiss
                </button>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
