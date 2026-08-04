import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'

export default function QuizArchivePage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useDocumentMeta({
    title: '지난 퀴즈 모아보기',
    description: '경제줍줍이 매일 만들어온 경제 퀴즈를 날짜별로 다시 풀어볼 수 있습니다.',
  })

  useEffect(() => {
    let cancelled = false
    supabase
      .from('quizzes')
      .select('quiz_date, questions')
      .order('quiz_date', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setQuizzes(data ?? [])
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <Sparkles size={18} />
          <h2 className="page-title">지난 퀴즈 모아보기</h2>
        </div>
      </div>

      {loading && <p className="page-empty">불러오는 중입니다...</p>}
      {!loading && quizzes.length === 0 && <p className="page-empty">아직 쌓인 퀴즈가 없습니다.</p>}

      <ul className="archive-list">
        {quizzes.map((q) => (
          <li key={q.quiz_date}>
            <Link to={`/quiz/${q.quiz_date}`} className="archive-list-item">
              <span className="archive-list-date">{q.quiz_date}</span>
              <span className="archive-list-meta">{q.questions?.length ?? 0}문항</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
