import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { getRoutes, getEmployees } from '../../services/api';
import PageHeader from '../../components/shared/PageHeader';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const OFFICE = [12.9716, 77.5946];
const COLORS = ['#4f6ef7','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

const dot = (color, size = 10) => L.divIcon({
  className: '',
  html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.4);box-shadow:0 0 6px ${color}60"></div>`,
  iconSize: [size, size], iconAnchor: [size/2, size/2],
});

const officeMarker = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:6px;background:#f97316;border:2px solid rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px rgba(249,115,22,0.5)"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

export default function RoutesMap() {
  const [routes, setRoutes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [layer, setLayer] = useState('both');

  useEffect(() => {
    getRoutes().then(r => setRoutes(r.data)).catch(() => {});
    getEmployees().then(r => setEmployees(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Routes" subtitle="Optimized pickup routes and employee locations" action={
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
          {[['both','All'],['employees','Employees'],['routes','Routes']].map(([v,l]) => (
            <button key={v} onClick={() => setLayer(v)} style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: layer === v ? 'var(--bg-3)' : 'transparent',
              color: layer === v ? 'var(--text-1)' : 'var(--text-3)',
              border: layer === v ? '1px solid var(--border-2)' : '1px solid transparent',
              transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
      } />

      {/* Legend */}
      {routes.length > 0 && (
        <div className="card" style={{ padding: '12px 16px', marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-3)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Employee</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#f97316' }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Office</span>
          </div>
          {routes.slice(0, 5).map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 18, height: 2, background: COLORS[i % COLORS.length], borderRadius: 1 }} />
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.name?.split('-').slice(0,2).join('-')}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', height: 520 }}>
        <MapContainer center={OFFICE} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={OFFICE} icon={officeMarker}><Popup><strong>Office</strong></Popup></Marker>

          {(layer==='both'||layer==='employees') && employees.filter(e=>e.latitude&&e.longitude).map(e => (
            <Marker key={e.id} position={[e.latitude,e.longitude]} icon={dot('#8892a4',10)}>
              <Popup><strong>{e.name}</strong><br/>{e.department}<br/><span style={{color:'var(--text-3)',fontSize:12}}>{e.address}</span></Popup>
            </Marker>
          ))}

          {(layer==='both'||layer==='routes') && routes.map((route, ri) => {
            const color = COLORS[ri % COLORS.length];
            const stops = route.stops ? [...route.stops].sort((a,b)=>a.stopOrder-b.stopOrder) : [];
            const path = [...stops.map(s=>[s.latitude,s.longitude]), OFFICE];
            return (
              <React.Fragment key={route.id}>
                {path.length > 1 && <Polyline positions={path} color={color} weight={2.5} opacity={0.85} dashArray="6,4" />}
                {stops.map(s => (
                  <Marker key={s.id} position={[s.latitude,s.longitude]} icon={dot(color,12)}>
                    <Popup><strong>Stop {s.stopOrder}</strong><br/>{s.employee?.name}<br/><span style={{fontSize:12,color:'var(--text-3)'}}>{s.address}</span></Popup>
                  </Marker>
                ))}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {routes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginTop: 14 }}>
          {routes.map((r, i) => (
            <div key={r.id} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i%COLORS.length], flexShrink: 0, marginTop: 4 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', fontFamily: 'monospace' }}>{r.name?.split('-').slice(0,2).join('-')}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{r.cab?.number} &middot; {r.stops?.length ?? 0} stops &middot; {r.totalDistance} km</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {routes.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, marginTop: 20 }}>No routes yet. Run optimization first.</p>}
    </div>
  );
}
