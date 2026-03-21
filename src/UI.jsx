import { COLORS } from './constants/data';

export function Avatar({ user, size = 28, style = {} }) {
  if (!user) return null;
  const initials = user.name.split(' ').map(n => n[0]).join('');
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, background: user.color + '33', color: user.color, border: `2px solid ${user.color}44`, flexShrink: 0, ...style }}>
      {initials}
    </div>
  );
}

export function PriorityBadge({ priority }) {
  const map = { high: [COLORS.red,'High'], medium: [COLORS.yellow,'Med'], low: [COLORS.green,'Low'] };
  const [color, label] = map[priority] || [COLORS.green,'Low'];
  return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: color+'20', color, fontFamily: 'monospace' }}>{label}</span>;
}

export function RoleBadge({ role }) {
  const map = { admin: [COLORS.accent,'Admin'], user: [COLORS.blue,'User'], guest: [COLORS.teal,'Guest'] };
  const [color, label] = map[role] || [COLORS.teal,'Guest'];
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: color+'20', color, fontFamily: 'monospace', textTransform: 'uppercase' }}>{label}</span>;
}

export function Toast({ toasts, remove }) {
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{ background: '#18181f', border: '1px solid #2a2a38', borderRadius: 6, padding: '12px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, minWidth: 240, cursor: 'pointer', borderColor: t.type === 'success' ? 'rgba(74,222,128,0.3)' : t.type === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(96,165,250,0.3)' }}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}