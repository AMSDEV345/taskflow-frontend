import { COLORS } from './constants/data';
import { Avatar, RoleBadge } from './UI';

export default function Analytics({ boards, users }) {
  const allTasks = boards.flatMap(b => b.lists.flatMap(l => l.tasks));
  const total = allTasks.length;
  const done = boards.flatMap(b => (b.lists.find(l => l.title.toLowerCase() === 'done') || { tasks: [] }).tasks).length;
  const high = allTasks.filter(t => t.priority === 'high').length;
  const overdue = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
  const byList = boards.flatMap(b => b.lists.map(l => ({ name: l.title, count: l.tasks.length, color: l.color })));
  const max = Math.max(...byList.map(l => l.count), 1);

  const card = (icon, label, value, color) => (
    <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 10, padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#5a5a70', fontFamily: 'monospace', marginBottom: 8 }}>{icon} {label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #2a2a38', background: '#111118' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f5' }}>Analytics</div>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {card('📋', 'Total Tasks', total, '#f0f0f5')}
          {card('✅', 'Completed', done, COLORS.green)}
          {card('🔥', 'High Priority', high, COLORS.yellow)}
          {card('⚠️', 'Overdue', overdue, overdue > 0 ? COLORS.red : '#f0f0f5')}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>Tasks by List</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {byList.map(l => (
                <div key={l.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: l.color || COLORS.accent, height: `${(l.count / max) * 100}%`, minHeight: l.count > 0 ? 4 : 0 }} />
                  <div style={{ fontSize: 9, color: '#5a5a70', fontFamily: 'monospace' }}>{l.name.slice(0, 6)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>Priority Split</div>
            {[['high', COLORS.red], ['medium', COLORS.yellow], ['low', COLORS.green]].map(([p, c]) => {
              const count = allTasks.filter(t => t.priority === p).length;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={p} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize', color: c }}>{p}</span>
                    <span style={{ fontFamily: 'monospace', color: '#5a5a70' }}>{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#1e1e28', borderRadius: 3 }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: c }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>Team Workload</div>
          {users.map(u => {
            const assigned = allTasks.filter(t => t.assignees.includes(u.id)).length;
            const comments = allTasks.reduce((s, t) => s + t.comments.filter(c => c.userId === u.id).length, 0);
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar user={u} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: '#f0f0f5' }}>{u.name}</span>
                    <span style={{ fontFamily: 'monospace', color: '#5a5a70', fontSize: 11 }}>{assigned} tasks · {comments} comments</span>
                  </div>
                  <div style={{ height: 6, background: '#1e1e28', borderRadius: 3 }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${(assigned / total || 0) * 100}%`, background: u.color }} />
                  </div>
                </div>
                <RoleBadge role={u.role} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}