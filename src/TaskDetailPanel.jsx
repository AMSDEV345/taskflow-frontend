import { useState } from 'react';
import { COLORS } from './constants/data';
import { generateId, timeAgo } from './utils/helpers';
import { Avatar, PriorityBadge } from './UI';

const LABEL_COLORS = [
  { name: 'Purple', color: '#7c6fff' },
  { name: 'Blue', color: '#60a5fa' },
  { name: 'Green', color: '#4ade80' },
  { name: 'Yellow', color: '#fbbf24' },
  { name: 'Red', color: '#f87171' },
  { name: 'Pink', color: '#f472b6' },
  { name: 'Orange', color: '#fb923c' },
  { name: 'Teal', color: '#2dd4bf' },
];

const PRESET_LABELS = [
  { id: 'l1', name: 'Bug', color: '#f87171' },
  { id: 'l2', name: 'Feature', color: '#7c6fff' },
  { id: 'l3', name: 'Urgent', color: '#fb923c' },
  { id: 'l4', name: 'Design', color: '#f472b6' },
  { id: 'l5', name: 'Backend', color: '#60a5fa' },
  { id: 'l6', name: 'Frontend', color: '#4ade80' },
  { id: 'l7', name: 'Testing', color: '#fbbf24' },
  { id: 'l8', name: 'Docs', color: '#2dd4bf' },
];

