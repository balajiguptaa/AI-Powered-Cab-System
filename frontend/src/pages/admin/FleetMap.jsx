import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { getActiveCabs, getRoutes } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const OFFICE = [12.9716, 77.5946];
const PALETTE = ['#4f6ef7','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

const cabMarker = (color, label) => L.divIcon({
  className: '',
  html: `<div style="position:relative">
    <div style="width:32px;height:32px;border-radius:50%;background:${color};border:2.5px solid rgba(255,255,255,0.15);box-shadow:0 0 0 5px ${color}30,0 4px 14px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
    </div>
    <div style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);background:${color};color:white;font-size:8px;font-weight:700;padding:2px 5px;border-radius:4px;white-space:nowrap;letter-spacing:0.05em">${label}</div>
  </div>`,
  iconSize: [32, 32], iconAnchor: [16, 16],
});

const stopDot = (color) => L.divIcon({
  className: '',
  html: `<div style="width:8px;height:8px;border-radius:50%;background:${color};opacity:0.6;border:1.5px solid rgba(255,255,255,0.15)"></div>`,
  iconSize: [8, 8], iconAnchor: [4, 4],
});

const officeMarker = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:6px;background:#f97316;border:2px solid rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px rgba(249,115,22,0.4)"><svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

export default function FleetMap() {
  const [cabs, setCabs] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const ref = useRef(null);

  const refresh = async () => {
    try {
      const [cr, rr] = await Promise.all([getActiveCabs(), getRoutes()]);
      setCabs(cr.data); setRoutes(rr.data); setLastUpdate(new Date());
    } catch {}
  };

  useEffect(() => { refresh(); ref.current = setInterval(refresh, 3000); return () => clearInterval(ref.current); }, []);

  const colorMap = {};
  routes.forEach((r, i) => { colorMap[r.id] = PALETTE[i % PALETTE.length]; });

  const enriched = cabs.map(t => ({
    ...t,
    color: colorMap[t.route?.id] || PALETTE[0],
    routeData: routes.find(r => r.id === t.route?.id),
  }));

  const enRoute = cabs.filter(c => c.status === 'EN_ROUTE').length;
  const atStop  = cabs.filter(c => c.status === 'AT_STOP').length;
  const done    = cabs.filter(c => c.status === 'COMPLETED').length;

  return (
    <div>
      <PageHeader
        title="Live Fleet"
        subtitle="Real-time vehicle positions"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Connecting...'}
            </div>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
        {[['En Route', enRoute, '#4f6ef7'],['At Stop', atStop, '#f59e0b'],['Completed', done, '#22c55e']].map(([l,v,c]) => (
          <div key={l} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{v}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{l}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', height: 500 }}>
          <MapContainer center={OFFICE} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={OFFICE} icon={officeMarker}><Popup><strong>Office</strong></Popup></Marker>

            {enriched.map(t => {
              const stops = t.routeData?.stops ? [...t.routeData.stops].sort((a,b) => a.stopOrder - b.stopOrder) : [];
              const remaining = [[t.currentLat, t.currentLng], ...stops.slice(t.currentStopIndex).map(s => [s.latitude, s.longitude]), OFFICE];
              const passed = stops.slice(0, t.currentStopIndex).map(s => [s.latitude, s.longitude]);
              return (
                <React.Fragment key={t.id}>
                  {passed.length > 1 && <Polyline positions={[...passed, [t.currentLat, t.currentLng]]} color={t.color} weight={1.5} opacity={0.2} />}
                  {remaining.length > 1 && <Polyline positions={remaining} color={t.color} weight={2.5} opacity={0.85} dashArray="7,4" />}
                  {stops.map(s => <Marker key={s.id} position={[s.latitude, s.longitude]} icon={stopDot(t.color)}><Popup>Stop {s.stopOrder}: {s.employee?.name}</Popup></Marker>)}
                  <Marker position={[t.currentLat, t.currentLng]} icon={cabMarker(t.color, t.cab?.number || '–')} zIndexOffset={1000}>
                    <Popup>
                      <strong>{t.cab?.number}</strong><br/>
                      {t.cab?.driverName}<br/>
                      Next: {stops[t.currentStopIndex]?.employee?.name ?? 'Office'}<br/>
                      <span style={{ fontSize: 11 }}>{t.status}</span>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>

        {/* Fleet sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto' }}>
          {enriched.length === 0 && (
            <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No active vehicles.<br/>Run optimization to start tracking.</p>
            </div>
          )}
          {enriched.map(t => {
            const stops = t.routeData?.stops ? [...t.routeData.stops].sort((a,b)=>a.stopOrder-b.stopOrder) : [];
            const next = stops[t.currentStopIndex];
            const pct = stops.length ? Math.round((t.currentStopIndex / stops.length) * 100) : 0;
            return (
              <div key={t.id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'monospace', flex: 1 }}>{t.cab?.number}</span>
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: t.status === 'EN_ROUTE' ? 'rgba(79,110,247,0.12)' : t.status === 'AT_STOP' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)', color: t.status === 'EN_ROUTE' ? '#818cf8' : t.status === 'AT_STOP' ? '#fbbf24' : '#4ade80' }}>{t.status}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>{t.cab?.driverName}</p>
                <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>Next: {next?.employee?.name ?? 'Office'}</p>
                <div style={{ height: 4, borderRadius: 99, background: 'var(--bg-3)' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: t.color, width: `${pct}%`, transition: 'width 1s ease' }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{t.currentStopIndex}/{stops.length} stops</p>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
