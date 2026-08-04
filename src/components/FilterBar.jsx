import { SOURCES } from '../lib/sources.js'

export default function FilterBar({
  country,
  onCountryChange,
  activeSources,
  onToggleSource,
}) {
  const visibleSources = SOURCES.filter((s) => country === 'all' || s.country === country)

  return (
    <nav className="filter-bar" aria-label="뉴스 필터">
      <div className="filter-group">
        <span className="filter-label">지역</span>
        <div className="filter-list">
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

      <div className="filter-divider" aria-hidden="true" />

      <div className="filter-group">
        <span className="filter-label">언론사</span>
        <div className="filter-list">
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
