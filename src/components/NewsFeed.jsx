import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import NewsCard from './NewsCard.jsx'
import FilterBar from './FilterBar.jsx'

const PAGE_SIZE = 60

export default function NewsFeed() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [country, setCountry] = useState('all')
  const [category, setCategory] = useState('all')
  const [activeSources, setActiveSources] = useState(new Set())

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    let query = supabase
      .from('news')
      .select('id, source, source_country, category, title, summary, link, published_at')
      .order('published_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (country !== 'all') query = query.eq('source_country', country)
    if (category !== 'all') query = query.eq('category', category)
    if (activeSources.size > 0) query = query.in('source', Array.from(activeSources))

    query.then(({ data, error }) => {
      if (cancelled) return
      if (error) setError(error.message)
      else setNews(data ?? [])
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [country, category, activeSources])

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
    <section>
      <FilterBar
        country={country}
        onCountryChange={handleCountryChange}
        category={category}
        onCategoryChange={setCategory}
        activeSources={activeSources}
        onToggleSource={toggleSource}
      />

      {loading && <p className="status-text">불러오는 중…</p>}
      {error && <p className="status-text status-error">뉴스를 불러오지 못했습니다: {error}</p>}
      {!loading && !error && news.length === 0 && (
        <p className="status-text">해당 조건의 뉴스가 아직 없습니다.</p>
      )}

      <div className="news-grid">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
