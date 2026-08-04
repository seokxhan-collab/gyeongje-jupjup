import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Sparkles, Trophy, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { getClientId, getSavedNickname, saveNickname } from '../lib/clientId.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import AdSlot from '../components/AdSlot.jsx'
import QuizLeaderboard from '../components/QuizLeaderboard.jsx'

async function fetchRank(quizDate, score) {
  const [{ count: higherCount }, { count: participantCount }] = await Promise.all([
    supabase
      .from('quiz_scores')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_date', quizDate)
      .gt('score', score),
    supabase.from('quiz_scores').select('*', { count: 'exact', head: true }).eq('quiz_date', quizDate),
  ])
  return { rank: (higherCount ?? 0) + 1, participantCount: participantCount ?? 0 }
}

export default function QuizPage() {
  const { date } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('loading') // loading | intro | playing | submitting | result
  const [nickname, setNickname] = useState(getSavedNickname)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useDocumentMeta({
    title: quiz ? `${quiz.quiz_date} 오늘의 경제 퀴즈` : '오늘의 경제 퀴즈',
    description: 'AI가 매일 아침 최근 경제뉴스를 참고해 만드는 5문항 퀴즈. 풀고 나면 점수와 순위를 바로 확인할 수 있어요.',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setPhase('loading')
    setCurrentIndex(0)
    setSelected(null)
    setAnswers([])
    setResult(null)

    let query = supabase.from('quizzes').select('quiz_date, questions, created_at')
    query = date
      ? query.eq('quiz_date', date).maybeSingle()
      : query.order('quiz_date', { ascending: false }).limit(1).maybeSingle()

    query.then(async ({ data }) => {
      if (cancelled) return
      setQuiz(data)
      setLoading(false)

      if (!data) return

      const clientId = getClientId()
      const { data: existing } = await supabase
        .from('quiz_scores')
        .select('score, total')
        .eq('quiz_date', data.quiz_date)
        .eq('client_id', clientId)
        .maybeSingle()

      if (cancelled) return

      if (existing) {
        const { rank, participantCount } = await fetchRank(data.quiz_date, existing.score)
        if (cancelled) return
        setResult({ score: existing.score, total: existing.total, rank, participantCount, alreadyPlayed: true })
        setPhase('result')
      } else {
        setPhase('intro')
      }
    })
    return () => {
      cancelled = true
    }
  }, [date])

  if (loading) {
    return (
      <div className="site-container site-page">
        <p className="page-empty">퀴즈를 불러오는 중입니다...</p>
      </div>
    )
  }

  if (!quiz || !quiz.questions?.length) {
    return (
      <div className="site-container site-page">
        <h2 className="page-title">오늘의 경제 퀴즈</h2>
        <p className="page-empty">
          {date ? '해당 날짜의 퀴즈를 찾을 수 없습니다.' : '아직 준비된 퀴즈가 없습니다. 잠시 후 다시 확인해주세요.'}
        </p>
        <Link to="/quiz/archive" className="page-archive-link">
          지난 퀴즈 모아보기
        </Link>
      </div>
    )
  }

  const questions = quiz.questions
  const total = questions.length
  const question = questions[currentIndex]
  const isLast = currentIndex === total - 1

  function startQuiz() {
    saveNickname(nickname.trim())
    setPhase('playing')
  }

  function chooseAnswer(choiceIndex) {
    if (selected !== null) return
    setSelected(choiceIndex)
  }

  async function nextQuestion() {
    const nextAnswers = [...answers, selected]
    setAnswers(nextAnswers)
    setSelected(null)

    if (!isLast) {
      setCurrentIndex((i) => i + 1)
      return
    }

    setPhase('submitting')
    setSubmitError(null)
    const { data, error } = await supabase.functions.invoke('submit-quiz-score', {
      body: {
        quiz_date: quiz.quiz_date,
        client_id: getClientId(),
        nickname: nickname.trim(),
        answers: nextAnswers,
      },
    })

    if (error || data?.error) {
      setSubmitError(error?.message ?? data?.error ?? '채점 중 오류가 발생했습니다.')
      setPhase('playing')
      setCurrentIndex(total - 1)
      setAnswers(answers)
      return
    }

    setResult(data)
    setPhase('result')
  }

  function shareResult() {
    if (!result) return
    const text = `[경제줍줍] 오늘의 경제 퀴즈 ${result.score}/${result.total}점 획득! 너도 풀어봐 → ${window.location.href}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="site-container site-main-container">
      <div className="page-header">
        <div className="page-header-title">
          <Sparkles size={18} />
          <h2 className="page-title">오늘의 경제 퀴즈</h2>
        </div>
        <span className="page-date">{quiz.quiz_date}</span>
      </div>

      <Link to="/quiz/archive" className="page-archive-link">
        지난 퀴즈 모아보기
      </Link>

      <div className="site-body">
        <main className="site-main">
          {phase === 'intro' && (
            <div className="quiz-intro">
              <Trophy size={32} className="quiz-intro-icon" />
              <p className="quiz-intro-lead">
                총 {total}문항입니다. 한 문제씩 풀고 나면 점수와 순위를 바로 확인할 수 있어요.
              </p>
              <input
                type="text"
                className="quiz-nickname-input"
                placeholder="순위표에 표시할 닉네임 (선택, 입력 안 하면 익명)"
                value={nickname}
                maxLength={20}
                onChange={(e) => setNickname(e.target.value)}
              />
              <button type="button" className="quiz-start-btn" onClick={startQuiz}>
                퀴즈 시작
              </button>
            </div>
          )}

          {(phase === 'playing' || phase === 'submitting') && (
            <div className="quiz-play">
              <div className="quiz-progress">
                <div className="quiz-progress-bar">
                  <div
                    className="quiz-progress-fill"
                    style={{ width: `${((currentIndex + (selected !== null ? 1 : 0)) / total) * 100}%` }}
                  />
                </div>
                <span className="quiz-progress-label">
                  {currentIndex + 1} / {total}
                </span>
              </div>

              <div className="quiz-question quiz-question-single">
                <p className="quiz-question-text">{question.question}</p>
                <div className="quiz-choices">
                  {question.choices.map((choice, ci) => {
                    const isCorrect = ci === question.correct_index
                    const isSelected = ci === selected
                    const revealed = selected !== null
                    let stateClass = ''
                    if (revealed && isCorrect) stateClass = 'correct'
                    else if (revealed && isSelected && !isCorrect) stateClass = 'wrong'
                    return (
                      <button
                        key={ci}
                        type="button"
                        className={`quiz-choice ${stateClass}`}
                        disabled={revealed}
                        onClick={() => chooseAnswer(ci)}
                      >
                        <span>{choice}</span>
                        {revealed && isCorrect && <Check size={16} />}
                        {revealed && isSelected && !isCorrect && <X size={16} />}
                      </button>
                    )
                  })}
                </div>
                {selected !== null && <p className="quiz-explanation">{question.explanation}</p>}
              </div>

              {submitError && <p className="status-text status-error">{submitError}</p>}

              {selected !== null && (
                <button
                  type="button"
                  className="quiz-start-btn"
                  onClick={nextQuestion}
                  disabled={phase === 'submitting'}
                >
                  {phase === 'submitting' ? '채점 중...' : isLast ? '결과 보기' : '다음 문제'}
                </button>
              )}
            </div>
          )}

          {phase === 'result' && result && (
            <div className="quiz-result">
              <p className="quiz-result-score">
                결과: {result.score} / {result.total}점 ({Math.round((result.score / result.total) * 100)}%)
              </p>
              <p className="quiz-result-rank">
                오늘 참여자 {result.participantCount}명 중 <strong>{result.rank}위</strong>
              </p>
              {result.alreadyPlayed && <p className="quiz-result-note">오늘은 이미 응시하셨어요. 내일 다시 도전해보세요!</p>}
              <button type="button" className="quiz-share-btn" onClick={shareResult}>
                {copied ? '복사됨!' : '결과 공유하기'}
              </button>
            </div>
          )}

          <p className="page-disclaimer">AI가 최근 경제뉴스를 참고해 새로 구성한 퀴즈입니다. 정답은 참고용입니다.</p>

          <AdSlot placement="quiz" />
        </main>

        <aside className="site-sidebar">
          <QuizLeaderboard quizDate={quiz.quiz_date} highlightClientId={getClientId()} />
        </aside>
      </div>
    </div>
  )
}
