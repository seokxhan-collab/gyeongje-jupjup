import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import AdSlot from '../components/AdSlot.jsx'

export default function WeeklyReviewPage() {
  const { date } = useParams()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)

  useDocumentMeta({
    title: review ? review.title : '주간 시황 총평',
    description: 'AI가 지난 한 주의 경제 브리핑을 주제별로 다시 정리한 칼럼형 주간 시황 총평입니다.',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    let query = supabase.from('weekly_reviews').select('week_start, title, paragraphs, created_at')
    query = date
      ? query.eq('week_start', date).maybeSingle()
      : query.order('week_start', { ascending: false }).limit(1).maybeSingle()

    query.then(({ data }) => {
      if (!cancelled) {
        setReview(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [date])

  if (loading) {
    return (
      <div className="site-container site-page">
        <p className="page-empty">주간 총평을 불러오는 중입니다...</p>
      </div>
    )
  }

  if (!review || !review.paragraphs?.length) {
    return (
      <div className="site-container site-page">
        <h2 className="page-title">주간 시황 총평</h2>
        <p className="page-empty">
          {date
            ? '해당 주차의 총평을 찾을 수 없습니다.'
            : '아직 발행된 주간 총평이 없습니다. 매주 월요일 오전에 업데이트됩니다.'}
        </p>
        <Link to="/weekly/archive" className="page-archive-link">
          지난 시황 모아보기
        </Link>
      </div>
    )
  }

  const paragraphs = review.paragraphs
  const mid = Math.ceil(paragraphs.length / 2)

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <Newspaper size={18} />
          <h2 className="page-title">주간 시황 총평</h2>
        </div>
        <span className="page-date">{review.week_start} 주</span>
      </div>

      <Link to="/weekly/archive" className="page-archive-link">
        지난 시황 모아보기
      </Link>

      <article className="weekly-article">
        <h3 className="weekly-article-title">{review.title}</h3>
        {paragraphs.slice(0, mid).map((p, i) => (
          <p key={i} className="weekly-article-paragraph">
            {p}
          </p>
        ))}
        <AdSlot placement="weekly" />
        {paragraphs.slice(mid).map((p, i) => (
          <p key={mid + i} className="weekly-article-paragraph">
            {p}
          </p>
        ))}
      </article>

      <p className="page-disclaimer">AI가 지난 한 주의 브리핑을 재구성해 작성한 칼럼입니다. 투자 판단의 참고용으로만 활용하세요.</p>
    </div>
  )
}
