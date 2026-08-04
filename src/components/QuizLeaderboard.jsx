import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'

const LIMIT = 15

export default function QuizLeaderboard({ quizDate, highlightClientId }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    function load() {
      supabase
        .from('quiz_scores')
        .select('client_id, nickname, score, total, created_at')
        .eq('quiz_date', quizDate)
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(LIMIT)
        .then(({ data }) => {
          if (!cancelled) {
            setRows(data ?? [])
            setLoading(false)
          }
        })
    }

    load()

    // 새 점수가 들어올 때마다 순위표를 실시간으로 다시 반영한다.
    const channel = supabase
      .channel(`quiz-scores-${quizDate}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quiz_scores', filter: `quiz_date=eq.${quizDate}` },
        load,
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [quizDate])

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <Trophy size={16} />
        <h4>오늘의 정답률 순위</h4>
      </div>

      {loading && <p className="leaderboard-empty">불러오는 중...</p>}
      {!loading && rows.length === 0 && <p className="leaderboard-empty">아직 응시자가 없습니다. 첫 번째로 도전해보세요!</p>}

      <ol className="leaderboard-list">
        {rows.map((r, i) => (
          <li
            key={r.client_id}
            className={`leaderboard-row ${r.client_id === highlightClientId ? 'me' : ''}`}
          >
            <span className="leaderboard-rank">{i + 1}</span>
            <span className="leaderboard-name">{r.nickname || '익명'}</span>
            <span className="leaderboard-score">
              {r.score}/{r.total} ({Math.round((r.score / r.total) * 100)}%)
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
