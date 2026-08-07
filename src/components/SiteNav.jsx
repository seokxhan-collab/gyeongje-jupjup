import { NavLink, Link, useSearchParams } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { CATEGORIES } from '../lib/categories.js'

const CATEGORY_OPTIONS = [{ value: 'all', label: '전체' }, ...CATEGORIES]

const LINKS = [
  { to: '/', label: '홈', children: CATEGORY_OPTIONS },
  { to: '/quiz', label: '오늘의 퀴즈' },
  { to: '/weekly', label: '주간 시황' },
  { to: '/glossary', label: '용어사전' },
  { to: '/calendar', label: '경제 캘린더' },
  { to: '/community', label: '커뮤니티' },
]

export default function SiteNav() {
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') ?? 'all'

  return (
    <nav className="site-menubar" aria-label="메뉴">
      <div className="site-container">
        <div className="site-nav-list">
          {LINKS.map((link) => (
            <div key={link.to} className="site-nav-item">
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `category-tab ${isActive ? 'active' : ''}`}
              >
                {link.label}
                {link.children && <ChevronDown size={14} className="category-tab-chevron" />}
              </NavLink>
              {link.children && (
                <div className="site-nav-dropdown">
                  {link.children.map((opt) => (
                    <Link
                      key={opt.value}
                      to={opt.value === 'all' ? '/' : `/?category=${opt.value}`}
                      className={`site-nav-dropdown-item ${activeCategory === opt.value ? 'active' : ''}`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
