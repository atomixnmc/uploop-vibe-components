// ─── Dashboard Demo — Cards, stats, tables, layout ───────────

import { component, html } from '@uploop/html'
import { Card, CardHeader, CardBody, Badge, Avatar, Table, Progress, Button, Grid, Stack, Flex } from '@uploop-vibe/vibe'

export const DashboardDemo = component('DashboardDemo', {
  state: {
    stats: [
      { label: 'Total Users', value: '12,843', change: '+12%', trend: 'up' },
      { label: 'Revenue', value: '$34,290', change: '+8.2%', trend: 'up' },
      { label: 'Active Now', value: '573', change: '-3%', trend: 'down' },
      { label: 'Conversion', value: '3.24%', change: '+1.1%', trend: 'up' },
    ],
    recentUsers: [
      { name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'active' },
      { name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'active' },
      { name: 'Carol Davis', email: 'carol@example.com', role: 'Viewer', status: 'inactive' },
      { name: 'Dan Wilson', email: 'dan@example.com', role: 'Editor', status: 'active' },
    ],
    tasks: [
      { name: 'Design system update', progress: 75 },
      { name: 'API integration', progress: 45 },
      { name: 'User testing', progress: 20 },
    ],
  },

  view: (state) => html`
    <div style="padding:1.5rem;">
      <h2 style="margin:0 0 1.25rem;font-size:1.3rem;font-weight:700;">Dashboard</h2>

      <!-- Stat cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem;">
        ${state.stats.map(s => html`
          <div style="padding:1.25rem;background:var(--vibe-color-bg);border:1px solid var(--vibe-color-border);border-radius:var(--vibe-radius-lg);">
            <div style="font-size:0.75rem;color:var(--vibe-color-mutedFg);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.25rem;">${s.label}</div>
            <div style="display:flex;align-items:baseline;gap:0.5rem;">
              <span style="font-size:1.5rem;font-weight:700;">${s.value}</span>
              <span style="font-size:0.8rem;color:${s.trend === 'up' ? 'var(--vibe-color-success)' : 'var(--vibe-color-error)'};">${s.change}</span>
            </div>
          </div>
        `)}
      </div>

      <!-- Recent users table -->
      <div style="margin-bottom:1.5rem;">
        <h3 style="margin:0 0 0.75rem;font-size:1rem;font-weight:600;">Recent Users</h3>
        ${Table.view({
          ...state,
          columns: [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status' },
          ],
          rows: state.recentUsers.map(u => ({
            ...u,
            status: `<span style="display:inline-flex;align-items:center;gap:0.375rem;">
              <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:${u.status === 'active' ? '#40c057' : '#868e96'};"></span>
              ${u.status}
            </span>`
          })),
          striped: true, hoverable: true, compact: true,
        }, {})}
      </div>

      <!-- Task progress -->
      <div>
        <h3 style="margin:0 0 0.75rem;font-size:1rem;font-weight:600;">Project Tasks</h3>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${state.tasks.map(t => html`
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
                <span style="font-size:0.85rem;font-weight:500;">${t.name}</span>
                <span style="font-size:0.75rem;color:var(--vibe-color-mutedFg);">${t.progress}%</span>
              </div>
              <div style="height:0.5rem;background:var(--vibe-color-neutral100);border-radius:var(--vibe-radius-full);overflow:hidden;">
                <div style="height:100%;width:${t.progress}%;background:var(--vibe-color-primary600);border-radius:var(--vibe-radius-full);transition:width 0.3s;"></div>
              </div>
            </div>
          `)}
        </div>
      </div>
    </div>
  `
})
