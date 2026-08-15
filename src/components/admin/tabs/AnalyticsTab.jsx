import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import { watchPresenceCount } from '../../../lib/analytics'

const fmt = (n) => n.toLocaleString('ru-RU')

const peopleWord = (n) => {
  const n10 = n % 10, n100 = n % 100
  if (n10 === 1 && n100 !== 11) return 'человек'
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return 'человека'
  return 'человек'
}

const dayKey = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.toISOString().slice(0, 10)
}
const startOfDaysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}
const shortLabel = (key) => {
  const [, m, day] = key.split('-')
  return `${day}.${m}`
}

/* Полоски по дням — свой SVG, без сторонней библиотеки графиков:
   на весь график всего пара килобайт и ни одной лишней зависимости в бандле. */
function Sparkbars({ data }) {
  const max = Math.max(1, ...data.map(d => d.count))
  const w = 640, h = 140, gap = 6
  const barW = (w - gap * (data.length - 1)) / data.length

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="adm-chart-svg" preserveAspectRatio="none" role="img" aria-label="Просмотры по дням">
      <defs>
        <linearGradient id="adm-bar-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const bh = d.count > 0 ? Math.max(3, (d.count / max) * (h - 4)) : 1
        const x = i * (barW + gap)
        const y = h - bh
        return (
          <rect key={d.date} x={x} y={y} width={barW} height={bh} rx={3}
            fill={d.count > 0 ? 'url(#adm-bar-grad)' : 'rgba(255,255,255,.08)'}>
            <title>{`${d.date}: ${d.count}`}</title>
          </rect>
        )
      })}
    </svg>
  )
}

export default function AnalyticsTab() {
  const [live, setLive] = useState(0)
  const [loading, setLoading] = useState(true)
  const [todayCount, setTodayCount] = useState(0)
  const [week7Count, setWeek7Count] = useState(0)
  const [rows14, setRows14] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => watchPresenceCount(setLive), [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErr('')
      const since14 = startOfDaysAgo(13).toISOString()
      const since7  = startOfDaysAgo(6).toISOString()
      const since0  = startOfDaysAgo(0).toISOString()

      const [today, w7, r14] = await Promise.all([
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since0),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since7),
        supabase.from('page_views').select('path, visitor_id, created_at').gte('created_at', since14),
      ])

      if (today.error || w7.error || r14.error) {
        setErr((today.error || w7.error || r14.error).message)
        setLoading(false)
        return
      }

      setTodayCount(today.count || 0)
      setWeek7Count(w7.count || 0)
      setRows14(r14.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const series = useMemo(() => {
    const byDay = new Map()
    for (let i = 13; i >= 0; i--) byDay.set(dayKey(startOfDaysAgo(i)), 0)
    for (const r of rows14) {
      const k = dayKey(r.created_at)
      if (byDay.has(k)) byDay.set(k, byDay.get(k) + 1)
    }
    return [...byDay.entries()].map(([date, count]) => ({ date, count }))
  }, [rows14])

  const uniqueVisitors14 = useMemo(
    () => new Set(rows14.map(r => r.visitor_id)).size,
    [rows14]
  )

  const topPages = useMemo(() => {
    const byPath = new Map()
    for (const r of rows14) byPath.set(r.path, (byPath.get(r.path) || 0) + 1)
    return [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [rows14])

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab adm-tab-wide">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Аналитика</h2>
          <p className="adm-tab-sub">Кто сейчас на сайте и сколько было посещений. Видно только в админке.</p>
        </div>
      </div>

      {err && <p className="adm-msg err" style={{ marginBottom: 16 }}>Ошибка: {err}. Похоже, не выполнен supabase/analytics.sql.</p>}

      {/* ── Сейчас на сайте ── */}
      <div className="adm-live-card">
        <span className="adm-live-dot" />
        <div>
          <div className="adm-live-num">{fmt(live)}</div>
          <div className="adm-live-label">{peopleWord(live)} сейчас на сайте</div>
        </div>
      </div>

      {/* ── Сводка ── */}
      <div className="adm-stat-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-num">{fmt(todayCount)}</div>
          <div className="adm-stat-label">Просмотров сегодня</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-num">{fmt(week7Count)}</div>
          <div className="adm-stat-label">За 7 дней</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-num">{fmt(rows14.length)}</div>
          <div className="adm-stat-label">За 14 дней</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-num">{fmt(uniqueVisitors14)}</div>
          <div className="adm-stat-label">Уникальных за 14 дней</div>
        </div>
      </div>

      {/* ── График ── */}
      <div className="adm-chart-card">
        <h3 className="adm-sound-title">Просмотры по дням</h3>
        <Sparkbars data={series} />
        <div className="adm-chart-labels">
          <span>{shortLabel(series[0]?.date || '')}</span>
          <span>{shortLabel(series[series.length - 1]?.date || '')}</span>
        </div>
      </div>

      {/* ── Популярные страницы ── */}
      <div className="adm-chart-card">
        <h3 className="adm-sound-title">Популярные страницы (14 дней)</h3>
        {topPages.length === 0 && <p className="adm-tab-sub">Пока нет данных</p>}
        <div className="adm-top-pages">
          {topPages.map(([path, count]) => {
            const max = topPages[0][1]
            return (
              <div key={path} className="adm-top-row">
                <span className="adm-top-path">{path}</span>
                <div className="adm-top-bar-track">
                  <div className="adm-top-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span className="adm-top-count">{fmt(count)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
