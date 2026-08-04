import { useEffect, useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

export default function GlossaryPage() {
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    supabase
      .from('glossary_terms')
      .select('term, definition, example, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setTerms(data ?? [])
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return terms
    return terms.filter((t) => t.term.includes(q) || t.definition.includes(q))
  }, [terms, query])

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <BookOpen size={18} />
          <h2 className="page-title">경제 용어사전</h2>
        </div>
        <span className="page-date">AI가 매일 최근 뉴스 속 용어를 하나씩 골라 쉽게 풀어드립니다</span>
      </div>

      <input
        type="text"
        className="glossary-search"
        placeholder="용어 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <p className="page-empty">불러오는 중입니다...</p>}
      {!loading && filtered.length === 0 && (
        <p className="page-empty">{query ? '검색 결과가 없습니다.' : '아직 등록된 용어가 없습니다.'}</p>
      )}

      <ul className="glossary-list">
        {filtered.map((t) => (
          <li key={t.term} className="glossary-item">
            <h3 className="glossary-term">{t.term}</h3>
            <p className="glossary-definition">{t.definition}</p>
            {t.example && <p className="glossary-example">{t.example}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
