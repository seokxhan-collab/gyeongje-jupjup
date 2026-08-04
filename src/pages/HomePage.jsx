import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DailyBriefing from '../components/DailyBriefing.jsx'
import NewsFeed from '../components/NewsFeed.jsx'
import FilterBar from '../components/FilterBar.jsx'
import AdSlot from '../components/AdSlot.jsx'
import OriginalContentTeaser from '../components/OriginalContentTeaser.jsx'

export default function HomePage({ search }) {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'all'
  const [country, setCountry] = useState('all')
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
      <div className="site-container site-main-container">
        <AdSlot placement="top-banner" />

        <div className="site-body">
          <main className="site-main">
            <FilterBar
              country={country}
              onCountryChange={handleCountryChange}
              activeSources={activeSources}
              onToggleSource={toggleSource}
            />
            <NewsFeed country={country} category={category} activeSources={activeSources} search={search} />
          </main>

          <aside className="site-sidebar">
            <OriginalContentTeaser />
            <DailyBriefing />
            <AdSlot placement="sidebar" />
          </aside>
        </div>
      </div>
    </>
  )
}
