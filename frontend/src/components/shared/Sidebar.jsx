import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ links }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logoutUser(); navigate('/login'); };
  const initials = (user?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      width: collapsed ? 60 : 220,
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      transition: 'width 0.2s ease', flexShrink: 0, zIndex: 40,
    }}>
      {/* Logo row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: collapsed ? '0 14px' : '0 16px', height: 56,
        borderBottom: '1px solid var(--border)',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 5v3h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>CorpCab</span>
          </div>
        )}
        {collapsed && (
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h4l3 5v3h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="btn-ghost" style={{ padding: '4px 6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/></svg>
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="btn-ghost" style={{ margin: '8px auto', padding: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 5l7 7-7 7M6 5l7 7-7 7"/></svg>
        </button>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length === 2}
            title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: collapsed ? '8px 0' : '7px 10px',
              borderRadius: 7, marginBottom: 2,
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              color: isActive ? 'var(--text-1)' : 'var(--text-2)',
              background: isActive ? 'var(--bg-3)' : 'transparent',
              transition: 'all 0.15s',
            })}
            onMouseEnter={e => { if (!e.currentTarget.style.background.includes('bg-3')) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.background = e.currentTarget.getAttribute('data-active') === 'true' ? 'var(--bg-3)' : 'transparent'; }}
          >
            <span style={{ flexShrink: 0, color: 'currentColor', opacity: 0.85 }}>{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: collapsed ? '6px 0' : '6px 10px',
          borderRadius: 7, justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: 'white',
          }}>{initials}</div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost"
          style={{ width: '100%', marginTop: 4, justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '6px 0' : '6px 10px', color: 'var(--text-3)', fontSize: 12 }}
          title="Sign out"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
