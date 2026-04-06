import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { COLORS } from './constants/data';
import { generateId } from './utils/helpers';
import * as API from './api/index';
import BoardView from './BoardView';
import Analytics from './Analytics';
import Members from './Members';
import NotificationsPanel from './NotificationsPanel';
import Profile from './Profile';
import { Avatar, Toast } from './UI';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const BOARD_COLORS = [
  '#7c6fff', '#60a5fa', '#4ade80', '#fbbf24',
  '#f87171', '#f472b6', '#fb923c', '#2dd4bf',
  '#a78bfa', '#34d399', '#818cf8', '#e879f9',
];

function CreateBoardModal({ onClose, onCreate, theme }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#7c6fff');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onCreate({ title: title.trim(), description, color });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 460, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: '24px 20px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Create New Board</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 20, padding: '4px 8px' }}>✕</button>
        </div>
        <div style={{ height: 70, borderRadius: 10, background: `linear-gradient(135deg, ${color}22, ${color}44)`, border: `2px solid ${color}`, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{title || 'Board Preview'}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Board Title *</div>
          <input className="input" placeholder="e.g. Product Roadmap" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Description</div>
          <input className="input" placeholder="What is this board for?" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Color</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BOARD_COLORS.map(c => (
              <div key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: 8, background: c, cursor: 'pointer', border: color === c ? `3px solid ${theme.text}` : '3px solid transparent', transform: color === c ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 14, color: theme.textMuted }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim()} style={{ flex: 2, background: title.trim() ? `linear-gradient(135deg, ${color}, #60a5fa)` : theme.border, color: 'white', border: 'none', borderRadius: 8, padding: '10px', cursor: title.trim() ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700 }}>Create Board</button>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [view, setView] = useState('boards');
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterPriority] = useState('all');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isMobile = windowWidth <= 640;
  const isTablet = windowWidth > 640 && windowWidth <= 1024;
  const isDesktop = windowWidth > 1024;
  const showSidebar = isDesktop || isTablet;
  const sidebarWidth = isDesktop ? 220 : 200;
  const bottomNavHeight = isMobile || isTablet ? 60 : 0;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const theme = {
    bg: darkMode ? '#0a0a0f' : '#f0f4f8',
    sidebar: darkMode ? '#111118' : '#ffffff',
    card: darkMode ? '#111118' : '#ffffff',
    border: darkMode ? '#2a2a38' : '#e0e0f0',
    text: darkMode ? '#f0f0f5' : '#1a1a2e',
    textMuted: darkMode ? '#9090a8' : '#6060a0',
    textDim: darkMode ? '#5a5a70' : '#9090b8',
    input: darkMode ? '#1e1e28' : '#ffffff',
    inputBorder: darkMode ? '#2a2a38' : '#d0d0e0',
    scrollbar: darkMode ? '#2a2a38' : '#c0c0d0',
  };

  const globalStyles = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; overflow: hidden; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${theme.bg}; color: ${theme.text}; transition: background 0.3s, color 0.3s; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: ${theme.scrollbar}; border-radius: 2px; }
    .input { width: 100%; background: ${theme.input}; border: 1px solid ${theme.inputBorder}; border-radius: 8px; padding: 10px 14px; font-family: inherit; font-size: 15px; color: ${theme.text}; outline: none; transition: all 0.2s; -webkit-appearance: none; }
    .input:focus { border-color: #7c6fff; box-shadow: 0 0 0 3px rgba(124,111,255,0.1); }
    .input::placeholder { color: ${theme.textDim}; }
    textarea.input { resize: vertical; min-height: 80px; line-height: 1.6; }
    select.input { cursor: pointer; }
    select option { background: ${theme.input}; color: ${theme.text}; }
    button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
    @media (max-width: 640px) { .input { font-size: 16px; } }
  `;

  const showToast = useCallback((message, type = 'info') => {
    const id = generateId();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.getMe()
        .then(res => setCurrentUser(res.data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const [boardsRes, usersRes] = await Promise.all([API.getBoards(), API.getUsers()]);
        setBoards(boardsRes.data);
        setUsers(usersRes.data);
        setWsConnected(true);
      } catch {
        showToast('Failed to load data', 'error');
      }
    };
    load();
  }, [currentUser, showToast]);

  useEffect(() => {
    if (!currentUser || boards.length === 0) return;
    const checkDueDates = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      boards.forEach(board => {
        board.lists.forEach(list => {
          list.tasks.forEach(task => {
            if (!task.dueDate) return;
            const due = new Date(task.dueDate);
            const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
            if (dueDay < today) {
              const alreadyNotified = notifications.some(n => n.taskId === (task._id || task.id) && n.type === 'overdue');
              if (!alreadyNotified) {
                const notif = { id: generateId(), taskId: task._id || task.id, text: `"${task.title}" is overdue`, time: 'just now', read: false, type: 'overdue' };
                setNotifications(p => [notif, ...p]);
                showToast(`"${task.title}" is overdue`, 'error');
              }
            } else if (dueDay.getTime() === today.getTime()) {
              const alreadyNotified = notifications.some(n => n.taskId === (task._id || task.id) && n.type === 'due_today');
              if (!alreadyNotified) {
                const notif = { id: generateId(), taskId: task._id || task.id, text: `"${task.title}" is due today`, time: 'just now', read: false, type: 'due_today' };
                setNotifications(p => [notif, ...p]);
                showToast(`"${task.title}" is due today`, 'info');
              }
            }
          });
        });
      });
    };
    checkDueDates();
    const interval = setInterval(checkDueDates, 60000);
    return () => clearInterval(interval);
  }, [boards, currentUser]); // eslint-disable-line

  const handleLogin = async () => {
    setAuthError('');
    if (!authForm.email || !authForm.password) { setAuthError('Please fill in all fields'); return; }
    try {
      setLoading(true);
      const res = await API.login({ email: authForm.email, password: authForm.password });
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.name}!`, 'success');
    } catch {
      setAuthError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setAuthError('');
    if (!authForm.name || !authForm.email || !authForm.password) { setAuthError('Please fill in all fields'); return; }
    if (authForm.password !== authForm.confirmPassword) { setAuthError('Passwords do not match'); return; }
    if (authForm.password.length < 6) { setAuthError('Password must be at least 6 characters'); return; }
    try {
      setLoading(true);
      const res = await API.register({ name: authForm.name, email: authForm.email, password: authForm.password, role: 'user' });
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      showToast(`Welcome, ${res.data.user.name}!`, 'success');
    } catch {
      setAuthError('Registration failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setBoards([]);
    setUsers([]);
    setWsConnected(false);
    setNotifications([]);
    setShowMobileMenu(false);
  };

  const updateProfile = async (updates) => {
    try {
      const res = await API.updateProfile(updates);
      setCurrentUser(p => ({ ...p, ...res.data }));
      showToast('Profile updated!', 'success');
    } catch {
      throw new Error('Failed to update profile');
    }
  };

  const addList = async (boardId, title) => {
    try {
      const res = await API.addList(boardId, { title, color: COLORS.accent });
      setBoards(p => p.map(b => b._id === boardId ? res.data : b));
    } catch { showToast('Failed to add list', 'error'); }
  };

  const addTask = async (boardId, listId, title) => {
    try {
      const res = await API.addTask(boardId, listId, { title });
      setBoards(p => p.map(b => b._id === boardId ? res.data : b));
      showToast('Task created', 'success');
    } catch { showToast('Failed to add task', 'error'); }
  };

  const updateTask = async (boardId, listId, taskId, updates) => {
    try {
      const res = await API.updateTask(boardId, listId, taskId, updates);
      setBoards(p => p.map(b => b._id === boardId ? res.data : b));
    } catch { showToast('Failed to update task', 'error'); }
  };

  const deleteTask = async (boardId, listId, taskId) => {
    try {
      const res = await API.deleteTask(boardId, listId, taskId);
      setBoards(p => p.map(b => b._id === boardId ? res.data : b));
      showToast('Task deleted', 'success');
    } catch { showToast('Failed to delete task', 'error'); }
  };

  const deleteList = async (boardId, listId) => {
    try {
      const res = await API.deleteList(boardId, listId);
      setBoards(p => p.map(b => b._id === boardId ? res.data : b));
      showToast('List deleted', 'success');
    } catch { showToast('Failed to delete list', 'error'); }
  };

  const renameList = async (boardId, listId, title) => {
    try {
      const res = await API.updateList(boardId, listId, { title });
      setBoards(p => p.map(b => b._id === boardId ? res.data : b));
    } catch { showToast('Failed to rename list', 'error'); }
  };

  const moveTask = async (taskId, boardId, fromListId, toListId) => {
    try {
      const res = await API.moveTask(boardId, taskId, { fromListId, toListId });
      setBoards(p => p.map(b => b._id === boardId ? res.data : b));
    } catch { showToast('Failed to move task', 'error'); }
  };

  const createBoard = async ({ title, description, color }) => {
    try {
      const res = await API.createBoard({ title, description, color });
      setBoards(p => [...p, res.data]);
      showToast('Board created!', 'success');
    } catch { showToast('Failed to create board', 'error'); }
  };

  const markRead = id => id === 'all'
    ? setNotifications(p => p.map(n => ({ ...n, read: true })))
    : setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));

  const searchResults = searchQuery.trim().length > 0
    ? boards.flatMap(board =>
        board.lists.flatMap(list =>
          list.tasks
            .filter(task => {
              const matchesSearch =
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
              const matchesPriorityFilter = filterPriority === 'all' || task.priority === filterPriority;
              return matchesSearch && matchesPriorityFilter;
            })
            .map(task => ({ task, listTitle: list.title, boardTitle: board.title, board }))
        )
      )
    : [];

  const unread = notifications.filter(n => !n.read).length;
  const currentBoard = selectedBoard ? boards.find(b => b._id === selectedBoard._id) : null;
  const priorityColor = { high: '#f87171', medium: '#fbbf24', low: '#4ade80' };
  const allTasks = boards.flatMap(b => b.lists.flatMap(l => l.tasks));
  const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
  const dueTodayTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length;

  const navItems = [
    { id: 'boards', label: 'Boards', icon: '⊞' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const navigate = (id) => {
    setView(id);
    setSelectedBoard(null);
    setShowSearch(false);
    setSearchQuery('');
    setShowMobileMenu(false);
    setShowNotifs(false);
  };

  // ─── AUTH SCREEN ───────────────────────────────────────────────────
  if (!currentUser) return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: darkMode ? 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)' : 'linear-gradient(135deg, #f0f4f8 0%, #e8e8ff 50%, #f0f4f8 100%)', padding: 16, overflowY: 'auto' }}>
        <div style={{ position: 'fixed', top: '10%', left: '10%', width: 300, height: 300, background: 'rgba(124,111,255,0.06)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: 400, height: 400, background: 'rgba(96,165,250,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <button onClick={() => setDarkMode(p => !p)} style={{ position: 'fixed', top: 16, right: 16, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: theme.textMuted, zIndex: 10 }}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <div style={{ width: '100%', maxWidth: 420, background: darkMode ? 'rgba(17,17,24,0.97)' : 'rgba(255,255,255,0.97)', border: `1px solid ${theme.border}`, borderRadius: 20, padding: isMobile ? '28px 20px' : '36px 28px', position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)', boxShadow: darkMode ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)', marginTop: isMobile ? 60 : 0, marginBottom: isMobile ? 20 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: theme.text }}>TaskFlow</div>
              <div style={{ fontSize: 12, color: theme.textDim }}>Project Management</div>
            </div>
          </div>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: theme.text, marginBottom: 4 }}>{isSignUp ? 'Create Account' : 'Welcome Back'}</div>
          <div style={{ fontSize: 14, color: theme.textMuted, marginBottom: 24 }}>{isSignUp ? 'Sign up for free today' : 'Sign in to your account'}</div>
          {isSignUp && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>Full Name</label>
              <input className="input" placeholder="John Doe" value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>Email Address</label>
            <input className="input" type="email" placeholder="you@example.com" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && !isSignUp) handleLogin(); }} />
          </div>
          <div style={{ marginBottom: isSignUp ? 14 : 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" placeholder="Min. 6 characters" type={showPassword ? 'text' : 'password'} value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') isSignUp ? handleRegister() : handleLogin(); }} style={{ paddingRight: 60 }} />
              <button onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          {isSignUp && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" placeholder="Repeat password" type={showConfirmPassword ? 'text' : 'password'} value={authForm.confirmPassword} onChange={e => setAuthForm(p => ({ ...p, confirmPassword: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') handleRegister(); }} style={{ paddingRight: 60 }} />
                <button onClick={() => setShowConfirmPassword(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>
          )}
          {authError && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
              ⚠️ {authError}
            </div>
          )}
          <button onClick={isSignUp ? handleRegister : handleLogin} style={{ width: '100%', background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 10, padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1, marginBottom: 20 }}>
            {loading ? '⏳ Please wait...' : isSignUp ? '🚀 Create Account' : '🔐 Sign In'}
          </button>

          {/* Forgot Password Link */}
          {!isSignUp && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <a href="/forgot-password" style={{ color: '#7c6fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Forgot Password?
              </a>
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: 14, color: theme.textMuted }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <span onClick={() => { setIsSignUp(p => !p); setAuthError(''); setShowPassword(false); setShowConfirmPassword(false); setAuthForm({ name: '', email: '', password: '', confirmPassword: '' }); }} style={{ color: '#7c6fff', cursor: 'pointer', marginLeft: 6, fontWeight: 600 }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </div>
        </div>
      </div>
      <Toast toasts={toasts} remove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </>
  );

  // ─── MAIN APP ──────────────────────────────────────────────────────
  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg }}>

        {/* Sidebar — Desktop & Tablet */}
        {showSidebar && (
          <div style={{ width: sidebarWidth, flexShrink: 0, background: theme.sidebar, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <div style={{ padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>⚡</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>TaskFlow</div>
            </div>
            <div style={{ flex: 1, padding: '12px 6px', overflowY: 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.textDim, padding: '0 8px', marginBottom: 6 }}>Workspace</div>
              {navItems.map(item => (
                <div key={item.id} onClick={() => navigate(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: view === item.id && !selectedBoard ? '#7c6fff' : theme.textMuted, background: view === item.id && !selectedBoard ? 'rgba(124,111,255,0.1)' : 'transparent', marginBottom: 2, transition: 'all 0.15s' }}>
                  <span>{item.icon}</span>
                  {item.label}
                </div>
              ))}
              {(overdueTasks > 0 || dueTodayTasks > 0) && (
                <div style={{ margin: '10px 6px', padding: '8px 10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8 }}>
                  {overdueTasks > 0 && <div style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>🔴 {overdueTasks} overdue</div>}
                  {dueTodayTasks > 0 && <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600, marginTop: overdueTasks > 0 ? 4 : 0 }}>🟡 {dueTodayTasks} due today</div>}
                </div>
              )}
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.textDim, padding: '10px 8px 6px' }}>Boards</div>
              {boards.map(b => (
                <div key={b._id} onClick={() => { setSelectedBoard(b); setView('board'); setShowSearch(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: currentBoard?._id === b._id ? '#7c6fff' : theme.textMuted, background: currentBoard?._id === b._id ? 'rgba(124,111,255,0.1)' : 'transparent', overflow: 'hidden', marginBottom: 2, transition: 'all 0.15s' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 6px', borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', marginBottom: 4, fontSize: 11, color: theme.textDim }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: wsConnected ? '#4ade80' : '#f87171' }} />
                {wsConnected ? 'Connected' : 'Connecting...'}
              </div>
              <div onClick={() => navigate('profile')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}>
                <Avatar user={currentUser} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
                  <div style={{ fontSize: 10, color: theme.textDim, textTransform: 'capitalize' }}>{currentUser.role}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Header */}
          <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: `1px solid ${theme.border}`, background: theme.sidebar, gap: 8, flexShrink: 0 }}>
            {isMobile && (
              <button onClick={() => setShowMobileMenu(true)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: theme.textMuted, fontSize: 16, flexShrink: 0, lineHeight: 1 }}>☰</button>
            )}
            {!showSearch && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {view === 'board' && currentBoard ? (
                  <>
                    <button onClick={() => { setSelectedBoard(null); setView('boards'); }} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '5px 8px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>← Back</button>
                    <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentBoard.title}</div>
                  </>
                ) : (
                  <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: theme.text }}>
                    {view === 'boards' ? 'My Boards' : view === 'analytics' ? 'Analytics' : view === 'members' ? 'Team Members' : 'Profile'}
                  </div>
                )}
              </div>
            )}
            {showSearch && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input autoFocus className="input" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); } }} style={{ fontSize: 14 }} />
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '8px 10px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>✕</button>
              </div>
            )}
            {!showSearch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {view === 'boards' && (
                  <button onClick={() => setShowCreateBoard(true)} style={{ background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 6, padding: isMobile ? '7px 10px' : '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {isMobile ? '+' : '+ New'}
                  </button>
                )}
                {!isMobile && (
                  <>
                    <button onClick={() => setShowSearch(true)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '6px 10px', fontSize: 12 }}>🔍</button>
                    <button onClick={() => setDarkMode(p => !p)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '6px 10px', fontSize: 12 }}>{darkMode ? '☀️' : '🌙'}</button>
                  </>
                )}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowNotifs(p => !p)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '6px 10px', fontSize: 12, position: 'relative' }}>
                    🔔
                    {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#7c6fff', color: 'white', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
                  </button>
                  {showNotifs && <NotificationsPanel notifications={notifications} onMarkRead={markRead} />}
                </div>
                <div onClick={() => navigate('profile')} style={{ cursor: 'pointer', flexShrink: 0 }}>
                  <Avatar user={currentUser} size={30} />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileMenu && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} onClick={() => setShowMobileMenu(false)} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: Math.min(280, windowWidth * 0.82), background: theme.sidebar, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', zIndex: 301 }}>
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>TaskFlow</div>
                  </div>
                  <button onClick={() => setShowMobileMenu(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 22, padding: '4px 8px' }}>✕</button>
                </div>
                <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.textDim, padding: '0 10px', marginBottom: 8 }}>Workspace</div>
                  {navItems.map(item => (
                    <div key={item.id} onClick={() => navigate(item.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 500, color: view === item.id && !selectedBoard ? '#7c6fff' : theme.textMuted, background: view === item.id && !selectedBoard ? 'rgba(124,111,255,0.1)' : 'transparent', marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.textDim, padding: '12px 10px 8px' }}>Boards</div>
                  {boards.length === 0 && <div style={{ padding: '8px 14px', fontSize: 13, color: theme.textDim }}>No boards yet</div>}
                  {boards.map(b => (
                    <div key={b._id} onClick={() => { setSelectedBoard(b); setView('board'); setShowMobileMenu(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 14, color: currentBoard?._id === b._id ? '#7c6fff' : theme.textMuted, background: currentBoard?._id === b._id ? 'rgba(124,111,255,0.1)' : 'transparent', marginBottom: 2 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 14px', borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <Avatar user={currentUser} size={38} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
                      <div style={{ fontSize: 12, color: theme.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setDarkMode(p => !p)} style={{ flex: 1, background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px 8px', cursor: 'pointer', fontSize: 13, color: theme.textMuted }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
                    <button onClick={handleLogout} style={{ flex: 1, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 8px', cursor: 'pointer', fontSize: 13, color: '#f87171', fontWeight: 600 }}>Sign Out</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {showSearch && searchQuery.trim() && (
            <div style={{ flex: 1, overflowY: 'auto', background: theme.bg, padding: 16, paddingBottom: bottomNavHeight + 16 }}>
              <div style={{ fontSize: 13, color: theme.textDim, marginBottom: 12 }}>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</div>
              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: theme.textDim }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: theme.textMuted, marginBottom: 6 }}>No results found</div>
                  <div style={{ fontSize: 13 }}>Try different keywords</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {searchResults.map(({ task, listTitle, boardTitle, board }) => (
                    <div key={task._id || task.id} onClick={() => { setSelectedBoard(board); setView('board'); setShowSearch(false); setSearchQuery(''); }}
                      style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 14, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 4, minHeight: 36, borderRadius: 2, background: priorityColor[task.priority] || '#7c6fff', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{task.title}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, background: 'rgba(124,111,255,0.15)', color: '#7c6fff', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{boardTitle}</span>
                          <span style={{ fontSize: 11, color: theme.textDim }}>{listTitle}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Views */}
          {(!showSearch || !searchQuery.trim()) && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: bottomNavHeight }}>
              {view === 'boards' && (
                <div style={{ flex: 1, overflowY: 'auto', background: theme.bg }}>
                  {boards.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.textDim, padding: 24, textAlign: 'center' }}>
                      <div style={{ width: 72, height: 72, background: 'rgba(124,111,255,0.1)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 32 }}>⊞</div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: theme.textMuted }}>No boards yet</div>
                      <div style={{ fontSize: 14, marginBottom: 24 }}>Create your first board to get started</div>
                      <button onClick={() => setShowCreateBoard(true)} style={{ background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Create First Board</button>
                    </div>
                  ) : (
                    <div style={{ padding: isMobile ? 12 : 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: isMobile ? 10 : 14 }}>
                        {boards.map(board => {
                          const total = board.lists.reduce((s, l) => s + l.tasks.length, 0);
                          const done = (board.lists.find(l => l.title.toLowerCase() === 'done') || { tasks: [] }).tasks.length;
                          const overdue = board.lists.flatMap(l => l.tasks).filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
                          return (
                            <div key={board._id} onClick={() => { setSelectedBoard(board); setView('board'); }}
                              style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: isMobile ? 14 : 18, cursor: 'pointer', position: 'relative', overflow: 'hidden', WebkitTapHighlightColor: 'transparent' }}>
                              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: board.color }} />
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, marginTop: 4 }}>
                                <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: theme.text, flex: 1, paddingRight: 8 }}>{board.title}</div>
                                {overdue > 0 && <span style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>{overdue} overdue</span>}
                              </div>
                              <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>{board.description || 'No description'}</div>
                              {total > 0 && (
                                <div style={{ marginBottom: 10 }}>
                                  <div style={{ height: 4, background: darkMode ? '#1e1e28' : '#e0e0f0', borderRadius: 2 }}>
                                    <div style={{ height: '100%', borderRadius: 2, width: `${(done / total) * 100}%`, background: 'linear-gradient(90deg, #7c6fff, #4ade80)' }} />
                                  </div>
                                  <div style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>{done} of {total} done</div>
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: 14 }}>
                                <span style={{ fontSize: 12, color: theme.textDim }}><strong style={{ color: theme.textMuted }}>{board.lists.length}</strong> lists</span>
                                <span style={{ fontSize: 12, color: theme.textDim }}><strong style={{ color: theme.textMuted }}>{total}</strong> tasks</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {view === 'board' && currentBoard && (
                <div style={{ flex: 1, overflow: 'hidden', background: theme.bg }}>
                  <BoardView board={currentBoard} users={users} currentUser={currentUser} boards={boards} onAddList={addList} onAddTask={addTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} onDeleteList={deleteList} onRenameList={renameList} onMoveTask={moveTask} showToast={showToast} />
                </div>
              )}
              {view === 'analytics' && <Analytics boards={boards} users={users} />}
              {view === 'members' && <Members users={users} currentUser={currentUser} />}
              {view === 'profile' && <Profile currentUser={currentUser} onUpdateProfile={updateProfile} onLogout={handleLogout} theme={theme} darkMode={darkMode} />}
            </div>
          )}

          {/* Bottom Nav — Mobile & Tablet */}
          {(isMobile || isTablet) && (
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: theme.sidebar, borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 100, height: bottomNavHeight, paddingBottom: 'env(safe-area-inset-bottom)' }}>
              {navItems.map(item => (
                <div key={item.id} onClick={() => navigate(item.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 0', cursor: 'pointer', flex: 1, WebkitTapHighlightColor: 'transparent' }}>
                  <span style={{ fontSize: isTablet ? 20 : 18, lineHeight: 1 }}>{item.icon}</span>
                  <span style={{ fontSize: isTablet ? 12 : 10, fontWeight: 600, color: view === item.id && !selectedBoard ? '#7c6fff' : theme.textDim }}>{item.label}</span>
                  {view === item.id && !selectedBoard && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c6fff' }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateBoard && <CreateBoardModal theme={theme} onClose={() => setShowCreateBoard(false)} onCreate={createBoard} />}
      {showNotifs && <div style={{ position: 'fixed', inset: 0, zIndex: 499 }} onClick={() => setShowNotifs(false)} />}
      <Toast toasts={toasts} remove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/*" element={<MainApp />} />
    </Routes>
  );
}