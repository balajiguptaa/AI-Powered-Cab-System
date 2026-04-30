import React, { useEffect, useState } from 'react';
import { getEmployees, createEmployee, deleteEmployee } from '../../services/api';
import Modal from '../../components/shared/Modal';
import PageHeader from '../../components/shared/PageHeader';
import { Table, Th, Td, Tr } from '../../components/shared/Table';

const blank = { username:'', password:'', name:'', email:'', phone:'', department:'', address:'', latitude:'', longitude:'', shift:'MORNING' };

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const load = () => getEmployees().then(r => setEmployees(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      await createEmployee(form);
      setShowModal(false); setForm(blank); load();
    } catch (e) { setErr(e.response?.data?.error || 'Failed to create employee'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this employee?')) return;
    await deleteEmployee(id); load();
  };

  const shiftBadge = (s) => {
    const map = { MORNING: 'badge-yellow', EVENING: 'badge-blue', NIGHT: 'badge-gray' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  };

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} registered`}
        action={<button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Employee
        </button>}
      />

      <div className="card">
        <Table>
          <thead>
            <tr><Th>Name</Th><Th>Username</Th><Th>Department</Th><Th>Shift</Th><Th>Address</Th><Th></Th></tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <Tr key={e.id}>
                <Td><span style={{ fontWeight: 500 }}>{e.name}</span></Td>
                <Td style={{ color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{e.user?.username}</Td>
                <Td style={{ color: 'var(--text-2)' }}>{e.department}</Td>
                <Td>{shiftBadge(e.shift)}</Td>
                <Td style={{ color: 'var(--text-2)', maxWidth: 200 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.address}</span></Td>
                <Td><button className="btn-danger" onClick={() => handleDelete(e.id)}>Remove</button></Td>
              </Tr>
            ))}
            {employees.length === 0 && <tr><td colSpan="6" style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)' }}>No employees registered</td></tr>}
          </tbody>
        </Table>
      </div>

      {showModal && (
        <Modal title="Add Employee" subtitle="Create a new employee account and profile" onClose={() => setShowModal(false)}>
          {err && <div style={{ padding: '10px 14px', marginBottom: 14, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13 }}>{err}</div>}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[['username','Username'],['password','Password'],['name','Full Name'],['email','Email'],['phone','Phone'],['department','Department']].map(([k, l]) => (
                <div key={k}>
                  <label className="field-label">{l}</label>
                  <input className="input" type={k==='password'?'password':'text'} value={form[k]} onChange={e => set(k, e.target.value)} required />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="field-label">Address</label>
              <input className="input" value={form.address} onChange={e => set('address', e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><label className="field-label">Latitude</label><input className="input" value={form.latitude} onChange={e => set('latitude', e.target.value)} placeholder="12.9716" required /></div>
              <div><label className="field-label">Longitude</label><input className="input" value={form.longitude} onChange={e => set('longitude', e.target.value)} placeholder="77.5946" required /></div>
              <div>
                <label className="field-label">Shift</label>
                <select className="select" value={form.shift} onChange={e => set('shift', e.target.value)}>
                  <option>MORNING</option><option>EVENING</option><option>NIGHT</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
