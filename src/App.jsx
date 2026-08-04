import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import DailyBriefing from './components/DailyBriefing.jsx'
import NewsFeed from './components/NewsFeed.jsx'
import FilterBar from './components/FilterBar.jsx'
import CategoryNav from './components/CategoryNav.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import SearchBar from './components/SearchBar.jsx'
import AdSlot from './components/AdSlot.jsx'
import Footer from './components/Footer.jsx'

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
    <div className="site">
      <header className="site-topbar">
        <div className="site-container site-topbar-inner">
          <div className="site-brand">
            <h1>경제줍줍</h1>
            <p>국내외 경제뉴스를 한 곳에 모아봅니다</p>
          </div>
          <div className="site-topbar-search">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <nav className="site-menubar">
        <div className="site-container">
          <CategoryNav category={category} onCategoryChange={setCategory} />
        </div>
      </nav>

      <div className="site-container site-main-container">
        <AdSlot placement="top-banner" />

        <div className="site-body">
          <main className="site-main">
            <NewsFeed country={country} category={category} activeSources={activeSources} search={search} />
          </main>

          <aside className="site-sidebar">
            <DailyBriefing />
            <AdSlot placement="sidebar" />
            <FilterBar
              country={country}
              onCountryChange={handleCountryChange}
              activeSources={activeSources}
              onToggleSource={toggleSource}
            />
          </aside>
        </div>
      </div>

      <Footer />
      <Analytics />
    </div>
  )
}
