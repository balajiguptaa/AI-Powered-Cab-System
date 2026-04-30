import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../../hooks/useAuth';
import { createRequest, getEmployeeByUser } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#4f6ef7;border:3px solid white;box-shadow:0 0 0 4px rgba(79,110,247,0.25),0 2px 8px rgba(0,0,0,0.5)"></div>`,
  iconSize: [20, 20], iconAnchor: [10, 10],
});

function Picker({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng); } });
  return null;
}

export default function RequestCab() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [pin, setPin] = useState(null);
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.userId) getEmployeeByUser(user.userId).then(r => setEmployee(r.data)).catch(() => {});
  }, [user]);

  const center = employee ? [employee.latitude, employee.longitude] : [12.9716, 77.5946];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin) { setError('Click on the map to set your pickup location.'); return; }
    if (!employee) { setError('Employee profile not found.'); return; }
    setLoading(true); setError('');
    try {
      await createRequest({ employeeId: employee.id, pickupLat: pin.lat, pickupLng: pin.lng, pickupAddress: address, requestedTime: time });
      setSuccess(true); setPin(null); setAddress(''); setTime('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Request a Cab" subtitle="Select your pickup location on the map and choose a time" />

      {success && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 18, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Request submitted. Admin will assign a cab after the next optimization run.
          <button onClick={() => setSuccess(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', padding: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 18, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Map */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Click to pin pickup location</p>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', height: 420 }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Picker onPick={(ll) => { setPin(ll); setAddress(`${ll.lat.toFixed(5)}, ${ll.lng.toFixed(5)}`); }} />
              {pin && <Marker position={pin} icon={pinIcon} />}
            </MapContainer>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Pickup Address</label>
            <input className="input" value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Click map or type address" required />
            {pin && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
              {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
            </p>}
          </div>

          <div>
            <label className="field-label">Pickup Time</label>
            <input type="datetime-local" className="input" value={time} onChange={e => setTime(e.target.value)} required />
          </div>

          {employee && (
            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(79,110,247,0.07)', border: '1px solid rgba(79,110,247,0.2)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Registered Address</p>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{employee.address}</p>
              <button type="button" style={{ marginTop: 6, fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => { setPin({ lat: employee.latitude, lng: employee.longitude }); setAddress(employee.address); }}>
                Use this address
              </button>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '10px 16px', marginTop: 'auto' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg style={{ animation: 'spin 0.8s linear infinite' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                Submitting...
              </span>
            ) : 'Submit Request'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
