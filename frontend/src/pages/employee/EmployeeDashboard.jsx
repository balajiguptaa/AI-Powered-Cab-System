import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMyRequests, getUnreadCount, getEmployeeByUser } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';
import { Table, Th, Td, Tr } from '../../components/shared/Table';
import { useNavigate } from 'react-router-dom';

const statusBadge = (s) => {
  const map = { PENDING:'badge-yellow', ASSIGNED:'badge-blue', COMPLETED:'badge-green', CANCELLED:'badge-red' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s}</span>;
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user?.userId) return;
    getEmployeeByUser(user.userId).then(r => {
      setEmployee(r.data);
      return getMyRequests(r.data.id);
    }).then(r => setRequests(r.data)).catch(() => {});
    getUnreadCount(user.userId).then(r => setUnread(r.data.count)).catch(() => {});
  }, [user]);

  const latest = [...requests].reverse()[0];

  return (
    <div>
      <PageHeader title={`Hello, ${employee?.name?.split(' ')[0] ?? user?.username}`} subtitle="Here's your transport summary" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Rides', value: requests.length },
          { label: 'Pending', value: requests.filter(r => r.status === 'PENDING').length },
          { label: 'Notifications', value: unread },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{value}</p>
          </div>
        ))}
      </div>

      {latest && latest.status === 'ASSIGNED' && latest.route && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: 20, borderColor: 'rgba(79,110,247,0.3)', cursor: 'pointer' }} onClick={() => navigate('/employee/track')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Active Ride</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{latest.pickupAddress}</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
                {latest.route?.cab?.number} &middot; {latest.route?.cab?.driverName} &middot; {latest.route?.cab?.driverPhone}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge badge-blue">ASSIGNED</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>Ride History</p>
        </div>
        <Table>
          <thead>
            <tr><Th>Pickup</Th><Th>Requested Time</Th><Th>Vehicle</Th><Th>Status</Th></tr>
          </thead>
          <tbody>
            {[...requests].reverse().map(r => (
              <Tr key={r.id}>
                <Td style={{ maxWidth: 220 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.pickupAddress}</span></Td>
                <Td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{r.requestedTime ? new Date(r.requestedTime).toLocaleString() : '–'}</Td>
                <Td style={{ color: 'var(--text-2)', fontFamily: 'monospace' }}>{r.route?.cab?.number ?? '–'}</Td>
                <Td>{statusBadge(r.status)}</Td>
              </Tr>
            ))}
            {requests.length === 0 && <tr><td colSpan="4" style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)' }}>No rides yet</td></tr>}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
