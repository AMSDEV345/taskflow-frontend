import { useState } from 'react';
import { COLORS } from './constants/data';
import TaskCard from './TaskCard';

export default function ListColumn({ list, boardId, users, onTaskClick, onAddTask, onDragStart, onDragOver, onDrop, onListDrop, onDeleteList, onRenameList }) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isOver, setIsOver] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState(list.title);

  const handleAdd = () => {
    if (newTitle.trim()) { onAddTask(boardId, list.id, newTitle.trim()); setNewTitle(''); setAdding(false); }
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={e => { setIsOver(false); onListDrop(e, list.id); }}
      style={{ width: 280, flexShrink: 0, background: isOver ? '#1e1e28' : '#111118', border: `1px solid ${isOver ? '#7c6fff' : '#2a2a38'}`, borderRadius: 10, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 160px)', transition: 'all 0.2s' }}
    >
      <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #2a2a38' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: list.color || COLORS.accent }} />
        {editTitle
          ? <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onBlur={() => { onRenameList(boardId, list.id, title); setEditTitle(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { onRenameList(boardId, list.id, title); setEditTitle(false); } }}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, fontWeight: 700, color: '#f0f0f5', fontFamily: 'inherit' }} />
          : <div onDoubleClick={() => setEditTitle(true)} style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#f0f0f5' }}>{list.title}</div>
        }
        <span style={{ fontSize: 11, color: '#5a5a70', background: '#1e1e28', padding: '2px 7px', borderRadius: 10, fontFamily: 'monospace' }}>{list.tasks.length}</span>
        <button onClick={() => onDeleteList(boardId, list.id)} style={{ background: 'none', border: 'none', color: '#5a5a70', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {list.tasks.map(task => (
          <TaskCard key={task.id} task={task} listId={list.id} users={users}
            onClick={onTaskClick} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
        ))}
        {list.tasks.length === 0 && !adding && (
          <div style={{ textAlign: 'center', padding: '20px 10px', color: '#5a5a70', fontSize: 12 }}>📭 Drop tasks here</div>
        )}
      </div>

      <div style={{ padding: 10 }}>
        {adding ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input autoFocus className="input" placeholder="Task title..." value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleAdd} style={{ background: '#7c6fff', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Add</button>
              <button onClick={() => setAdding(false)} style={{ background: 'transparent', color: '#9090a8', border: '1px solid #2a2a38', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{ width: '100%', background: 'transparent', border: '1px solid #2a2a38', borderRadius: 6, padding: '7px', color: '#5a5a70', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>+ Add task</button>
        )}
      </div>
    </div>
  );
}