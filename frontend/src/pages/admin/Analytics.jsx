import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDemand, getRoutes, getCabs, getRequests } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

const CHART_COLORS = ['#4f6ef7','#22c55e','#f59e0b','#ef4444','#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--text-2)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function Analytics() {
  const [demand, setDemand] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getDemand().then(r => setDemand(r.data)).catch(() => {});
    getRoutes().then(r => setRoutes(r.data)).catch(() => {});
    getCabs().then(r => setCabs(r.data)).catch(() => {});
    getRequests().then(r => setRequests(r.data)).catch(() => {});
  }, []);

  const statusData = ['PENDING','ASSIGNED','COMPLETED','CANCELLED'].map(s => ({
    name: s, value: requests.filter(r => r.status === s).length,
  })).filter(s => s.value > 0);

  const fleetData = Object.entries(cabs.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1; return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const routeDist = routes.slice(0, 6).map(r => ({
    name: `R${r.id}`, distance: r.totalDistance, stops: r.stops?.length ?? 0,
  }));

  const totalKm = routes.reduce((s, r) => s + (r.totalDistance || 0), 0).toFixed(1);

  const kpiCards = [
    { label: 'Total Routes', value: routes.length },
    { label: 'Distance Covered', value: `${totalKm} km` },
    { label: 'Total Requests', value: requests.length },
    { label: 'Fleet Size', value: cabs.length },
  ];

  const empty = (msg) => (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>{msg}</div>
  );

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Usage patterns, route efficiency, and fleet data" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {kpiCards.map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Request Demand by Time Slot</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Historical request frequency per hour</p>
          {demand.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={demand} barSize={24}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="slot" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#4f6ef7" radius={[3, 3, 0, 0]} name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          ) : empty('No demand data yet — submit requests to see patterns')}
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Request Status Distribution</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Breakdown by current status</p>
          {statusData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie></PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {statusData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', marginLeft: 'auto' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : empty('No request data available')}
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Route Distances</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Total distance per generated route (km)</p>
          {routeDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={routeDist} barSize={20}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="distance" fill="#22c55e" radius={[3, 3, 0, 0]} name="Distance (km)" />
              </BarChart>
            </ResponsiveContainer>
          ) : empty('No routes generated yet')}
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Fleet Composition</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Vehicle types in the fleet</p>
          {fleetData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fleetData.map((d, i) => (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{d.value}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-3)' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: CHART_COLORS[i], width: `${(d.value / cabs.length) * 100}%`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : empty('No fleet data')}
        </div>
      </div>
    </div>
  );
}
