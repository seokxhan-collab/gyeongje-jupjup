import { SOURCES } from '../lib/sources.js'

export default function FilterBar({ activeSources, onToggleSource }) {
  return (
    <nav className="filter-bar" aria-label="뉴스 필터">
      <div className="filter-group">
        <span className="filter-label">언론사</span>
        <div className="filter-list">
          {SOURCES.map((s) => (
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
