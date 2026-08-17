import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

const STATUS_LABEL = {
  pending:   'Ожидает',
  active:    'Активна',
  expired:   'Истекла',
  cancelled: 'Отозвана',
}

const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '—'

export default function SubscribersTab() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId,  setBusyId]  = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /* Отзыв доступа в Telegram-канале делает reconciliation-цикл на VPS —
     тут только меняем строку в Supabase, дальше синхронизируется само. */
  const extend = async (row) => {
    setBusyId(row.id)
    const base = row.expires_at && new Date(row.expires_at) > new Date()
      ? new Date(row.expires_at)
      : new Date()
    base.setDate(base.getDate() + 30)
    await supabase.from('subscribers')
      .update({ status: 'active', expires_at: base.toISOString() })
      .eq('id', row.id)
    await load()
    setBusyId(null)
  }

  const revoke = async (row) => {
    if (!confirm(`Отозвать подписку у ${row.full_name || row.telegram_username || 'этого пользователя'}?`)) return
    setBusyId(row.id)
    await supabase.from('subscribers').update({ status: 'cancelled' }).eq('id', row.id)
    await load()
    setBusyId(null)
  }

  if (loading) return <div className="adm-loader">Загрузка...</div>

  return (
    <div className="adm-tab">
      <div className="adm-tab-hd">
        <div>
          <h2 className="adm-tab-title">Подписчики</h2>
          <p className="adm-tab-sub">{rows.length} записей — новые появляются сами после подтверждения оплаты в боте</p>
        </div>
      </div>

      <div className="adm-list">
        {rows.map(row => (
          <div key={row.id} className="adm-review-card">
            <div className="adm-review-body">
              <div className="adm-td-strong">
                {row.full_name || '—'}{' '}
                <span className={`adm-badge adm-badge-${row.status}`}>{STATUS_LABEL[row.status] || row.status}</span>
              </div>
              <div className="adm-td-dim">
                {row.telegram_username ? `@${row.telegram_username}` : `tg id: ${row.telegram_user_id ?? '—'}`}
                {' · план: '}{row.plan}
                {' · до '}{fmtDate(row.expires_at)}
              </div>
            </div>
            <div className="adm-td-actions">
              <button className="adm-btn-sm" disabled={busyId === row.id} onClick={() => extend(row)}>
                Продлить на месяц
              </button>
              <button className="adm-btn-sm adm-btn-danger" disabled={busyId === row.id || row.status === 'cancelled'} onClick={() => revoke(row)}>
                Отозвать
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="adm-empty">Пока никто не оформил подписку через бота</div>
        )}
      </div>
    </div>
  )
}
