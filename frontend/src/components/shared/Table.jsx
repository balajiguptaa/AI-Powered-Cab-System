import React from 'react';

export function Table({ children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>{children}</table>
    </div>
  );
}

export function Th({ children, style = {} }) {
  return (
    <th style={{
      padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
      color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em',
      borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', ...style
    }}>{children}</th>
  );
}

export function Td({ children, style = {} }) {
  return (
    <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-1)', borderBottom: '1px solid var(--border)', ...style }}>{children}</td>
  );
}

export function Tr({ children, onClick }) {
  return (
    <tr onClick={onClick} style={{ transition: 'background 0.1s', cursor: onClick ? 'pointer' : undefined }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</tr>
  );
}
