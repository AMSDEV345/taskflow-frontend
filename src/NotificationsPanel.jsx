const ICONS = { comment: '💬', assign: '👤', reminder: '⏰', update: '🔄' };

export default function NotificationsPanel({ notifications, onMarkRead }) {
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div style={{ position: 'fixed', top: 56, right: 16, width: 340, maxHeight: 480, background: '#18181f', border: '1px solid #2a2a38', borderRadius: 10, boxShadow: '0 8px 48px rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #2a2a38', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5', flex: 1 }}>
          Notifications {unread > 0 && <span style={{ background: '#7c6fff', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, marginLeft: 6 }}>{unread}</span>}
        </div>
        <button onClick={() => onMarkRead('all')} style={{ background: 'transparent', border: '1px solid #2a2a38', borderRadius: 6, color: '#9090a8', cursor: 'pointer', padding: '4px 10px', fontSize: 12 }}>Mark all read</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notifications.map(n => (
          <div key={n.id} onClick={() => onMarkRead(n.id)} style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a38', cursor: 'pointer', background: !n.read ? 'rgba(124,111,255,0.08)' : 'transparent' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {!n.read && <div style={{ width: 6, height: 6, background: '#7c6fff', borderRadius: '50%', marginTop: 4, flexShrink: 0 }} />}
              <div>
                <div style={{ fontSize: 13, color: '#f0f0f5', marginBottom: 3 }}>{ICONS[n.type]} {n.text}</div>
                <div style={{ fontSize: 11, color: '#5a5a70', fontFamily: 'monospace' }}>{n.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}