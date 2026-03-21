import { useState, useEffect, useCallback } from 'react';
import { COLORS } from './constants/data';
import { generateId } from './utils/helpers';
import * as API from './api/index';
import BoardView from './BoardView';
import Analytics from './Analytics';
import Members from './Members';
import NotificationsPanel from './NotificationsPanel';
import Profile from './Profile';
import { Avatar, Toast } from './UI';

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ width: 460, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>Create New Board</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        <div style={{ height: 80, borderRadius: 10, background: `linear-gradient(135deg, ${color}22, ${color}44)`, border: `2px solid ${color}`, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{title || 'Board Preview'}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Board Title *</div>
          <input className="input" placeholder="e.g. Product Roadmap" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Description</div>
          <input className="input" placeholder="What is this board for?" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.textDim, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Board Color</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BOARD_COLORS.map(c => (
              <div key={c} onClick={() => setColor(c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, cursor: 'pointer', border: color === c ? `3px solid ${theme.text}` : '3px solid transparent', transform: color === c ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 14, color: theme.textMuted }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim()} style={{ flex: 2, background: title.trim() ? `linear-gradient(135deg, ${color}, #60a5fa)` : theme.border, color: 'white', border: 'none', borderRadius: 8, padding: '10px', cursor: title.trim() ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 700 }}>🚀 Create Board</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
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
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateBoard, setShowCreateBoard] = useState(false);

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
    body { font-family: 'Segoe UI', sans-serif; background: ${theme.bg}; color: ${theme.text}; transition: background 0.3s, color 0.3s; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-thumb { background: ${theme.scrollbar}; border-radius: 2px; }
    .input { width: 100%; background: ${theme.input}; border: 1px solid ${theme.inputBorder}; border-radius: 6px; padding: 9px 12px; font-family: inherit; font-size: 13px; color: ${theme.text}; outline: none; transition: all 0.2s; }
    .input:focus { border-color: #7c6fff; box-shadow: 0 0 0 3px rgba(124,111,255,0.1); }
    .input::placeholder { color: ${theme.textDim}; }
    textarea.input { resize: vertical; min-height: 60px; line-height: 1.5; }
    select.input { cursor: pointer; }
  `;

  const showToast = useCallback((message, type = 'info') => {
    const id = generateId();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
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

  // Due Date Reminders
  useEffect(() => {
    if (!currentUser || boards.length === 0) return;
    const checkDueDates = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      boards.forEach(board => {
        board.lists.forEach(list => {
          list.tasks.forEach(task => {
            if (!task.dueDate) return;
            const due = new Date(task.dueDate);
            const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
            if (dueDay < today) {
              const alreadyNotified = notifications.some(n => n.taskId === (task._id || task.id) && n.type === 'overdue');
              if (!alreadyNotified) {
                const notif = { id: generateId(), taskId: task._id || task.id, text: `⚠️ "${task.title}" is overdue!`, time: 'just now', read: false, type: 'overdue', boardTitle: board.title };
                setNotifications(p => [notif, ...p]);
                showToast(`⚠️ "${task.title}" is overdue!`, 'error');
              }
            } else if (dueDay.getTime() === today.getTime()) {
              const alreadyNotified = notifications.some(n => n.taskId === (task._id || task.id) && n.type === 'due_today');
              if (!alreadyNotified) {
                const notif = { id: generateId(), taskId: task._id || task.id, text: `📅 "${task.title}" is due today!`, time: 'just now', read: false, type: 'due_today', boardTitle: board.title };
                setNotifications(p => [notif, ...p]);
                showToast(`📅 "${task.title}" is due today!`, 'info');
              }
            } else if (dueDay.getTime() === tomorrow.getTime()) {
              const alreadyNotified = notifications.some(n => n.taskId === (task._id || task.id) && n.type === 'due_tomorrow');
              if (!alreadyNotified) {
                const notif = { id: generateId(), taskId: task._id || task.id, text: `⏰ "${task.title}" is due tomorrow!`, time: 'just now', read: false, type: 'due_tomorrow', boardTitle: board.title };
                setNotifications(p => [notif, ...p]);
                showToast(`⏰ "${task.title}" is due tomorrow`, 'info');
              }
            }
          });
        });
      });
    };
    checkDueDates();
    const interval = setInterval(checkDueDates, 60000);
    return () => clearInterval(interval);
  }, [boards, currentUser]);

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
              const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
              const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
              return matchesSearch && matchesPriority;
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
  const dueTodayTasks = allTasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    const today = new Date();
    return due.toDateString() === today.toDateString();
  }).length;

  if (!currentUser) return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: darkMode ? 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)' : 'linear-gradient(135deg, #f0f4f8 0%, #e8e8ff 50%, #f0f4f8 100%)', transition: 'background 0.3s' }}>
        <div style={{ position: 'fixed', top: '10%', left: '10%', width: 300, height: 300, background: 'rgba(124,111,255,0.06)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: 400, height: 400, background: 'rgba(96,165,250,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <button onClick={() => setDarkMode(p => !p)} style={{ position: 'fixed', top: 20, right: 20, background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 18, zIndex: 10 }}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        <div style={{ width: 440, background: darkMode ? 'rgba(17,17,24,0.95)' : 'rgba(255,255,255,0.95)', border: `1px solid ${theme.border}`, borderRadius: 16, padding: 40, position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)', boxShadow: darkMode ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: theme.text }}>TaskFlow</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: theme.text, marginBottom: 6 }}>{isSignUp ? 'Create Account' : 'Welcome back'}</div>
          <div style={{ fontSize: 14, color: theme.textMuted, marginBottom: 24 }}>{isSignUp ? 'Sign up for free today' : 'Sign in to your account'}</div>
          {isSignUp && <div style={{ marginBottom: 10 }}><input className="input" placeholder="Full Name" value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))} /></div>}
          <div style={{ marginBottom: 10 }}>
            <input className="input" placeholder="Email address" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && !isSignUp) handleLogin(); }} />
          </div>
          <div style={{ position: 'relative', marginBottom: isSignUp ? 10 : 16 }}>
            <input className="input" placeholder="Password" type={showPassword ? 'text' : 'password'} value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') isSignUp ? handleRegister() : handleLogin(); }} style={{ paddingRight: 44 }} />
            <span onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 18, userSelect: 'none' }}>{showPassword ? '👁️' : '🙈'}</span>
          </div>
          {isSignUp && (
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input className="input" placeholder="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={authForm.confirmPassword} onChange={e => setAuthForm(p => ({ ...p, confirmPassword: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') handleRegister(); }} style={{ paddingRight: 44 }} />
              <span onClick={() => setShowConfirmPassword(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 18, userSelect: 'none' }}>{showConfirmPassword ? '👁️' : '🙈'}</span>
            </div>
          )}
          {authError && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>⚠️ {authError}</div>}
          <button onClick={isSignUp ? handleRegister : handleLogin} style={{ width: '100%', background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 8, padding: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Please wait...' : isSignUp ? '🚀 Create Account' : '🔐 Sign In'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: theme.textMuted }}>
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

  const navItem = (id, icon, label, badge) => (
    <div onClick={() => { setView(id); setSelectedBoard(null); setShowSearch(false); setSearchQuery(''); }}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: view === id && !selectedBoard ? '#7c6fff' : theme.textMuted, background: view === id && !selectedBoard ? 'rgba(124,111,255,0.08)' : 'transparent' }}>
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && <span style={{ background: '#f87171', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>{badge}</span>}
    </div>
  );

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg }}>

        {/* Sidebar */}
        <div style={{ width: 240, flexShrink: 0, background: theme.sidebar, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', transition: 'background 0.3s' }}>
          <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${theme.border}`, fontSize: 18, fontWeight: 800 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
            <span style={{ color: theme.text }}>TaskFlow</span>
          </div>

          <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.textDim, padding: '0 8px', marginBottom: 6, fontFamily: 'monospace' }}>Workspace</div>
            {navItem('boards', '▦', 'Boards')}
            {navItem('analytics', '📊', 'Analytics')}
            {navItem('members', '👥', 'Members')}
            {navItem('profile', '👤', 'Profile')}

            {/* Due Date Summary */}
            {(overdueTasks > 0 || dueTodayTasks > 0) && (
              <div style={{ margin: '10px 8px', padding: '10px 12px', background: overdueTasks > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)', border: `1px solid ${overdueTasks > 0 ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'}`, borderRadius: 8 }}>
                {overdueTasks > 0 && <div style={{ fontSize: 12, color: '#f87171', fontWeight: 600, marginBottom: dueTodayTasks > 0 ? 4 : 0 }}>⚠️ {overdueTasks} overdue</div>}
                {dueTodayTasks > 0 && <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>📅 {dueTodayTasks} due today</div>}
              </div>
            )}

            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.textDim, padding: '12px 8px 6px', fontFamily: 'monospace' }}>Boards</div>
            {boards.map(b => {
              const boardOverdue = b.lists.flatMap(l => l.tasks).filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
              return (
                <div key={b._id} onClick={() => { setSelectedBoard(b); setView('board'); setShowSearch(false); setSearchQuery(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: currentBoard?._id === b._id ? '#7c6fff' : theme.textMuted, background: currentBoard?._id === b._id ? 'rgba(124,111,255,0.08)' : 'transparent', overflow: 'hidden' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{b.title}</span>
                  {boardOverdue > 0 && <span style={{ background: '#f87171', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8, flexShrink: 0 }}>{boardOverdue}</span>}
                </div>
              );
            })}
          </div>

          <div style={{ padding: '12px 8px', borderTop: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', marginBottom: 8, fontSize: 11, color: theme.textDim, fontFamily: 'monospace' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: wsConnected ? '#4ade80' : '#f87171', boxShadow: wsConnected ? '0 0 6px #4ade80' : 'none' }} />
              {wsConnected ? 'Live' : 'Connecting...'}
            </div>
            <div onClick={() => { setView('profile'); setSelectedBoard(null); }} title="Click to view profile"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', background: view === 'profile' ? 'rgba(124,111,255,0.08)' : 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,111,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = view === 'profile' ? 'rgba(124,111,255,0.08)' : 'transparent'}>
              <Avatar user={currentUser} size={32} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{currentUser.name}</div>
                <div style={{ fontSize: 10, color: theme.textDim, fontFamily: 'monospace', textTransform: 'uppercase' }}>{currentUser.role}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: theme.textDim }}>›</span>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${theme.border}`, background: theme.sidebar, gap: 12, transition: 'background 0.3s' }}>
            {view === 'board' && currentBoard && !showSearch && (
              <>
                <button onClick={() => { setSelectedBoard(null); setView('boards'); }} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '5px 10px', fontSize: 12 }}>← Boards</button>
                <div style={{ width: 1, height: 20, background: theme.border }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{currentBoard.title}</div>
              </>
            )}
            {view !== 'board' && !showSearch && (
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>
                {view === 'boards' ? 'My Boards' : view === 'analytics' ? 'Analytics' : view === 'members' ? 'Team Members' : view === 'profile' ? 'My Profile' : ''}
              </div>
            )}

            {showSearch && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
                  <input autoFocus className="input" placeholder="Search tasks, boards, tags..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); } }}
                    style={{ paddingLeft: 36 }} />
                </div>
                <select className="input" value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 130 }}>
                  <option value="all">All Priorities</option>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); setFilterPriority('all'); }}
                  style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '6px 10px', fontSize: 12, whiteSpace: 'nowrap' }}>
                  ✕ Close
                </button>
              </div>
            )}

            <div style={{ marginLeft: showSearch ? 0 : 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              {view === 'boards' && !showSearch && (
                <button onClick={() => setShowCreateBoard(true)}
                  style={{ background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  + New Board
                </button>
              )}
              <button onClick={() => { setShowSearch(p => !p); if (showSearch) { setSearchQuery(''); setFilterPriority('all'); } }}
                style={{ background: showSearch ? 'rgba(124,111,255,0.15)' : 'transparent', border: `1px solid ${showSearch ? '#7c6fff' : theme.border}`, borderRadius: 6, color: showSearch ? '#7c6fff' : theme.textMuted, cursor: 'pointer', padding: '6px 10px', fontSize: 16 }}>
                🔍
              </button>
              <button onClick={() => setDarkMode(p => !p)}
                style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '6px 10px', fontSize: 16 }}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowNotifs(p => !p)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: 6, color: theme.textMuted, cursor: 'pointer', padding: '6px 8px', position: 'relative' }}>
                  🔔
                  {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#7c6fff', color: 'white', fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
                </button>
                {showNotifs && <NotificationsPanel notifications={notifications} onMarkRead={markRead} />}
              </div>
              <Avatar user={currentUser} size={32} onClick={() => { setView('profile'); setSelectedBoard(null); }} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          {showSearch && searchQuery.trim() && (
            <div style={{ flex: 1, overflowY: 'auto', background: theme.bg, padding: 24 }}>
              <div style={{ fontSize: 13, color: theme.textDim, marginBottom: 16, fontFamily: 'monospace' }}>
                Found <strong style={{ color: theme.textMuted }}>{searchResults.length}</strong> result{searchResults.length !== 1 ? 's' : ''} for "<strong style={{ color: '#7c6fff' }}>{searchQuery}</strong>"
              </div>
              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: theme.textDim }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: theme.textMuted, marginBottom: 8 }}>No results found</div>
                  <div style={{ fontSize: 13 }}>Try different keywords or adjust the priority filter</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {searchResults.map(({ task, listTitle, boardTitle, board }) => (
                    <div key={task._id || task.id} onClick={() => { setSelectedBoard(board); setView('board'); setShowSearch(false); setSearchQuery(''); }}
                      style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 16, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6fff'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateX(0)'; }}>
                      <div style={{ width: 4, minHeight: 40, borderRadius: 2, background: priorityColor[task.priority] || '#7c6fff', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{task.title}</div>
                        {task.description && <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 6 }}>{task.description}</div>}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, background: 'rgba(124,111,255,0.15)', color: '#7c6fff', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>{boardTitle}</span>
                          <span style={{ fontSize: 11, color: theme.textDim }}>→</span>
                          <span style={{ fontSize: 11, background: darkMode ? '#1e1e28' : '#f0f0ff', color: theme.textMuted, padding: '2px 8px', borderRadius: 10 }}>{listTitle}</span>
                          {task.priority && <span style={{ fontSize: 10, background: priorityColor[task.priority] + '20', color: priorityColor[task.priority], padding: '2px 8px', borderRadius: 10, fontWeight: 600, textTransform: 'uppercase' }}>{task.priority}</span>}
                          {task.dueDate && <span style={{ fontSize: 11, color: new Date(task.dueDate) < new Date() ? '#f87171' : theme.textDim, fontFamily: 'monospace' }}>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(!showSearch || !searchQuery.trim()) && (
            <>
              {view === 'boards' && (
                <div style={{ flex: 1, overflowY: 'auto', background: theme.bg }}>
                  {boards.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: theme.textDim }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: theme.textMuted }}>No boards yet</div>
                      <div style={{ fontSize: 14, marginBottom: 24 }}>Create your first board to get started</div>
                      <button onClick={() => setShowCreateBoard(true)}
                        style={{ background: 'linear-gradient(135deg, #7c6fff, #60a5fa)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                        + Create Board
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 16, padding: 24 }}>
                      {boards.map(board => {
                        const total = board.lists.reduce((s, l) => s + l.tasks.length, 0);
                        const done = (board.lists.find(l => l.title.toLowerCase() === 'done') || { tasks: [] }).tasks.length;
                        const overdue = board.lists.flatMap(l => l.tasks).filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
                        return (
                          <div key={board._id} onClick={() => { setSelectedBoard(board); setView('board'); }}
                            style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 20, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6fff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,111,255,0.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: board.color }} />
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                              <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{board.title}</div>
                              {overdue > 0 && <span style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>⚠️ {overdue}</span>}
                            </div>
                            <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 12 }}>{board.description || 'No description'}</div>
                            {total > 0 && (
                              <div style={{ marginBottom: 12 }}>
                                <div style={{ height: 4, background: darkMode ? '#1e1e28' : '#e0e0f0', borderRadius: 2 }}>
                                  <div style={{ height: '100%', borderRadius: 2, width: `${(done / total) * 100}%`, background: 'linear-gradient(90deg, #7c6fff, #4ade80)' }} />
                                </div>
                                <div style={{ fontSize: 11, color: theme.textDim, fontFamily: 'monospace', marginTop: 4 }}>{done}/{total} done</div>
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 16 }}>
                              <span style={{ fontSize: 11, color: theme.textDim, fontFamily: 'monospace' }}><strong style={{ color: theme.textMuted }}>{board.lists.length}</strong> lists</span>
                              <span style={{ fontSize: 11, color: theme.textDim, fontFamily: 'monospace' }}><strong style={{ color: theme.textMuted }}>{total}</strong> tasks</span>
                            </div>
                          </div>
                        );
                      })}
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
              {view === 'profile' && (
                <Profile
                  currentUser={currentUser}
                  onUpdateProfile={updateProfile}
                  onLogout={handleLogout}
                  theme={theme}
                  darkMode={darkMode}
                />
              )}
            </>
          )}
        </div>
      </div>

      {showCreateBoard && <CreateBoardModal theme={theme} onClose={() => setShowCreateBoard(false)} onCreate={createBoard} />}
      {showNotifs && <div style={{ position: 'fixed', inset: 0, zIndex: 499 }} onClick={() => setShowNotifs(false)} />}
      <Toast toasts={toasts} remove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </>
  );
}