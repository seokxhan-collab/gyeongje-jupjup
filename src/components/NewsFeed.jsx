import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import NewsCard from './NewsCard.jsx'

const PAGE_SIZE = 60

function escapeIlikeTerm(term) {
  return term.trim().replace(/[%_,()]/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function NewsFeed({ category, activeSources, search }) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    let query = supabase
      .from('news')
      .select('id, source, source_country, category, title, summary, link, published_at')
      .order('published_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (category !== 'all') query = query.eq('category', category)
    if (activeSources.size > 0) query = query.in('source', Array.from(activeSources))

    const term = escapeIlikeTerm(search ?? '')
    if (term) query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%`)

    query.then(({ data, error }) => {
      if (cancelled) return
      if (error) setError(error.message)
      else setNews(data ?? [])
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [category, activeSources, search])

  return (
    <section>
      {loading && <p className="status-text">불러오는 중…</p>}
      {error && <p className="status-text status-error">뉴스를 불러오지 못했습니다: {error}</p>}
      {!loading && !error && news.length === 0 && (
        <p className="status-text">
          {search?.trim() ? '검색 결과가 없습니다.' : '해당 조건의 뉴스가 아직 없습니다.'}
        </p>
      )}

      <div className="news-grid">
        {news.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
