import { COLORS } from './constants/data';
import { RoleBadge } from './UI';

export default function Analytics({ boards, users }) {
  const allTasks = boards.flatMap(b => b.lists.flatMap(l => l.tasks));
  const total = allTasks.length;
  const done = boards.flatMap(b => (b.lists.find(l => l.title.toLowerCase() === 'done') || { tasks: [] }).tasks).length;
  const high = allTasks.filter(t => t.priority === 'high').length;
  const overdue = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
  const byList = boards.flatMap(b => b.lists.map(l => ({ name: l.title, count: l.tasks.length, color: l.color })));
  const max = Math.max(...byList.map(l => l.count), 1);

  const statCard = (label, value, color, sub) => (
    <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#5a5a70', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#5a5a70' }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#0a0a0f' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #2a2a38', background: '#111118' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f5' }}>Analytics</div>
      </div>

      <div style={{ padding: 20 }}>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {statCard('Total Tasks', total, '#f0f0f5', `Across ${boards.length} boards`)}
          {statCard('Completed', done, COLORS.green, `${total > 0 ? Math.round((done/total)*100) : 0}% complete`)}
          {statCard('High Priority', high, COLORS.yellow, `${total > 0 ? Math.round((high/total)*100) : 0}% of tasks`)}
          {statCard('Overdue', overdue, overdue > 0 ? COLORS.red : '#f0f0f5', overdue > 0 ? 'Need attention' : 'All on track')}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>

          {/* Tasks by List */}
          <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>Tasks by List</div>
            {byList.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#5a5a70', padding: '20px 0', fontSize: 13 }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                {byList.map(l => (
                  <div key={l.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: 11, color: '#5a5a70', fontWeight: 600 }}>{l.count}</div>
                    <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: l.color || COLORS.accent, height: `${(l.count / max) * 80}%`, minHeight: l.count > 0 ? 8 : 0, transition: 'height 0.5s' }} />
                    <div style={{ fontSize: 10, color: '#5a5a70', textAlign: 'center', lineHeight: 1.2 }}>{l.name.slice(0, 8)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority Split */}
          <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>Priority Split</div>
            {[['high', COLORS.red, 'High'], ['medium', COLORS.yellow, 'Medium'], ['low', COLORS.green, 'Low']].map(([p, c, label]) => {
              const count = allTasks.filter(t => t.priority === p).length;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={p} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: c, fontWeight: 600 }}>{label}</span>
                    <span style={{ color: '#5a5a70' }}>{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#1e1e28', borderRadius: 3 }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: c, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Workload */}
        <div style={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f5', marginBottom: 16 }}>Team Workload</div>
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#5a5a70', padding: '20px 0', fontSize: 13 }}>No team members yet</div>
          ) : (
            users.map(u => {
              const assigned = allTasks.filter(t => t.assignees?.includes(u._id || u.id)).length;
        
              return (
                <div key={u._id || u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: (u.color || '#7c6fff') + '33', border: `2px solid ${u.color || '#7c6fff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: u.color || '#7c6fff', flexShrink: 0 }}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: '#f0f0f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                      <span style={{ color: '#5a5a70', fontSize: 12, flexShrink: 0, marginLeft: 8 }}>{assigned} tasks</span>
                    </div>
                    <div style={{ height: 6, background: '#1e1e28', borderRadius: 3 }}>
                      <div style={{ height: '100%', borderRadius: 3, width: `${total > 0 ? (assigned / total) * 100 : 0}%`, background: u.color || '#7c6fff', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}