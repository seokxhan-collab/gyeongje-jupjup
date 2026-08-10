import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import NewsFeed from '../components/NewsFeed.jsx'
import FilterBar from '../components/FilterBar.jsx'
import AdSlot from '../components/AdSlot.jsx'
import OriginalContentTeaser from '../components/OriginalContentTeaser.jsx'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'

export default function HomePage({ search }) {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'all'
  const [activeSources, setActiveSources] = useState(new Set())

  useDocumentMeta({
    title: '국내 경제뉴스 모음',
    description: '국내 경제뉴스를 한 곳에 모아 보여주는 뉴스 모음 사이트. 매일 아침 AI가 재구성한 경제 브리핑도 함께 제공합니다.',
  })

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
            <FilterBar activeSources={activeSources} onToggleSource={toggleSource} />
            <NewsFeed category={category} activeSources={activeSources} search={search} />
          </main>

          <aside className="site-sidebar">
            <OriginalContentTeaser />
            <AdSlot placement="sidebar" />
          </aside>
        </div>
      </div>
    </>
  )
}
