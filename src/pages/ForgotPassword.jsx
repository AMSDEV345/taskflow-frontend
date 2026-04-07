import { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://taskflow-backend-production-1ee5.up.railway.app';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message);
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

        <div style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f5', marginBottom: 4 }}>Forgot Password</div>
        <div style={{ fontSize: 14, color: '#9090a8', marginBottom: 24 }}>Enter your email and we'll send you a reset link.</div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#9090a8', display: 'block', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', background: '#1e1e28', border: '1px solid #2a2a38', borderRadius: 8, padding: '10px 14px', fontSize: 15, color: '#f0f0f5', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>⚠️ {error}</div>
          )}
          {message && (
            <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#4ade80', marginBottom: 16 }}>✅ {message}</div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 10, padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1, marginBottom: 16 }}>
            {loading ? '⏳ Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 14, color: '#9090a8' }}>
          Remember your password?{' '}
          <a href="/" style={{ color: '#7c6fff', fontWeight: 600, textDecoration: 'none' }}>Sign In</a>
        </div>
      </div>
    </div>
  );
}