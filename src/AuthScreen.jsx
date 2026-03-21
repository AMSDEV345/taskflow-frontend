import { DEMO_USERS } from './constants/data';
import { Avatar, RoleBadge } from './UI';

export default function AuthScreen({ onLogin }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ width: 420, background: '#111118', border: '1px solid #2a2a38', borderRadius: 16, padding: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, background: '#7c6fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f5' }}>TaskFlow</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f5', marginBottom: 6 }}>Welcome back</div>
        <div style={{ fontSize: 14, color: '#9090a8', marginBottom: 24 }}>Pick a demo account to get started</div>
        {DEMO_USERS.map(u => (
          <div key={u.id} onClick={() => onLogin(u)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#1e1e28', border: '1px solid #2a2a38', borderRadius: 6, cursor: 'pointer', marginBottom: 6, transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#7c6fff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a38'}>
            <Avatar user={u} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f5' }}>{u.name}</div>
              <div style={{ fontSize: 11, color: '#5a5a70', fontFamily: 'monospace' }}>{u.email}</div>
            </div>
            <RoleBadge role={u.role} />
          </div>
        ))}
      </div>
    </div>
  );
}