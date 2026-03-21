export const COLORS = {
  accent: '#7c6fff', green: '#4ade80', yellow: '#fbbf24',
  red: '#f87171', blue: '#60a5fa', pink: '#f472b6',
  orange: '#fb923c', teal: '#2dd4bf',
};

export const AVATAR_COLORS = ['#7c6fff','#4ade80','#fbbf24','#f87171','#60a5fa','#f472b6','#fb923c','#2dd4bf'];

export const DEMO_USERS = [
  { id: 'u1', name: 'Lareey Wah', email: 'alex@taskflow.io', role: 'admin', color: AVATAR_COLORS[0] },
  { id: 'u2', name: 'Lawal Tolu', email: 'sam@taskflow.io', role: 'user', color: AVATAR_COLORS[1] },
  { id: 'u3', name: 'Naskid Sam', email: 'jordan@taskflow.io', role: 'user', color: AVATAR_COLORS[2] },
  { id: 'u4', name: 'Ade Soul', email: 'morgan@taskflow.io', role: 'guest', color: AVATAR_COLORS[3] },
];

export const initialBoards = [
  {
    id: 'b1', title: 'Product Roadmap', description: 'Q1 2025 feature development',
    color: COLORS.accent, members: ['u1','u2','u3'], createdAt: new Date().toISOString(),
    lists: [
      { id: 'l1', title: 'Backlog', color: COLORS.blue, tasks: [
        { id: 't1', title: 'User authentication flow', description: 'Implement JWT-based auth', priority: 'high', assignees: ['u1','u2'], tags: ['backend'], dueDate: '2025-02-10', checklist: [{id:'c1',text:'Design schema',done:true},{id:'c2',text:'Write tests',done:false}], comments: [{id:'cm1',userId:'u2',text:'Should we use OAuth?',createdAt:new Date(Date.now()-3600000).toISOString()}], attachments: [], createdAt: new Date().toISOString() },
        { id: 't2', title: 'Dark mode toggle', description: 'System-aware dark mode', priority: 'medium', assignees: ['u3'], tags: ['frontend'], dueDate: '2025-02-15', checklist: [], comments: [], attachments: [], createdAt: new Date().toISOString() },
      ]},
      { id: 'l2', title: 'In Progress', color: COLORS.yellow, tasks: [
        { id: 't3', title: 'Real-time collaboration', description: 'WebSocket integration', priority: 'high', assignees: ['u1'], tags: ['backend','ws'], dueDate: '2025-02-08', checklist: [{id:'c3',text:'Server setup',done:true},{id:'c4',text:'Testing',done:false}], comments: [], attachments: [], createdAt: new Date().toISOString() },
      ]},
      { id: 'l3', title: 'Done', color: COLORS.green, tasks: [
        { id: 't4', title: 'Project setup', description: 'Initialize repo and CI/CD', priority: 'high', assignees: ['u1'], tags: ['devops'], dueDate: '2025-01-25', checklist: [{id:'c5',text:'Repo init',done:true}], comments: [], attachments: [], createdAt: new Date().toISOString() },
      ]},
    ],
  },
];

export const initialNotifications = [
  { id: 'n1', text: 'Lawal Chen commented on a task', time: '2m ago', read: false, type: 'comment' },
  { id: 'n2', text: 'You were assigned to "Analytics dashboard"', time: '1h ago', read: false, type: 'assign' },
    { id: 'n3', text: 'Task is due tomorrow', time: '3h ago', read: true, type: 'reminder' },
];