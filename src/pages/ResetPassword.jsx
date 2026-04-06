import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'rgba(17,17,24,0.97)', border: '1px solid #2a2a38', borderRadius: 20, padding: '36px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f5' }}>TaskFlow</div>
            <div style={{ fontSize: 12, color: '#5a5a70' }}>Project Management</div>
          </div>
        </div>

        <div style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f5', marginBottom: 4 }}>Reset Password</div>
        <div style={{ fontSize: 14, color: '#9090a8', marginBottom: 24 }}>Enter your new password below.</div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#9090a8', display: 'block', marginBottom: 6 }}>New Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', background: '#1e1e28', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', fontSize: 15, color: '#f0f0f5', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#9090a8', display: 'block', marginBottom: 6 }}>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              style={{ width: '100%', background: '#1e1e28', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', fontSize: 15, color: '#f0f0f5', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>⚠️ {error}</div>
          )}
          {message && (
            <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#4ade80', marginBottom: 16 }}>✅ {message} Redirecting...</div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 10, padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}