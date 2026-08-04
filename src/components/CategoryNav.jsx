import { CATEGORIES } from '../lib/categories.js'

const OPTIONS = [{ value: 'all', label: '전체' }, ...CATEGORIES]

export default function CategoryNav({ category, onCategoryChange }) {
  return (
    <nav className="site-nav" aria-label="분야">
      <div className="site-nav-list">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`category-tab ${category === opt.value ? 'active' : ''}`}
            onClick={() => onCategoryChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
