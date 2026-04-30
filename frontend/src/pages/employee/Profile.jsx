import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getEmployeeByUser, updateEmployee } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

export default function Profile() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user?.userId) getEmployeeByUser(user.userId).then(r => {
      setEmployee(r.data);
      setForm({ name: r.data.name, department: r.data.department, address: r.data.address, shift: r.data.shift, latitude: r.data.latitude, longitude: r.data.longitude });
    }).catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await updateEmployee(employee.id, form); setMsg('Saved'); setEditing(false); }
    catch { setMsg('Failed to save'); }
    finally { setLoading(false); setTimeout(() => setMsg(''), 3000); }
  };

  const initials = employee?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (!employee) return <p style={{ color: 'var(--text-3)' }}>Loading...</p>;

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account and location details" />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, maxWidth: 820 }}>
        {/* Avatar card */}
        <div className="card" style={{ padding: 24, textAlign: 'center', height: 'fit-content' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--accent)', color: 'white',
            fontSize: 22, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}>{initials}</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{employee.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{user?.username}</p>
          <div style={{ marginTop: 12 }}>
            <span className="badge badge-blue">{employee.department}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <span className="badge badge-yellow">{employee.shift}</span>
          </div>
        </div>

        {/* Details card */}
        <div className="card" style={{ padding: 24 }}>
          {msg && <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 7, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontSize: 13 }}>{msg}</div>}

          {!editing ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Account Details</p>
                <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setEditing(true)}>Edit</button>
              </div>
              {[['Full Name', employee.name], ['Username', user?.username], ['Email', user?.email || '–'], ['Department', employee.department], ['Shift', employee.shift], ['Address', employee.address], ['Coordinates', `${employee.latitude}, ${employee.longitude}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{k}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{v}</span>
                </div>
              ))}
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Edit Details</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[['name','Full Name'],['department','Department'],['address','Address']].map(([k,l]) => (
                  <div key={k} style={k === 'address' ? { gridColumn: '1/-1' } : {}}>
                    <label className="field-label">{l}</label>
                    <input className="input" value={form[k]||''} onChange={e => setForm({...form,[k]:e.target.value})} />
                  </div>
                ))}
                <div>
                  <label className="field-label">Latitude</label>
                  <input className="input" value={form.latitude||''} onChange={e => setForm({...form,latitude:e.target.value})} />
                </div>
                <div>
                  <label className="field-label">Longitude</label>
                  <input className="input" value={form.longitude||''} onChange={e => setForm({...form,longitude:e.target.value})} />
                </div>
                <div>
                  <label className="field-label">Shift</label>
                  <select className="select" value={form.shift} onChange={e => setForm({...form,shift:e.target.value})}>
                    <option>MORNING</option><option>EVENING</option><option>NIGHT</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
