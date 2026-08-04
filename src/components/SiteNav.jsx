import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: '홈' },
  { to: '/quiz', label: '오늘의 퀴즈' },
  { to: '/weekly', label: '주간 시황' },
]

export default function SiteNav() {
  return (
    <nav className="site-menubar" aria-label="메뉴">
      <div className="site-container">
        <div className="site-nav-list">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `category-tab ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
