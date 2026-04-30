import React, { useState, useEffect } from 'react';
import { runOptimization, getPendingRequests, getCabs } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

const STEPS = [
  { n: 1, title: 'Fetch Pending Requests', desc: 'Retrieve all requests with PENDING status' },
  { n: 2, title: 'K-Means Clustering', desc: 'Group employees by geographic proximity' },
  { n: 3, title: 'Nearest Neighbor Routing', desc: 'Minimize total travel distance per cluster' },
  { n: 4, title: 'Cab Allocation', desc: 'Assign best-fit available vehicle per route' },
  { n: 5, title: 'Persist & Notify', desc: 'Save routes and notify assigned employees' },
];

export default function OptimizationPage() {
  const [pending, setPending] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    getPendingRequests().then(r => setPending(r.data)).catch(() => {});
    getCabs().then(r => setCabs(r.data)).catch(() => {});
  }, []);

  const handleRun = async () => {
    if (!pending.length) { setError('No pending requests to process.'); return; }
    setLoading(true); setError(''); setResult(null); setActiveStep(0);
    // Animate steps
    for (let i = 1; i <= 5; i++) {
      await new Promise(r => setTimeout(r, 400));
      setActiveStep(i);
    }
    try {
      const { data } = await runOptimization();
      setResult(data);
      getPendingRequests().then(r => setPending(r.data));
      getCabs().then(r => setCabs(r.data));
    } catch (e) { setError(e.response?.data?.error || 'Optimization failed. Check backend logs.'); }
    finally { setLoading(false); }
  };

  const available = cabs.filter(c => c.status === 'AVAILABLE').length;

  return (
    <div>
      <PageHeader title="Route Optimization" subtitle="AI-powered clustering and routing algorithm" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Pending Requests', value: pending.length },
          { label: 'Available Vehicles', value: available },
          { label: 'Routes Generated', value: result ? result.length : '–' },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Algorithm Pipeline</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STEPS.map(({ n, title, desc }) => {
            const done = activeStep >= n;
            const active = loading && activeStep === n;
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, transition: 'opacity 0.3s', opacity: !loading || done ? 1 : 0.4 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: done ? 'var(--accent)' : 'var(--bg-3)',
                  color: done ? 'white' : 'var(--text-3)',
                  border: `1px solid ${done ? 'var(--accent)' : 'var(--border-2)'}`,
                  transition: 'all 0.3s',
                  boxShadow: active ? '0 0 0 4px var(--accent-glow)' : 'none',
                }}>
                  {done && !loading ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : n}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: done ? 'var(--text-1)' : 'var(--text-2)' }}>{title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn-primary" onClick={handleRun} disabled={loading} style={{ padding: '10px 24px', fontSize: 14 }}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            Processing...
          </span>
        ) : (
          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Run Optimization</>
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {error && (
        <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13 }}>{error}</div>
      )}

      {result && result.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
            {result.length} route{result.length !== 1 ? 's' : ''} generated successfully
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
            {result.map((route, i) => (
              <div key={route.id} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'monospace' }}>{route.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Cluster {route.clusterGroup + 1}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{route.totalDistance} km</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{route.cab?.number}</p>
                  </div>
                </div>
                {route.stops?.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Pickup Order</p>
                    {[...route.stops].sort((a, b) => a.stopOrder - b.stopOrder).map(stop => (
                      <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{stop.stopOrder}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{stop.employee?.name} — {stop.address}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.length === 0 && (
        <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: 13 }}>
          No routes generated. Ensure available vehicles exist and requests are pending.
        </div>
      )}
    </div>
  );
}
