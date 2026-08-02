import { SOURCES } from '../lib/sources.js'
import { CATEGORIES } from '../lib/categories.js'

export default function FilterBar({
  country,
  onCountryChange,
  category,
  onCategoryChange,
  activeSources,
  onToggleSource,
}) {
  const visibleSources = SOURCES.filter((s) => country === 'all' || s.country === country)

  return (
    <nav className="filter-nav">
      <div className="filter-section">
        <h4 className="filter-heading">분야</h4>
        <div className="filter-list">
          {[{ value: 'all', label: '전체' }, ...CATEGORIES].map((opt) => (
            <button
              key={opt.value}
              className={`nav-item ${category === opt.value ? 'active' : ''}`}
              onClick={() => onCategoryChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-heading">지역</h4>
        <div className="filter-list filter-list-row">
          {[
            { value: 'all', label: '전체' },
            { value: 'domestic', label: '국내' },
            { value: 'international', label: '해외' },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`chip ${country === opt.value ? 'active' : ''}`}
              onClick={() => onCountryChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-heading">언론사</h4>
        <div className="filter-list filter-list-row">
          {visibleSources.map((s) => (
            <button
              key={s.source}
              className={`chip chip-source ${activeSources.has(s.source) ? 'active' : ''}`}
              onClick={() => onToggleSource(s.source)}
            >
              {s.source}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
