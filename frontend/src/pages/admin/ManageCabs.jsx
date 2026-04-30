import React, { useEffect, useState } from 'react';
import { getCabs, createCab, deleteCab, updateCab } from '../../services/api';
import Modal from '../../components/shared/Modal';
import PageHeader from '../../components/shared/PageHeader';

const blank = { number: '', driverName: '', driverPhone: '', capacity: '4', type: 'SEDAN' };

const statusBadge = (s) => {
  const map = { AVAILABLE: 'badge-green', ASSIGNED: 'badge-blue', MAINTENANCE: 'badge-red' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

export default function ManageCabs() {
  const [cabs, setCabs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);

  const load = () => getCabs().then(r => setCabs(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await createCab({ ...form, capacity: parseInt(form.capacity) }); setShowModal(false); setForm(blank); load(); }
    catch { alert('Failed to add cab'); } finally { setLoading(false); }
  };

  const toggleStatus = async (cab) => {
    const next = cab.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    await updateCab(cab.id, { status: next }); load();
  };

  const availCount = cabs.filter(c => c.status === 'AVAILABLE').length;

  return (
    <div>
      <PageHeader
        title="Fleet"
        subtitle={`${cabs.length} vehicles · ${availCount} available`}
        action={<button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Vehicle
        </button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {cabs.map(cab => (
          <div key={cab.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>{cab.number}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{cab.type}</p>
              </div>
              {statusBadge(cab.status)}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)' }}>Driver</span>
                <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{cab.driverName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)' }}>Phone</span>
                <span style={{ color: 'var(--text-2)', fontFamily: 'monospace' }}>{cab.driverPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)' }}>Capacity</span>
                <span style={{ color: 'var(--text-1)' }}>{cab.capacity} seats</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 12, padding: '6px 10px' }} onClick={() => toggleStatus(cab)}>
                {cab.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
              </button>
              <button className="btn-danger" onClick={() => { if(window.confirm('Delete cab?')) deleteCab(cab.id).then(load); }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </div>
        ))}
        {cabs.length === 0 && <p style={{ color: 'var(--text-3)', gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>No vehicles registered</p>}
      </div>

      {showModal && (
        <Modal title="Add Vehicle" subtitle="Register a new cab to the fleet" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[['number','Plate Number'],['driverName','Driver Name'],['driverPhone','Driver Phone'],['capacity','Capacity']].map(([k,l]) => (
                <div key={k}>
                  <label className="field-label">{l}</label>
                  <input className="input" type={k==='capacity'?'number':'text'} value={form[k]} onChange={e => set(k, e.target.value)} required />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Vehicle Type</label>
              <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
                <option>SEDAN</option><option>SUV</option><option>MINIVAN</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Vehicle'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
