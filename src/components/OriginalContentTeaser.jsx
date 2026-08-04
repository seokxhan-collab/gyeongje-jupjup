import { Link } from 'react-router-dom'
import { Sparkles, Newspaper, BookOpen, Send, ChevronRight } from 'lucide-react'

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
      <Link to="/glossary" className="teaser-item">
        <span className="teaser-icon teaser-icon-glossary">
          <BookOpen size={16} />
        </span>
        <span className="teaser-body">
          <span className="teaser-title">경제 용어사전</span>
          <span className="teaser-desc">오늘의 뉴스 속 용어 하나씩 쉽게 알아보기</span>
        </span>
        <ChevronRight size={16} className="teaser-arrow" />
      </Link>
      <Link to="/subscribe" className="teaser-item">
        <span className="teaser-icon teaser-icon-subscribe">
          <Send size={16} />
        </span>
        <span className="teaser-body">
          <span className="teaser-title">오늘의 브리핑 구독</span>
          <span className="teaser-desc">텔레그램으로 매일 아침 브리핑 받아보기</span>
        </span>
        <ChevronRight size={16} className="teaser-arrow" />
      </Link>
    </div>
  )
}
