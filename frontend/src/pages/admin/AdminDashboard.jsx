import React, { useEffect, useState } from 'react';
import { getStats, getRequests } from '../../services/api';
import StatCard from '../../components/shared/StatCard';
import PageHeader from '../../components/shared/PageHeader';
import { Table, Th, Td, Tr } from '../../components/shared/Table';

const statusBadge = (s) => {
  const map = { PENDING: 'badge-yellow', ASSIGNED: 'badge-blue', COMPLETED: 'badge-green', CANCELLED: 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

const icons = {
  employees: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  cabs:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  available: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  pending:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  routes:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  total:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {});
    getRequests().then(r => setRequests(r.data.slice(-8).reverse())).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Overview" subtitle="System summary and recent activity" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Employees" value={stats.totalEmployees ?? '–'} icon={icons.employees} />
        <StatCard label="Total Fleet"     value={stats.totalCabs ?? '–'}      icon={icons.cabs} />
        <StatCard label="Available Cabs"  value={stats.availableCabs ?? '–'}  icon={icons.available} />
        <StatCard label="Pending Requests" value={stats.pendingRequests ?? '–'} icon={icons.pending} />
        <StatCard label="Active Routes"   value={stats.activeRoutes ?? '–'}   icon={icons.routes} />
        <StatCard label="Total Requests"  value={stats.totalRequests ?? '–'}  icon={icons.total} />
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>Recent Requests</h2>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Last {requests.length} records</span>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Employee</Th><Th>Pickup Address</Th><Th>Requested Time</Th><Th>Route</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <Tr key={r.id}>
                <Td><span style={{ fontWeight: 500 }}>{r.employee?.name ?? '–'}</span></Td>
                <Td style={{ color: 'var(--text-2)', maxWidth: 220 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.pickupAddress}</span></Td>
                <Td style={{ color: 'var(--text-2)' }}>{r.requestedTime ? new Date(r.requestedTime).toLocaleString() : '–'}</Td>
                <Td style={{ color: 'var(--text-2)' }}>{r.route ? `#${r.route.id}` : '–'}</Td>
                <Td>{statusBadge(r.status)}</Td>
              </Tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No requests found</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
