import { useState } from 'react'
import DailyBriefing from '../components/DailyBriefing.jsx'
import NewsFeed from '../components/NewsFeed.jsx'
import FilterBar from '../components/FilterBar.jsx'
import CategoryNav from '../components/CategoryNav.jsx'
import AdSlot from '../components/AdSlot.jsx'

export default function HomePage({ search }) {
  const [country, setCountry] = useState('all')
  const [category, setCategory] = useState('all')
  const [activeSources, setActiveSources] = useState(new Set())

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
    <>
      <nav className="site-subnav">
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
    </>
  )
}
