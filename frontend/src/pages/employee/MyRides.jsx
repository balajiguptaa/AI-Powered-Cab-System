import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../../hooks/useAuth';
import { getMyRequests, getEmployeeByUser } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const OFFICE = [12.9716, 77.5946];

const dot = (color, size = 12) => L.divIcon({
  className: '',
  html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.5);box-shadow:0 0 6px ${color}60"></div>`,
  iconSize: [size, size], iconAnchor: [size/2, size/2],
});

const officeIcon = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:6px;background:#f97316;border:2px solid rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11],
});

const statusBadge = (s) => {
  const map = { PENDING:'badge-yellow', ASSIGNED:'badge-blue', COMPLETED:'badge-green', CANCELLED:'badge-red' };
  return <span className={`badge ${map[s]||'badge-gray'}`}>{s}</span>;
};

export default function MyRides() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user?.userId) return;
    getEmployeeByUser(user.userId).then(r => {
      setEmployee(r.data);
      return getMyRequests(r.data.id);
    }).then(r => {
      const sorted = [...r.data].reverse();
      setRides(sorted);
      if (sorted.length) setSelected(sorted[0]);
    }).catch(() => {});
  }, [user]);

  const stops = selected?.route?.stops
    ? [...selected.route.stops].sort((a, b) => a.stopOrder - b.stopOrder)
    : [];
  const path = [...stops.map(s => [s.latitude, s.longitude]), OFFICE];

  return (
    <div>
      <PageHeader title="My Rides" subtitle="Ride history and route details" />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        {/* Ride list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 560, overflowY: 'auto' }}>
          {rides.map(ride => (
            <div
              key={ride.id}
              onClick={() => setSelected(ride)}
              style={{
                padding: '14px 16px', borderRadius: 9, cursor: 'pointer',
                background: selected?.id === ride.id ? 'var(--bg-3)' : 'var(--bg-2)',
                border: `1px solid ${selected?.id === ride.id ? 'var(--border-2)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ride.pickupAddress}</p>
                {statusBadge(ride.status)}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{ride.requestedTime ? new Date(ride.requestedTime).toLocaleString() : '–'}</p>
              {ride.route?.cab && (
                <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                  {ride.route.cab.number} &middot; {ride.route.cab.driverName}
                </p>
              )}
            </div>
          ))}
          {rides.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No rides yet</p>
            </div>
          )}
        </div>

        {/* Map + details */}
        <div>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', height: 360, marginBottom: 14 }}>
            {selected ? (
              <MapContainer
                center={selected.pickupLat ? [selected.pickupLat, selected.pickupLng] : OFFICE}
                zoom={12} style={{ height: '100%', width: '100%' }}
              >
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {path.length > 1 && <Polyline positions={path} color="#4f6ef7" weight={2.5} opacity={0.9} dashArray="6,4" />}
                {stops.map(s => (
                  <Marker key={s.id} position={[s.latitude, s.longitude]} icon={dot('#4f6ef7', 12)}>
                    <Popup><strong>Stop {s.stopOrder}</strong><br />{s.employee?.name}<br /><span style={{fontSize:12}}>{s.address}</span></Popup>
                  </Marker>
                ))}
                <Marker position={OFFICE} icon={officeIcon}>
                  <Popup><strong>Office</strong></Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div style={{ height: '100%', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Select a ride to view route</p>
              </div>
            )}
          </div>

          {selected?.route && (
            <div className="card" style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Pickup Order</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stops.map((stop, i) => {
                  const isMe = stop.employee?.id === employee?.id;
                  return (
                    <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        background: isMe ? 'var(--accent)' : 'var(--bg-3)',
                        border: `1px solid ${isMe ? 'var(--accent)' : 'var(--border-2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: isMe ? 'white' : 'var(--text-2)',
                      }}>{stop.stopOrder}</div>
                      <div>
                        <p style={{ fontSize: 13, color: isMe ? 'var(--text-1)' : 'var(--text-2)', fontWeight: isMe ? 600 : 400 }}>
                          {stop.employee?.name} {isMe && <span style={{ fontSize: 11, color: 'var(--accent)' }}>(You)</span>}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{stop.address}</p>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Office — Destination</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
