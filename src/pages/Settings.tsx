import { useState } from 'react';
import { useBrewStore } from '../store/useBrewStore';
import { raptApi } from '../utils/raptApi';
import { Save, Zap, RefreshCw, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Settings = () => {
  const { 
    measurementSystem, setMeasurementSystem, 
    raptSettings, updateRaptSettings, 
    raptDevices, setRaptDevices 
  } = useBrewStore();

  const [username, setUsername] = useState(raptSettings.username || '');
  const [password, setPassword] = useState(raptSettings.password || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSaveRapt = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const { token, expiry } = await raptApi.fetchToken({ username, password });
      updateRaptSettings({ username, password, token, tokenExpiry: expiry });
      
      const devices = await raptApi.getDevices(token);
      setRaptDevices(devices);
      
      setStatus({ type: 'success', message: `Connected! Successfully synced ${devices.length} devices.` });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Failed to connect to RAPT.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDevices = async () => {
    if (!raptSettings.username || !raptSettings.password) return;
    setLoading(true);
    try {
      const { token, expiry } = await raptApi.fetchToken(raptSettings);
      updateRaptSettings({ token, tokenExpiry: expiry });
      const devices = await raptApi.getDevices(token);
      setRaptDevices(devices);
      setStatus({ type: 'success', message: `Successfully synced ${devices.length} devices.` });
    } catch (err: any) {
      setStatus({ type: 'error', message: 'Failed to sync devices.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '1rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: 0, lineHeight: 1 }}>Settings</h2>
      </div>

      {/* Global Preferences */}
      <section style={{ marginBottom: '3rem', background: 'var(--bg-surface-inset)', padding: '2rem', borderRadius: '0', border: '1px solid var(--border-color)', borderLeft: '2px solid var(--border-color)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          General Preferences
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Measurement System
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['metric', 'imperial'] as const).map(sys => (
                <button 
                  key={sys}
                  onClick={() => setMeasurementSystem(sys)}
                  style={{ 
                    flex: 1, 
                    padding: '1rem', 
                    borderRadius: '0', 
                    background: measurementSystem === sys ? 'var(--accent-primary)' : 'var(--bg-surface-hover)',
                    border: '1px solid',
                    borderColor: measurementSystem === sys ? 'var(--accent-primary)' : 'var(--border-color)',
                    color: measurementSystem === sys ? '#003258' : 'white',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer'
                  }}
                >
                  {sys} SYSTEM
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RAPT Integration */}
      <section style={{ marginBottom: '3rem', background: 'var(--bg-surface-inset)', padding: '2rem', borderRadius: '0', border: '1px solid var(--border-color)', borderLeft: '2px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', margin: 0 }}>
            <Zap size={20} color="var(--accent-primary)" fill="var(--accent-primary)" /> RAPT Cloud Integration (Optional)
          </h3>
          <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-muted)' }}>
            v1.0 (REST API)
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '2rem' }}>
          Connect your KegLand RAPT devices (BrewZilla, RAPT Pill) to track real-time telemetry during brew days and fermentation. 
          Create an <strong>API Secret</strong> in your RAPT Portal settings to get started.
        </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              RAPT Username (Email)
            </label>
            <input 
              type="email" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="brewmaster@example.com"
              style={{ width: '100%', padding: '1rem', background: 'var(--bg-main)', border: 'none', borderBottom: '2px solid var(--border-color)', borderRadius: '0', color: 'white', outline: 'none', fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              RAPT API Secret
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••••••"
              style={{ width: '100%', padding: '1rem', background: 'var(--bg-main)', border: 'none', borderBottom: '2px solid var(--border-color)', borderRadius: '0', color: 'white', outline: 'none', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {status && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '1rem', 
              borderRadius: '0', 
              background: status.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              borderLeft: `2px solid ${status.type === 'success' ? '#4CAF50' : '#f44336'}`,
              color: status.type === 'success' ? '#81c784' : '#e57373',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem'
            }}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              onClick={handleSaveRapt}
              disabled={loading || !username || !password}
              style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem',
                padding: '1rem', 
                background: 'var(--accent-primary)', 
                color: '#003258', 
                border: 'none', 
                borderRadius: '0', 
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.05em',
                fontWeight: 700, 
                cursor: loading ? 'wait' : 'pointer',
                opacity: (loading || !username || !password) ? 0.6 : 1
              }}
            >
              <Save size={18} /> {loading ? 'CONNECTING...' : 'SAVE & CONNECT'}
            </button>
            
            {raptSettings.token && (
               <button 
                onClick={handleSyncDevices}
                disabled={loading}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.75rem',
                  padding: '1rem 2rem', 
                  background: 'transparent', 
                  color: 'var(--accent-primary)', 
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.05em',
                  border: '1px solid var(--border-color)', 
                  borderRadius: '0', 
                  fontWeight: 700, 
                  cursor: loading ? 'wait' : 'pointer'
                }}
              >
                <RefreshCw size={18} className={loading ? 'spin' : ''} /> SYNC DEVICES
              </button>
            )}
          </div>
        </div>

        {/* Device List */}
        {raptDevices.length > 0 && (
          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Detected Devices
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {raptDevices.map(device => (
                <div key={device.id} style={{ padding: '1.25rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '0', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={20} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}>{device.name}</div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '0.2rem' }}>
                      {device.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
