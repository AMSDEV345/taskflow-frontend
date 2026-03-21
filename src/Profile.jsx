import { useState } from 'react';
import { Avatar, RoleBadge } from './UI';

export default function Profile({ currentUser, onUpdateProfile, onLogout, theme, darkMode }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const handleSaveName = async () => {
    if (!name.trim()) { setError('Name cannot be empty'); return; }
    try {
      await onUpdateProfile({ name: name.trim() });
      setSuccess('Name updated successfully!');
      setEditing(false);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update name');
    }
  };

  const handleChangePassword = async () => {
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      await onUpdateProfile({ currentPassword, newPassword });
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Current password is incorrect');
    }
  };

  const tab = (id, icon, label) => (
    <div onClick={() => setActiveTab(id)}
      style={{ padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: activeTab === id ? '#7c6fff' : (darkMode ? '#9090a8' : '#6060a0'), borderBottom: activeTab === id ? '2px solid #7c6fff' : '2px solid transparent', transition: 'all 0.2s' }}>
      {icon} {label}
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: darkMode ? '#0a0a0f' : '#f0f4f8' }}>

      {/* Header */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${theme.border}`, background: theme.sidebar }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>My Profile</div>
      </div>

      {/* Profile Hero */}
      <div style={{ background: `linear-gradient(135deg, ${currentUser.color || '#7c6fff'}22, ${currentUser.color || '#7c6fff'}44)`, borderBottom: `1px solid ${theme.border}`, padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: (currentUser.color || '#7c6fff') + '33', border: `3px solid ${currentUser.color || '#7c6fff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: currentUser.color || '#7c6fff', flexShrink: 0 }}>
          {currentUser.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: theme.text, marginBottom: 4 }}>{currentUser.name}</div>
          <div style={{ fontSize: 14, color: theme.textMuted, marginBottom: 8 }}>{currentUser.email}</div>
          <RoleBadge role={currentUser.role} />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={onLogout}
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, background: theme.sidebar, paddingLeft: 20 }}>
        {tab('profile', '👤', 'Profile')}
        {tab('security', '🔐', 'Security')}
        {tab('preferences', '⚙️', 'Preferences')}
      </div>

      <div style={{ padding: 24, maxWidth: 600 }}>

        {/* Success/Error Messages */}
        {success && (
          <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#4ade80', marginBottom: 20 }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 20 }}>Personal Information</div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Full Name</div>
                {editing ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" value={name} onChange={e => setName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditing(false); setName(currentUser.name); } }} />
                    <button onClick={handleSaveName} style={{ background: '#7c6fff', color: 'white', border: 'none', borderRadius: 6, padding: '0 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Save</button>
                    <button onClick={() => { setEditing(false); setName(currentUser.name); setError(''); }} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '0 12px', cursor: 'pointer', fontSize: 13, color: theme.textMuted }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 15, color: theme.text, flex: 1 }}>{currentUser.name}</div>
                    <button onClick={() => setEditing(true)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '6px 12px', fontSize: 12 }}>✏️ Edit</button>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Email</div>
                <div style={{ fontSize: 15, color: theme.text }}>{currentUser.email}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Role</div>
                <RoleBadge role={currentUser.role} />
              </div>
            </div>

            <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>Account Color</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['#7c6fff', '#60a5fa', '#4ade80', '#fbbf24', '#f87171', '#f472b6', '#fb923c', '#2dd4bf'].map(c => (
                  <div key={c} onClick={() => onUpdateProfile({ color: c })}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: c, cursor: 'pointer', border: currentUser.color === c ? `3px solid ${theme.text}` : '3px solid transparent', transform: currentUser.color === c ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 20 }}>Change Password</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Current Password</div>
              <div style={{ position: 'relative' }}>
                <input className="input" placeholder="Enter current password" type={showCurrentPw ? 'text' : 'password'} value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)} style={{ paddingRight: 44 }} />
                <span onClick={() => setShowCurrentPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 16 }}>
                  {showCurrentPw ? '👁️' : '🙈'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>New Password</div>
              <div style={{ position: 'relative' }}>
                <input className="input" placeholder="Enter new password" type={showNewPw ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} style={{ paddingRight: 44 }} />
                <span onClick={() => setShowNewPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 16 }}>
                  {showNewPw ? '👁️' : '🙈'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Confirm New Password</div>
              <input className="input" placeholder="Confirm new password" type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleChangePassword(); }} />
            </div>

            <button onClick={handleChangePassword}
              style={{ width: '100%', background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 8, padding: '12px', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              🔐 Change Password
            </button>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 20 }}>Preferences</div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>Dark Mode</div>
                <div style={{ fontSize: 12, color: theme.textDim }}>Switch between dark and light theme</div>
              </div>
              <div style={{ fontSize: 22 }}>{darkMode ? '🌙' : '☀️'}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>Account Role</div>
                <div style={{ fontSize: 12, color: theme.textDim }}>Your current permission level</div>
              </div>
              <RoleBadge role={currentUser.role} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>Account Email</div>
                <div style={{ fontSize: 12, color: theme.textDim }}>{currentUser.email}</div>
              </div>
              <span style={{ fontSize: 11, background: 'rgba(74,222,128,0.15)', color: '#4ade80', padding: '3px 10px', borderRadius: 10, fontWeight: 600 }}>Verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}