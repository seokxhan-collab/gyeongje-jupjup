import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import DailyBriefing from './components/DailyBriefing.jsx'
import NewsFeed from './components/NewsFeed.jsx'
import FilterBar from './components/FilterBar.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import SearchBar from './components/SearchBar.jsx'

export default function App() {
  const [country, setCountry] = useState('all')
  const [category, setCategory] = useState('all')
  const [activeSources, setActiveSources] = useState(new Set())
  const [search, setSearch] = useState('')

  function handleCountryChange(next) {
    setCountry(next)
    setActiveSources(new Set())
  }

  function toggleSource(source) {
    setActiveSources((prev) => {
      const next = new Set(prev)
      if (next.has(source)) next.delete(source)
      else next.add(source)
      return next
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>경제줍줍</h1>
          <p>국내외 경제뉴스를 한 곳에 모아봅니다</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="app-shell">
        <aside className="sidebar-briefing">
          <DailyBriefing />
        </aside>

        <aside className="sidebar-filters">
          <FilterBar
            country={country}
            onCountryChange={handleCountryChange}
            category={category}
            onCategoryChange={setCategory}
            activeSources={activeSources}
            onToggleSource={toggleSource}
          />
        </aside>

        <main className="main-content">
          <SearchBar value={search} onChange={setSearch} />
          <NewsFeed country={country} category={category} activeSources={activeSources} search={search} />
        </main>
      </div>
      <Analytics />
    </div>
  )
}
