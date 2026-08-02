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
    <div className="filter-bar">
      <div className="filter-group filter-group-category">
        {[{ value: 'all', label: '전체' }, ...CATEGORIES].map((opt) => (
          <button
            key={opt.value}
            className={`chip chip-category ${category === opt.value ? 'active' : ''}`}
            onClick={() => onCategoryChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="filter-row">
        <div className="filter-group">
          {[
            { value: 'all', label: '전체' },
            { value: 'domestic', label: '국내' },
            { value: 'international', label: '해외' },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`chip chip-country ${country === opt.value ? 'active' : ''}`}
              onClick={() => onCountryChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="filter-group filter-group-sources">
          {visibleSources.map((s) => (
            <button
              key={s.source}
              className={`chip ${activeSources.has(s.source) ? 'active' : ''}`}
              onClick={() => onToggleSource(s.source)}
            >
              {s.source}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
