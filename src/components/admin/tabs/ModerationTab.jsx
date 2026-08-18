import { useState, useEffect, useCallback } from 'react'
import { supabase, invalidateTable } from '../../../lib/supabase'

/* Единая очередь: новые карточки/проекты (status='pending') и правки к уже
   живым (has_pending_edit=true, изменения лежат в pending_data и не видны
   на сайте, пока это не одобрено). */
async function loadQueue() {
  const [team, portfolio] = await Promise.all([
    supabase.from('team').select('*').or('status.eq.pending,has_pending_edit.eq.true').order('created_at'),
    supabase.from('portfolio').select('*').or('status.eq.pending,has_pending_edit.eq.true').order('created_at'),
  ])
  const items = [
    ...(team.data || []).map(row => ({ table: 'team', label: 'Команда', title: row.name, row })),
    ...(portfolio.data || []).map(row => ({ table: 'portfolio', label: 'Портфолио', title: row.title, row })),
  ]
  return items
}

function DiffList({ row }) {
  if (!row.has_pending_edit || !row.pending_data) return null
  const changed = Object.entries(row.pending_data).filter(([k, v]) => JSON.stringify(row[k]) !== JSON.stringify(v))
  if (!changed.length) return null
  return (
    <div className="adm-mod-diff">
      {changed.map(([k, v]) => (
        <div key={k} className="adm-mod-diff-row">
          <span className="adm-td-dim">{k}:</span>{' '}
          <span className="adm-mod-diff-old">{String(row[k] ?? '—')}</span>
          {' → '}
          <span className="adm-mod-diff-new">{String(v ?? '—')}</span>
        </div>
      ))}
    </div>
  )
}

export default function ModerationTab() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setItems(await loadQueue())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const approve = async (item) => {
    const key = `${item.table}_${item.row.id}`
    setBusyKey(key)
    const payload = item.row.has_pending_edit
      ? { ...item.row.pending_data, pending_data: null, has_pending_edit: false }
      : { status: 'approved' }
    await supabase.from(item.table).update(payload).eq('id', item.row.id)
    invalidateTable(item.table)
    await load()
    setBusyKey(null)
  }

  const reject = async (item) => {
    if (!confirm(`Отклонить «${item.title || '(без названия)'}»?`)) return
    const key = `${item.table}_${item.row.id}`
    setBusyKey(key)
    const payload = item.row.has_pending_edit
      ? { pending_data: null, has_pending_edit: false }
      : { status: 'rejected' }
    await supabase.from(item.table).update(payload).eq('id', item.row.id)
    invalidateTable(item.table)
    await load()
    setBusyKey(null)
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Модерация</h2>
          <p className="adm-tab-sub">{items.length} на проверке — карточки и проекты команды</p>
        </div>
      </div>

      <div className="adm-list">
        {items.map(item => {
          const key = `${item.table}_${item.row.id}`
          return (
            <div key={key} className="adm-review-card">
              <div className="adm-review-body">
                <div className="adm-td-strong">
                  {item.title || '(без названия)'}
                  <span className="adm-tag">{item.label}</span>
                  <span className={`adm-badge adm-badge-${item.row.has_pending_edit ? 'pending' : item.row.status}`}>
                    {item.row.has_pending_edit ? 'правка' : 'новое'}
                  </span>
                </div>
                <DiffList row={item.row} />
              </div>
              <div className="adm-td-actions">
                <button className="adm-btn-sm" disabled={busyKey === key} onClick={() => approve(item)}>
                  ✅ Одобрить
                </button>
                <button className="adm-btn-sm adm-btn-danger" disabled={busyKey === key} onClick={() => reject(item)}>
                  ❌ Отклонить
                </button>
              </div>
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="adm-empty">Пока ничего не ждёт проверки</div>
        )}
      </div>
    </div>
  )
}
