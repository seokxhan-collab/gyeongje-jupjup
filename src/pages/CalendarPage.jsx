import { useEffect, useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import { useDocumentMeta } from '../lib/useDocumentMeta.js'
import { EVENT_CATEGORIES, eventCategoryLabel } from '../lib/eventCategories.js'

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

const IMPORTANCE_OPTIONS = [
  { value: 'high', label: '중요' },
  { value: 'medium', label: '보통' },
]

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

function eventMonth(dateStr) {
  return dateStr.slice(5, 7)
}

function monthLabel(m) {
  return `${Number(m)}월`
}

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [months, setMonths] = useState([])
  const [importances, setImportances] = useState([])

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

  const filtered = useMemo(() => {
    const today = todayISODate()
    const hasMonthFilter = months.length > 0
    return events.filter((e) => {
      if (categories.length > 0 && !categories.includes(e.category)) return false
      if (importances.length > 0 && !importances.includes(e.importance)) return false
      if (hasMonthFilter) {
        if (!months.includes(eventMonth(e.event_date))) return false
      } else if (e.event_date < today) {
        return false
      }
      return true
    })
  }, [events, categories, importances, months])

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
            <button className={`chip ${categories.length === 0 ? 'active' : ''}`} onClick={() => setCategories([])}>
              전체
            </button>
            {EVENT_CATEGORIES.map((c) => (
              <button
                key={c.value}
                className={`chip ${categories.includes(c.value) ? 'active' : ''}`}
                onClick={() => setCategories((prev) => toggleValue(prev, c.value))}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-divider" aria-hidden="true" />

        <div className="filter-group">
          <span className="filter-label">중요도</span>
          <div className="filter-list">
            <button
              className={`chip ${importances.length === 0 ? 'active' : ''}`}
              onClick={() => setImportances([])}
            >
              전체
            </button>
            {IMPORTANCE_OPTIONS.map((i) => (
              <button
                key={i.value}
                className={`chip ${importances.includes(i.value) ? 'active' : ''}`}
                onClick={() => setImportances((prev) => toggleValue(prev, i.value))}
              >
                {i.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-divider" aria-hidden="true" />

        <div className="filter-group">
          <span className="filter-label">월</span>
          <div className="filter-list">
            <button className={`chip ${months.length === 0 ? 'active' : ''}`} onClick={() => setMonths([])}>
              전체
            </button>
            {MONTH_OPTIONS.map((m) => (
              <button
                key={m}
                className={`chip ${months.includes(m) ? 'active' : ''}`}
                onClick={() => setMonths((prev) => toggleValue(prev, m))}
              >
                {monthLabel(m)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {loading && <p className="page-empty">불러오는 중입니다...</p>}
      {!loading && grouped.length === 0 && (
        <p className="page-empty">
          {months.length === 0 ? '예정된 일정이 없습니다.' : '선택한 조건에 해당하는 일정이 없습니다.'}
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
