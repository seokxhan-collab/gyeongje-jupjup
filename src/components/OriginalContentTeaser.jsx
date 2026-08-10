import { Link } from 'react-router-dom'
import { CalendarDays, Send, ChevronRight } from 'lucide-react'

export default function OriginalContentTeaser() {
  return (
    <div className="teaser-card">
      <Link to="/calendar" className="teaser-item">
        <span className="teaser-icon teaser-icon-calendar">
          <CalendarDays size={16} />
        </span>
        <span className="teaser-body">
          <span className="teaser-title">경제 캘린더</span>
          <span className="teaser-desc">FOMC·금통위·CPI 등 주요 일정 미리 보기</span>
        </span>
        <ChevronRight size={16} className="teaser-arrow" />
      </Link>
      <Link to="/subscribe" className="teaser-item">
        <span className="teaser-icon teaser-icon-subscribe">
          <Send size={16} />
        </span>
        <span className="teaser-body">
          <span className="teaser-title">오늘의 브리핑 구독 (무료)</span>
          <span className="teaser-desc">텔레그램·이메일로 매일 아침 브리핑 무료로 받아보기</span>
        </span>
        <ChevronRight size={16} className="teaser-arrow" />
      </Link>
    </div>
  )
}
