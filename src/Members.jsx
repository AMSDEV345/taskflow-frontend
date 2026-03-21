import { useState } from 'react';
import { Avatar, RoleBadge } from './UI';

export default function Members({ users, currentUser }) {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#0a0a0f' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #2a2a38', background: '#111118' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f5' }}>Team Members</div>
        {currentUser?.role === 'admin' && (
          <button style={{ background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            + Invite
          </button>
        )}
      </div>

      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
        {users.map(u => (
          <div key={u._id || u.id}
            onClick={() => setSelectedUser(u)}
            style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6fff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,111,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a38'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <Avatar user={{ ...u, name: u.name || 'User', color: u.color || '#7c6fff' }} size={44} />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f5', marginBottom: 2 }}>{u.name}</div>
              <div style={{ fontSize: 11, color: '#5a5a70', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{u.email}</div>
              <RoleBadge role={u.role} />
            </div>
            {(u._id === currentUser?._id || u.id === currentUser?.id) && (
              <span style={{ fontSize: 10, background: 'rgba(74,222,128,0.15)', color: '#4ade80', padding: '2px 8px', borderRadius: 10, fontWeight: 600, flexShrink: 0 }}>You</span>
            )}
          </div>
        ))}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedUser(null)}>
          <div style={{ width: 380, background: '#111118', border: '1px solid #2a2a38', borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>

            {/* Close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: '#9090a8', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: (selectedUser.color || '#7c6fff') + '33', border: `3px solid ${selectedUser.color || '#7c6fff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: selectedUser.color || '#7c6fff', marginBottom: 12 }}>
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f5', marginBottom: 4 }}>{selectedUser.name}</div>
              <RoleBadge role={selectedUser.role} />
            </div>

            {/* Info */}
            <div style={{ background: '#18181f', border: '1px solid #2a2a38', borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#5a5a70', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 14, color: '#f0f0f5' }}>{selectedUser.email}</div>
            </div>

            <div style={{ background: '#18181f', border: '1px solid #2a2a38', borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#5a5a70', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 4 }}>Role</div>
              <div style={{ fontSize: 14, color: '#f0f0f5', textTransform: 'capitalize' }}>{selectedUser.role}</div>
            </div>

            <div style={{ background: '#18181f', border: '1px solid #2a2a38', borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: '#5a5a70', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 4 }}>Member Since</div>
              <div style={{ fontSize: 14, color: '#f0f0f5' }}>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</div>
            </div>

            {(selectedUser._id === currentUser?._id || selectedUser.id === currentUser?.id) && (
              <div style={{ textAlign: 'center', fontSize: 13, color: '#4ade80', fontWeight: 600 }}>
                ✅ This is your profile
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}