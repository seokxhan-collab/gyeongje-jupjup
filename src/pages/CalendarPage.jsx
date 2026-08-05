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

function monthKey(dateStr) {
  return dateStr.slice(0, 7)
}

function monthLabel(key) {
  return `${Number(key.slice(5, 7))}월`
}

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [month, setMonth] = useState('all')

  useDocumentMeta({
    title: '경제 캘린더',
    description: 'FOMC, 한국은행 금융통화위원회, 미국 CPI·고용지표 등 주요 경제 일정을 한눈에 확인하세요.',
  })

  useEffect(() => {
    let cancelled = false
    supabase
      .from('economic_events')
      .select('id, event_date, title, category, country, importance, time_label, description')
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

  const months = useMemo(() => {
    const keys = new Set(events.map((e) => monthKey(e.event_date)))
    return Array.from(keys).sort()
  }, [events])

  const filtered = useMemo(() => {
    const today = todayISODate()
    return events.filter((e) => {
      if (category !== 'all' && e.category !== category) return false
      if (month === 'all') return e.event_date >= today
      return monthKey(e.event_date) === month
    })
  }, [events, category, month])

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

      <nav className="filter-bar" aria-label="경제 캘린더 필터">
        <div className="filter-group">
          <span className="filter-label">카테고리</span>
          <div className="filter-list">
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
        </div>

        <div className="filter-divider" aria-hidden="true" />

        <div className="filter-group">
          <span className="filter-label">월</span>
          <div className="filter-list">
            <button className={`chip ${month === 'all' ? 'active' : ''}`} onClick={() => setMonth('all')}>
              전체
            </button>
            {months.map((m) => (
              <button key={m} className={`chip ${month === m ? 'active' : ''}`} onClick={() => setMonth(m)}>
                {monthLabel(m)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {loading && <p className="page-empty">불러오는 중입니다...</p>}
      {!loading && grouped.length === 0 && (
        <p className="page-empty">
          {month === 'all' ? '예정된 일정이 없습니다.' : '선택한 달에는 등록된 일정이 없습니다.'}
        </p>
      )}

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
