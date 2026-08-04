import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Sparkles, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import AdSlot from '../components/AdSlot.jsx'

export default function QuizPage() {
  const { date } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setAnswers({})

    let query = supabase.from('quizzes').select('quiz_date, questions, created_at')
    query = date
      ? query.eq('quiz_date', date).maybeSingle()
      : query.order('quiz_date', { ascending: false }).limit(1).maybeSingle()

    query.then(({ data }) => {
      if (!cancelled) {
        setQuiz(data)
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
  const answeredCount = Object.keys(answers).length
  const isDone = answeredCount === questions.length
  const score = questions.reduce((acc, q, i) => (answers[i] === q.correct_index ? acc + 1 : acc), 0)

  function selectAnswer(qIndex, choiceIndex) {
    if (answers[qIndex] !== undefined) return
    setAnswers((prev) => ({ ...prev, [qIndex]: choiceIndex }))
  }

  function shareResult() {
    const text = `[경제줍줍] 오늘의 경제 퀴즈 ${score}/${questions.length}점 획득! 너도 풀어봐 → ${window.location.href}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="site-container site-page">
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

      <ol className="quiz-list">
        {questions.map((q, qi) => {
          const selected = answers[qi]
          const revealed = selected !== undefined
          return (
            <li key={qi} className="quiz-question">
              <p className="quiz-question-text">
                {qi + 1}. {q.question}
              </p>
              <div className="quiz-choices">
                {q.choices.map((choice, ci) => {
                  const isCorrect = ci === q.correct_index
                  const isSelected = ci === selected
                  let stateClass = ''
                  if (revealed && isCorrect) stateClass = 'correct'
                  else if (revealed && isSelected && !isCorrect) stateClass = 'wrong'
                  return (
                    <button
                      key={ci}
                      type="button"
                      className={`quiz-choice ${stateClass}`}
                      disabled={revealed}
                      onClick={() => selectAnswer(qi, ci)}
                    >
                      <span>{choice}</span>
                      {revealed && isCorrect && <Check size={16} />}
                      {revealed && isSelected && !isCorrect && <X size={16} />}
                    </button>
                  )
                })}
              </div>
              {revealed && <p className="quiz-explanation">{q.explanation}</p>}
            </li>
          )
        })}
      </ol>

      {isDone && (
        <div className="quiz-result">
          <p className="quiz-result-score">
            결과: {score} / {questions.length}점
          </p>
          <button type="button" className="quiz-share-btn" onClick={shareResult}>
            {copied ? '복사됨!' : '결과 공유하기'}
          </button>
        </div>
      )}

      <p className="page-disclaimer">AI가 최근 경제뉴스를 참고해 새로 구성한 퀴즈입니다. 정답은 참고용입니다.</p>

      <AdSlot placement="quiz" />
    </div>
  )
}
