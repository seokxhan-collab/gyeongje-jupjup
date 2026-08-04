import { Link } from 'react-router-dom'
import { Sparkles, Newspaper, ChevronRight } from 'lucide-react'

export default function OriginalContentTeaser() {
  return (
    <div className="teaser-card">
      <Link to="/quiz" className="teaser-item">
        <span className="teaser-icon teaser-icon-quiz">
          <Sparkles size={16} />
        </span>
        <span className="teaser-body">
          <span className="teaser-title">오늘의 경제 퀴즈</span>
          <span className="teaser-desc">AI가 오늘 뉴스로 만든 퀴즈 풀어보기</span>
        </span>
        <ChevronRight size={16} className="teaser-arrow" />
      </Link>
      <Link to="/weekly" className="teaser-item">
        <span className="teaser-icon teaser-icon-weekly">
          <Newspaper size={16} />
        </span>
        <span className="teaser-body">
          <span className="teaser-title">주간 시황 총평</span>
          <span className="teaser-desc">한 주의 경제 흐름을 정리한 칼럼</span>
        </span>
        <ChevronRight size={16} className="teaser-arrow" />
      </Link>
    </div>
  )
}
