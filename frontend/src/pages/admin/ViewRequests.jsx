import React, { useEffect, useState } from 'react';
import { getRequests, updateRequestStatus } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { Table, Th, Td, Tr } from '../../components/shared/Table';

const TABS = ['ALL','PENDING','ASSIGNED','COMPLETED','CANCELLED'];
const statusBadge = (s) => {
  const map = { PENDING:'badge-yellow', ASSIGNED:'badge-blue', COMPLETED:'badge-green', CANCELLED:'badge-red' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s}</span>;
};

export default function ViewRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const load = () => getRequests().then(r => setRequests(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);
  const count = (s) => s === 'ALL' ? requests.length : requests.filter(r => r.status === s).length;

  return (
    <div>
      <PageHeader title="Requests" subtitle={`${requests.length} total requests`} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 18, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 3, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: filter === t ? 'var(--bg-3)' : 'transparent',
            color: filter === t ? 'var(--text-1)' : 'var(--text-3)',
            border: filter === t ? '1px solid var(--border-2)' : '1px solid transparent',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {t} <span style={{ opacity: 0.6, marginLeft: 2 }}>{count(t)}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <Table>
          <thead>
            <tr><Th>ID</Th><Th>Employee</Th><Th>Pickup</Th><Th>Requested Time</Th><Th>Route</Th><Th>Status</Th><Th></Th></tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <Tr key={r.id}>
                <Td><span style={{ fontFamily: 'monospace', color: 'var(--text-3)', fontSize: 12 }}>#{r.id}</span></Td>
                <Td><span style={{ fontWeight: 500 }}>{r.employee?.name}</span></Td>
                <Td style={{ color: 'var(--text-2)', maxWidth: 200 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.pickupAddress}</span></Td>
                <Td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{r.requestedTime ? new Date(r.requestedTime).toLocaleString() : '–'}</Td>
                <Td style={{ color: 'var(--text-2)' }}>{r.route ? `Route #${r.route.id}` : '–'}</Td>
                <Td>{statusBadge(r.status)}</Td>
                <Td>{r.status === 'PENDING' && <button className="btn-danger" onClick={() => updateRequestStatus(r.id,'CANCELLED').then(load)}>Cancel</button>}</Td>
              </Tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)' }}>No requests found</td></tr>}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
