import { useEffect, useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { CATEGORIES, categoryLabel } from '../lib/categories.js'

export default function GlossaryPage() {
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  useDocumentMeta({
    title: '경제 용어사전',
    description: 'AI가 매일 최근 경제뉴스 속 용어를 하나씩 골라 쉽게 풀어 설명하는 경제 용어사전입니다.',
  })

  useEffect(() => {
    let cancelled = false
    supabase
      .from('glossary_terms')
      .select('term, definition, example, category, created_at')
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
    return terms.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (!q) return true
      return t.term.includes(q) || t.definition.includes(q)
    })
  }, [terms, query, category])

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

      <div className="filter-list glossary-category-list">
        {[{ value: 'all', label: '전체' }, ...CATEGORIES].map((c) => (
          <button
            key={c.value}
            className={`chip ${category === c.value ? 'active' : ''}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && <p className="page-empty">불러오는 중입니다...</p>}
      {!loading && filtered.length === 0 && (
        <p className="page-empty">{query || category !== 'all' ? '검색 결과가 없습니다.' : '아직 등록된 용어가 없습니다.'}</p>
      )}

      <ul className="glossary-list">
        {filtered.map((t) => (
          <li key={t.term} className="glossary-item">
            <div className="glossary-item-head">
              <h3 className="glossary-term">{t.term}</h3>
              <span className="glossary-category-tag">{categoryLabel(t.category)}</span>
            </div>
            <p className="glossary-definition">{t.definition}</p>
            {t.example && <p className="glossary-example">{t.example}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
