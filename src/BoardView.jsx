import { useState, useRef } from 'react';
import { Avatar } from './UI';
import ListColumn from './ListColumn';
import TaskDetailPanel from './TaskDetailPanel';

export default function BoardView({ board, users, currentUser, boards, onAddList, onAddTask, onUpdateTask, onDeleteTask, onDeleteList, onRenameList, onMoveTask, showToast }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const drag = useRef({ taskId: null, fromListId: null });

  const onDragStart = (e, taskId, fromListId) => { drag.current = { taskId, fromListId }; };
  const onDragOver = e => e.preventDefault();
  const onDrop = (e, toTaskId, toListId) => {
    const { taskId, fromListId } = drag.current;
    if (!taskId || (fromListId === toListId && taskId === toTaskId)) return;
    onMoveTask(taskId, board._id, fromListId, toListId, toTaskId);
    showToast('Task moved', 'success');
    drag.current = { taskId: null, fromListId: null };
  };
  const onListDrop = (e, toListId) => {
    const { taskId, fromListId } = drag.current;
    if (!taskId || fromListId === toListId) return;
    onMoveTask(taskId, board._id, fromListId, toListId);
    showToast('Task moved', 'success');
    drag.current = { taskId: null, fromListId: null };
  };

  const handleUpdate = (bId, lId, tId, updates) => {
    onUpdateTask(bId, lId, tId, updates);
    if (selectedTask?._id === tId || selectedTask?.id === tId) {
      setSelectedTask(p => ({ ...p, ...updates }));
    }
  };

  const total = board.lists.reduce((s, l) => s + l.tasks.length, 0);
  const done = (board.lists.find(l => l.title.toLowerCase() === 'done') || { tasks: [] }).tasks.length;
  const overdue = board.lists.flatMap(l => l.tasks).filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>

      {/* Board Header */}
      <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 12, background: '#0a0a0f' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: board.color }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f5' }}>{board.title}</div>
          {board.description && <div style={{ fontSize: 12, color: '#5a5a70' }}>{board.description}</div>}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {overdue > 0 && (
            <span style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(248,113,113,0.3)' }}>
              ⚠️ {overdue} overdue
            </span>
          )}
          <span style={{ fontSize: 12, color: '#5a5a70', fontFamily: 'monospace' }}>{done}/{total} done</span>
          <div style={{ display: 'flex' }}>
            {board.members?.map((id, i) => {
              const u = users.find(u => u._id === id || u.id === id);
              return u ? <Avatar key={id} user={u} size={28} style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid #0a0a0f' }} /> : null;
            })}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div style={{ padding: '8px 24px 0', background: '#0a0a0f' }}>
          <div style={{ height: 4, background: '#1e1e28', borderRadius: 2 }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${(done / total) * 100}%`, background: 'linear-gradient(90deg, #7c6fff, #4ade80)', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Lists */}
        <div style={{ flex: 1, overflowX: 'auto', padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start', background: '#0a0a0f' }}>
          {board.lists.map(list => (
            <ListColumn key={list._id || list.id} list={list} boardId={board._id} users={users}
              onTaskClick={(t, lId) => { setSelectedTask(t); setSelectedListId(lId); }}
              onAddTask={onAddTask} onDragStart={onDragStart} onDragOver={onDragOver}
              onDrop={onDrop} onListDrop={onListDrop} onDeleteList={onDeleteList} onRenameList={onRenameList} />
          ))}

          {/* Add List Button */}
          <div onClick={() => { const n = prompt('List name:'); if (n?.trim()) { onAddList(board._id, n.trim()); showToast('List added', 'success'); } }}
            style={{ width: 280, flexShrink: 0, border: '2px dashed #2a2a38', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, cursor: 'pointer', color: '#5a5a70', fontSize: 13, fontWeight: 600, minHeight: 80, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6fff'; e.currentTarget.style.color = '#7c6fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a38'; e.currentTarget.style.color = '#5a5a70'; }}>
            <span style={{ fontSize: 20 }}>+</span> Add List
          </div>
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            boardId={board._id}
            listId={selectedListId}
            users={users}
            currentUser={currentUser}
            boards={boards}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdate}
            onDelete={(bId, lId, tId) => {
              onDeleteTask(bId, lId, tId);
              setSelectedTask(null);
              showToast('Task deleted', 'success');
            }}
            onMoveTask={onMoveTask}
          />
        )}
      </div>
    </div>
  );
}