export default function TaskDetailPanel({ task, boardId, listId, users, currentUser, boards, onClose, onUpdate, onDelete, onMoveTask }) {
  const [comment, setComment] = useState('');
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [newCheck, setNewCheck] = useState('');
  const [newTag, setNewTag] = useState('');
  
  
  
  const board = boards.find(b => b._id === boardId || b.id === boardId);
  const done = task.checklist?.filter(c => c.done).length || 0;
  const total = task.checklist?.length || 0;

  const addComment = () => {
    if (!comment.trim()) return;
    onUpdate(boardId, listId, task._id || task.id, {
      comments: [...(task.comments || []), {
        id: generateId(),
        userId: currentUser._id || currentUser.id,
        text: comment,
        createdAt: new Date().toISOString()
      }]
    });
    setComment('');
  };

  const toggleCheck = id => onUpdate(boardId, listId, task._id || task.id, {
    checklist: task.checklist.map(c => c.id === id || c._id === id ? { ...c, done: !c.done } : c)
  });

  const addCheck = () => {
    if (!newCheck.trim()) return;
    onUpdate(boardId, listId, task._id || task.id, {
      checklist: [...(task.checklist || []), { id: generateId(), text: newCheck, done: false }]
    });
    setNewCheck('');
  };

  const toggleAssignee = uid => {
    const assignees = task.assignees || [];
    onUpdate(boardId, listId, task._id || task.id, {
      assignees: assignees.includes(uid) ? assignees.filter(x => x !== uid) : [...assignees, uid]
    });
  };

  const removeTag = tag => onUpdate(boardId, listId, task._id || task.id, {
    tags: (task.tags || []).filter(t => t !== tag)
  });

  const addTag = () => {
    if (!newTag.trim()) return;
    if ((task.tags || []).includes(newTag.trim())) return;
    onUpdate(boardId, listId, task._id || task.id, { tags: [...(task.tags || []), newTag.trim()] });
    setNewTag('');
  };

  const addLabel = (labelName) => {
    if ((task.tags || []).includes(labelName)) return;
    onUpdate(boardId, listId, task._id || task.id, { tags: [...(task.tags || []), labelName] });
  };

  

  const getTagColor = (tag) => {
    const preset = PRESET_LABELS.find(l => l.name.toLowerCase() === tag.toLowerCase());
    if (preset) return preset.color;
    return '#7c6fff';
  };

  const label = (text) => (
    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#5a5a70', marginBottom: 8, fontFamily: 'monospace' }}>{text}</div>
  );

  return (
    <div style={{ width: 420, flexShrink: 0, background: '#111118', borderLeft: '1px solid #2a2a38', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a38', display: 'flex', alignItems: 'center', gap: 10 }}>
        <PriorityBadge priority={task.priority} />
        <div style={{ flex: 1 }} />
        <button onClick={() => onDelete(boardId, listId, task._id || task.id)} style={{ background: 'none', border: '1px solid #2a2a38', borderRadius: 6, color: '#9090a8', cursor: 'pointer', padding: '6px 8px' }}>🗑</button>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #2a2a38', borderRadius: 6, color: '#9090a8', cursor: 'pointer', padding: '6px 8px' }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

        {/* Title */}
        <textarea value={editTitle} rows={2}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={() => onUpdate(boardId, listId, task._id || task.id, { title: editTitle })}
          style={{ width: '100%', fontSize: 18, fontWeight: 700, background: 'transparent', border: 'none', outline: 'none', color: '#f0f0f5', resize: 'none', fontFamily: 'inherit', marginBottom: 16 }} />

        {/* Labels Section */}
        <div style={{ marginBottom: 20 }}>
          {label('Labels')}

          {/* Current Labels */}
          {(task.tags || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {(task.tags || []).map(t => (
                <span key={t} onClick={() => removeTag(t)}
                  style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: getTagColor(t) + '25', color: getTagColor(t), cursor: 'pointer', border: `1px solid ${getTagColor(t)}50`, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = getTagColor(t) + '40'}
                  onMouseLeave={e => e.currentTarget.style.background = getTagColor(t) + '25'}>
                  {t} <span style={{ fontSize: 10 }}>✕</span>
                </span>
              ))}
            </div>
          )}

          {/* Preset Labels */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: '#5a5a70', marginBottom: 6 }}>Quick Labels:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_LABELS.map(pl => {
                const active = (task.tags || []).includes(pl.name);
                return (
                  <span key={pl.id} onClick={() => active ? removeTag(pl.name) : addLabel(pl.name)}
                    style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: active ? pl.color + '30' : '#1e1e28', color: active ? pl.color : '#5a5a70', cursor: 'pointer', border: `1px solid ${active ? pl.color + '60' : '#2a2a38'}`, transition: 'all 0.2s' }}>
                    {active ? '✓ ' : '+ '}{pl.name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Custom Tag Input */}
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="input" placeholder="Custom label..." value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
              style={{ fontSize: 12 }} />
            <button onClick={addTag} style={{ background: '#7c6fff', color: 'white', border: 'none', borderRadius: 6, padding: '0 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Add</button>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          {label('Description')}
          <textarea className="input" value={editDesc} rows={3} placeholder="Add a description..."
            onChange={e => setEditDesc(e.target.value)}
            onBlur={() => onUpdate(boardId, listId, task._id || task.id, { description: editDesc })} />
        </div>

        {/* Priority & Due Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            {label('Priority')}
            <select className="input" value={task.priority || 'medium'}
              onChange={e => onUpdate(boardId, listId, task._id || task.id, { priority: e.target.value })}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div>
            {label('Due Date')}
            <input type="date" className="input" value={task.dueDate ? task.dueDate.split('T')[0] : ''}
              onChange={e => onUpdate(boardId, listId, task._id || task.id, { dueDate: e.target.value })} />
          </div>
        </div>

        {/* Move to List */}
        {board && (
          <div style={{ marginBottom: 20 }}>
            {label('Move to List')}
            <select className="input" value={listId}
              onChange={e => { if (e.target.value !== listId) onMoveTask(task._id || task.id, boardId, listId, e.target.value); }}>
              {board.lists.map(l => <option key={l._id || l.id} value={l._id || l.id}>{l.title}</option>)}
            </select>
          </div>
        )}

        {/* Assignees */}
        <div style={{ marginBottom: 20 }}>
          {label('Assignees')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {users.map(u => {
              const active = (task.assignees || []).includes(u._id || u.id);
              return (
                <div key={u._id || u.id} onClick={() => toggleAssignee(u._id || u.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${active ? (u.color || '#7c6fff') : '#2a2a38'}`, background: active ? (u.color || '#7c6fff') + '20' : 'transparent', transition: 'all 0.2s' }}>
                  <Avatar user={u} size={18} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: active ? (u.color || '#7c6fff') : '#9090a8' }}>{u.name?.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checklist */}
        <div style={{ marginBottom: 20 }}>
          {label(`Checklist ${total > 0 ? `${done}/${total}` : ''}`)}
          {total > 0 && (
            <div style={{ height: 4, background: '#1e1e28', borderRadius: 2, marginBottom: 10 }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${(done / total) * 100}%`, background: done === total ? COLORS.green : COLORS.accent, transition: 'width 0.3s' }} />
            </div>
          )}
          {(task.checklist || []).map(item => (
            <div key={item._id || item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <input type="checkbox" checked={item.done}
                onChange={() => toggleCheck(item._id || item.id)}
                style={{ accentColor: '#7c6fff', width: 16, height: 16 }} />
              <span style={{ fontSize: 13, color: '#f0f0f5', textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }}>{item.text}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input className="input" placeholder="Add item..." value={newCheck}
              onChange={e => setNewCheck(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCheck(); }}
              style={{ fontSize: 12 }} />
            <button onClick={addCheck} style={{ background: 'transparent', border: '1px solid #2a2a38', borderRadius: 6, color: '#9090a8', cursor: 'pointer', padding: '0 10px' }}>+</button>
          </div>
        </div>

        {/* Comments */}
        <div>
          {label(`Comments (${(task.comments || []).length})`)}
          {(task.comments || []).map(c => {
            const u = users.find(x => x._id === c.userId || x.id === c.userId);
            return (
              <div key={c._id || c.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <Avatar user={u || { name: '?', color: '#7c6fff' }} size={28} />
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f5' }}>{u?.name || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: '#5a5a70', fontFamily: 'monospace' }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#9090a8' }}>{c.text}</div>
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Avatar user={currentUser} size={28} />
            <div style={{ flex: 1 }}>
              <textarea className="input" rows={2} placeholder="Write a comment..." value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(); } }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button onClick={addComment} style={{ background: '#7c6fff', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}