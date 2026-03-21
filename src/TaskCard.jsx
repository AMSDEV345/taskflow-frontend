import { useState } from 'react';
import { COLORS } from './constants/data';
import { formatDate } from './utils/helpers';

export default function TaskCard({ task, listId, users, onClick, onDragStart, onDragOver, onDrop }) {
  const [dragging, setDragging] = useState(false);
  const assigned = task.assignees.map(id => users.find(u => u.id === id)).filter(Boolean);
  const done = task.checklist.filter(c => c.done).length;
  const total = task.checklist.length;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const priorityColors = { high: COLORS.red, medium: COLORS.yellow, low: COLORS.green };

  return (
    <div
      draggable
      onDragStart={e => { setDragging(true); onDragStart(e, task.id, listId); }}
      onDragEnd={() => setDragging(false)}
      onDragOver={e => { e.preventDefault(); onDragOver(e, task.id, listId); }}
      onDrop={e => { e.stopPropagation(); onDrop(e, task.id, listId); }}
      onClick={() => onClick(task, listId)}
      style={{ background: '#18181f', border: '1px solid #2a2a38', borderRadius: 6, padding: '12px 12px 12px 16px', cursor: 'grab', position: 'relative', opacity: dragging ? 0.5 : 1, marginBottom: 2 }}
    >
      <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: '0 2px 2px 0', background: priorityColors[task.priority] }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f5', marginBottom: 4 }}>{task.title}</div>
      {task.description && <div style={{ fontSize: 12, color: '#5a5a70', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</div>}
      {task.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
          {task.tags.map(t => <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: '#7c6fff20', color: '#7c6fff', fontFamily: 'monospace' }}>{t}</span>)}
        </div>
      )}
      {total > 0 && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: '#5a5a70', fontFamily: 'monospace', marginBottom: 3 }}>☑ {done}/{total}</div>
          <div style={{ height: 3, background: '#1e1e28', borderRadius: 2 }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${(done/total)*100}%`, background: done === total ? COLORS.green : COLORS.accent }} />
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
        {task.dueDate && <span style={{ fontSize: 11, color: isOverdue ? COLORS.red : '#5a5a70', fontFamily: 'monospace' }}>📅 {formatDate(task.dueDate)}</span>}
        {task.comments.length > 0 && <span style={{ fontSize: 11, color: '#5a5a70', fontFamily: 'monospace', marginLeft: 6 }}>💬 {task.comments.length}</span>}
        <div style={{ display: 'flex', marginLeft: 'auto' }}>
          {assigned.slice(0,3).map((u,i) => (
            <div key={u.id} style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, background: u.color+'33', color: u.color, marginLeft: i > 0 ? -5 : 0, border: '2px solid #18181f' }}>{u.name[0]}</div>
          ))}
        </div>
      </div>
    </div>
  );
}