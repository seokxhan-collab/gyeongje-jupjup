import { useEffect, useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { EVENT_CATEGORIES, eventCategoryLabel } from '../lib/eventCategories.js'

function todayISODate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDateHeader(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(d)
}

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')

  useDocumentMeta({
    title: '경제 캘린더',
    description: 'FOMC, 한국은행 금융통화위원회, 미국 CPI·고용지표 등 주요 경제 일정을 한눈에 확인하세요.',
  })

  useEffect(() => {
    let cancelled = false
    supabase
      .from('economic_events')
      .select('id, event_date, title, category, country, importance, time_label, description')
      .gte('event_date', todayISODate())
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        if (!cancelled) {
          setEvents(data ?? [])
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (category === 'all') return events
    return events.filter((e) => e.category === category)
  }, [events, category])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const e of filtered) {
      if (!map.has(e.event_date)) map.set(e.event_date, [])
      map.get(e.event_date).push(e)
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <div className="site-container site-page">
      <div className="page-header">
        <div className="page-header-title">
          <CalendarDays size={18} />
          <h2 className="page-title">경제 캘린더</h2>
        </div>
        <span className="page-date">FOMC·한국은행 금통위·CPI·고용지표 등 주요 경제 일정을 미리 확인하세요</span>
      </div>

      <div className="filter-list calendar-category-list">
        {[{ value: 'all', label: '전체' }, ...EVENT_CATEGORIES].map((c) => (
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
      {!loading && grouped.length === 0 && <p className="page-empty">예정된 일정이 없습니다.</p>}

      <div className="calendar-list">
        {grouped.map(([date, dayEvents]) => (
          <div key={date} className="calendar-day-group">
            <h3 className="calendar-day-header">{formatDateHeader(date)}</h3>
            <ul className="calendar-event-list">
              {dayEvents.map((e) => (
                <li key={e.id} className="calendar-event-item">
                  <div className="calendar-event-head">
                    <span className={`badge badge-${e.country}`}>{e.country === 'domestic' ? '국내' : '해외'}</span>
                    <span className={`badge badge-calcat-${e.category}`}>{eventCategoryLabel(e.category)}</span>
                    {e.importance === 'high' && (
                      <span className="calendar-importance" aria-label="중요 일정">
                        ★★★
                      </span>
                    )}
                  </div>
                  <h4 className="calendar-event-title">{e.title}</h4>
                  {e.description && <p className="calendar-event-desc">{e.description}</p>}
                  {e.time_label && <p className="calendar-event-time">{e.time_label}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
