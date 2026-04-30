import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../../hooks/useAuth';
import { getMyRequests, getEmployeeByUser, getCabByRoute, getCabEta } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const OFFICE = [12.9716, 77.5946];

const cabIcon = L.divIcon({
  className: '',
  html: `<div style="width:34px;height:34px;border-radius:50%;background:#4f6ef7;border:3px solid rgba(255,255,255,0.15);box-shadow:0 0 0 6px rgba(79,110,247,0.2),0 4px 16px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  </div>`,
  iconSize: [34, 34], iconAnchor: [17, 17],
});

const myIcon = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#22c55e;border:3px solid rgba(0,0,0,0.4);box-shadow:0 0 0 5px rgba(34,197,94,0.2)"></div>`,
  iconSize: [22, 22], iconAnchor: [11, 11],
});

const stopDot = L.divIcon({
  className: '',
  html: `<div style="width:10px;height:10px;border-radius:50%;background:#4a5568;border:2px solid rgba(255,255,255,0.1)"></div>`,
  iconSize: [10, 10], iconAnchor: [5, 5],
});

const officeIcon = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:6px;background:#f97316;border:2px solid rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px rgba(249,115,22,0.4)"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

function Follow({ pos }) {
  const map = useMap();
  useEffect(() => { if (pos) map.panTo(pos, { animate: true, duration: 1 }); }, [pos]);
  return null;
}

export default function LiveTracking() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [ride, setRide] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [eta, setEta] = useState(null);
  const [myStopIdx, setMyStopIdx] = useState(0);
  const [follow, setFollow] = useState(true);
  const interval = useRef(null);

  useEffect(() => {
    if (!user?.userId) return;
    getEmployeeByUser(user.userId).then(r => {
      setEmployee(r.data);
      return getMyRequests(r.data.id);
    }).then(r => {
      const assigned = r.data.find(req => req.status === 'ASSIGNED' && req.route);
      if (assigned) {
        setRide(assigned);
        const stops = assigned.route?.stops || [];
        const myStop = stops.find(s => s.employee?.id === assigned.employee?.id);
        setMyStopIdx(myStop ? myStop.stopOrder - 1 : 0);
      }
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!ride?.route?.id) return;
    const poll = async () => {
      try {
        const [tr, er] = await Promise.all([getCabByRoute(ride.route.id), getCabEta(ride.route.id, myStopIdx)]);
        setTracking(tr.data); setEta(er.data);
      } catch {}
    };
    poll();
    interval.current = setInterval(poll, 3000);
    return () => clearInterval(interval.current);
  }, [ride, myStopIdx]);

  const cabPos = tracking ? [tracking.currentLat, tracking.currentLng] : null;
  const stops = ride?.route?.stops ? [...ride.route.stops].sort((a, b) => a.stopOrder - b.stopOrder) : [];
  const path = [...(cabPos ? [cabPos] : []), ...stops.map(s => [s.latitude, s.longitude]), OFFICE];

  const statusLabel = { EN_ROUTE: 'En route', AT_STOP: 'At a stop', COMPLETED: 'Arrived' };

  return (
    <div>
      <PageHeader
        title="Track Your Cab"
        subtitle="Live position updates every 3 seconds"
        action={cabPos && (
          <button
            className={follow ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 12, padding: '6px 12px' }}
            onClick={() => setFollow(f => !f)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            {follow ? 'Following' : 'Follow'}
          </button>
        )}
      />

      {!ride ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" style={{ margin: '0 auto 14px', display: 'block' }}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          <p style={{ color: 'var(--text-3)', fontSize: 14, fontWeight: 500 }}>No active ride</p>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 6 }}>Request a cab and wait for admin to run optimization</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>
          {/* Map */}
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', height: 520 }}>
            <MapContainer center={cabPos || (employee ? [employee.latitude, employee.longitude] : OFFICE)} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {follow && cabPos && <Follow pos={cabPos} />}
              {path.length > 1 && <Polyline positions={path} color="#4f6ef7" weight={3} opacity={0.8} dashArray="8,5" />}
              {cabPos && (
                <Marker position={cabPos} icon={cabIcon} zIndexOffset={1000}>
                  <Popup>
                    <strong>{ride.route?.cab?.number}</strong><br/>
                    {ride.route?.cab?.driverName}<br/>
                    <a href={`tel:${ride.route?.cab?.driverPhone}`} style={{color:'var(--accent)'}}>{ride.route?.cab?.driverPhone}</a>
                  </Popup>
                </Marker>
              )}
              {employee && (
                <Marker position={[employee.latitude, employee.longitude]} icon={myIcon} zIndexOffset={500}>
                  <Popup><strong>Your stop</strong><br/>{employee.address}<br/><span style={{color:'#4ade80'}}>ETA: {eta?.etaMinutes ?? '–'} min</span></Popup>
                </Marker>
              )}
              {stops.map(s => {
                if (s.employee?.id === employee?.id) return null;
                return (
                  <Marker key={s.id} position={[s.latitude, s.longitude]} icon={stopDot}>
                    <Popup>Stop {s.stopOrder}: {s.employee?.name}</Popup>
                  </Marker>
                );
              })}
              <Marker position={OFFICE} icon={officeIcon}><Popup><strong>Office</strong></Popup></Marker>
            </MapContainer>
          </div>

          {/* Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* ETA */}
            <div style={{ padding: '20px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>ETA to your stop</p>
              <p style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {eta?.etaMinutes ?? '–'}<span style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-2)' }}> min</span>
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>{eta?.distanceKm ?? '–'} km away</p>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: tracking?.status === 'EN_ROUTE' ? '#22c55e' : '#f59e0b', animation: tracking?.status === 'EN_ROUTE' ? 'pulse 2s infinite' : 'none' }} />
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{statusLabel[tracking?.status] ?? 'Waiting'}</span>
              </div>
            </div>

            {/* Cab info */}
            <div style={{ padding: '16px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Vehicle</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{ride.route?.cab?.number}</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{ride.route?.cab?.driverName}</p>
              <a href={`tel:${ride.route?.cab?.driverPhone}`} style={{ display: 'inline-block', marginTop: 8, fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'monospace' }}>
                {ride.route?.cab?.driverPhone}
              </a>
            </div>

            {/* Stop list */}
            <div style={{ padding: '16px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)', flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Stops</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stops.map((s, i) => {
                  const isMe = s.employee?.id === employee?.id;
                  const passed = tracking && i < tracking.currentStopIndex;
                  return (
                    <div key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center', opacity: passed ? 0.35 : 1, transition: 'opacity 0.3s' }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 700,
                        background: isMe ? 'rgba(34,197,94,0.15)' : 'var(--bg-3)',
                        border: `1px solid ${isMe ? 'rgba(34,197,94,0.4)' : 'var(--border-2)'}`,
                        color: isMe ? '#4ade80' : 'var(--text-3)',
                      }}>
                        {passed ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : s.stopOrder}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12, color: isMe ? 'var(--text-1)' : 'var(--text-2)', fontWeight: isMe ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.employee?.name} {isMe && '(You)'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#f97316"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Office</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Live · updates every 3s</span>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
