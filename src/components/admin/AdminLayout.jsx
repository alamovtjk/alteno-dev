import { useState } from 'react'
import { logout } from '../../lib/adminAuth'
import TeamTab         from './tabs/TeamTab'
import PortfolioTab    from './tabs/PortfolioTab'
import TestimonialsTab from './tabs/TestimonialsTab'
import MusicTab        from './tabs/MusicTab'

const NAV = [
  {
    id: 'team', label: 'Команда',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  },
  {
    id: 'portfolio', label: 'Портфолио',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
  },
  {
    id: 'testimonials', label: 'Отзывы',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  },
  {
    id: 'music', label: 'Музыка',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
  },
]

export default function AdminLayout({ onLogout }) {
  const [tab, setTab] = useState('team')

  const handleLogout = () => { logout(); onLogout() }

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sb-brand">
          <span className="adm-sb-logo">AlTeNo</span>
          <span className="adm-sb-tag">Admin</span>
        </div>

        <nav className="adm-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`adm-nav-item${tab === n.id ? ' active' : ''}`}
              onClick={() => setTab(n.id)}
            >
              <span className="adm-nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="adm-sb-footer">
          <a href="/" target="_blank" rel="noreferrer" className="adm-nav-item adm-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Перейти на сайт
          </a>
          <button className="adm-nav-item adm-nav-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Выйти
          </button>
        </div>
      </aside>

      <main className="adm-main">
        {tab === 'team'         && <TeamTab />}
        {tab === 'portfolio'    && <PortfolioTab />}
        {tab === 'testimonials' && <TestimonialsTab />}
        {tab === 'music'        && <MusicTab />}
      </main>
    </div>
  )
}
