import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://chgvntaippgbljedbnir.supabase.co',
  'sb_publishable_Q8igJiH4Vm7n231OKhXtew_XkNWIHFw'
)

const ASSETS = [
  { key: 'eurusd',  label: 'EUR/USD' },
  { key: 'usdjpy',  label: 'USD/JPY' },
  { key: 'sp500',   label: 'S&P 500' },
  { key: 'nasdaq',  label: 'Nasdaq' },
  { key: 'topix',   label: 'Topix' },
  { key: 'europe',  label: 'Actions Europe' },
  { key: 'gold',    label: 'Or' },
  { key: 'oil',     label: 'Pétrole' },
  { key: 'us_rates',label: 'Taux US 10Y' },
  { key: 'eu_rates',label: 'Taux EUR 10Y' },
]

const COLORS = {
  '-2': '#c0392b', '-1': '#e67e22',
  '0': '#7f8c8d', '1': '#27ae60', '2': '#1a7a4a'
}

const today = () => new Date().toISOString().split('T')[0]
const fmt = d => { const [y,m,day]=d.split('-'); return `${day}/${m}/${y}` }

export default function Home() {
  const [tab, setTab] = useState('journal')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [date, setDate] = useState(today())
  const [sentiments, setSentiments] = useState(
    Object.fromEntries(ASSETS.map(a => [a.key, null]))
  )
  const [comment, setComment] = useState('')

  useEffect(() => { loadEntries() }, [])

  async function loadEntries() {
    setLoading(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('entry_date', { ascending: false })
    if (!error) setEntries(data || [])
    setLoading(false)
  }

  async function saveEntry() {
    setSaving(true)
    const row = { entry_date: date, comment, ...sentiments }
    const { error } = await supabase
      .from('entries')
      .upsert(row, { onConflict: 'entry_date' })
    if (error) {
      setStatus('❌ Erreur : ' + error.message)
    } else {
      setStatus('✅ Sauvegardé !')
      await loadEntries()
      setTab('journal')
    }
    setSaving(false)
    setTimeout(() => setStatus(''), 3000)
  }

  const set = (key, val) => setSentiments(s => ({ ...s, [key]: val }))

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>Market Journal</div>
            <div style={{ color: '#8892a4', fontSize: 11 }}>Wealth Management</div>
          </div>
          <div style={{ color: '#27ae60', fontSize: 12 }}>{status}</div>
        </div>
        <div style={{ display: 'flex' }}>
          {['journal','saisie','synthese'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab===t ? '#fff' : 'transparent',
              color: tab===t ? '#1a1a2e' : '#8892a4',
              border: 'none', padding: '9px 16px', fontSize: 13,
              fontWeight: tab===t ? 700 : 400,
              cursor: 'pointer', borderRadius: '8px 8px 0 0',
              textTransform: 'capitalize'
            }}>{t === 'synthese' ? 'Synthèse' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* JOURNAL */}
        {tab === 'journal' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Chargement...</div>
            ) : entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
                <div style={{ fontSize: 32 }}>📓</div>
                <div style={{ marginTop: 8 }}>Aucune entrée</div>
              </div>
            ) : entries.map(e => (
              <div key={e.id} style={{ background: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, border: '1px solid #e8ecf0' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#1a1a2e' }}>{fmt(e.entry_date)}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {ASSETS.map(a => e[a.key] !== null && e[a.key] !== undefined && (
                    <span key={a.key} style={{
                      background: COLORS[e[a.key]] + '20',
                      color: COLORS[e[a.key]],
                      border: `1px solid ${COLORS[e[a.key]]}40`,
                      borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 700
                    }}>{a.label} {e[a.key] > 0 ? '+' : ''}{e[a.key]}</span>
                  ))}
                </div>
                {e.comment && <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5, borderLeft: '3px solid #1a1a2e', paddingLeft: 10 }}>{e.comment}</div>}
              </div>
            ))}
          </div>
        )}

        {/* SAISIE */}
        {tab === 'saisie' && (
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e8ecf0' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ display: 'block', marginTop: 4, border: '1.5px solid #dde1e7', borderRadius: 7, padding: '8px 12px', fontSize: 14, width: '100%' }} />
            </div>

            {ASSETS.map(a => (
              <div key={a.key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: '#444', fontWeight: 600, marginBottom: 6 }}>{a.label}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[-2,-1,0,1,2].map(v => (
                    <button key={v} onClick={() => set(a.key, v)} style={{
                      flex: 1, padding: '8px 0',
                      border: sentiments[a.key]===v ? `2px solid ${COLORS[v]}` : '1.5px solid #dde1e7',
                      borderRadius: 7,
                      background: sentiments[a.key]===v ? COLORS[v]+'20' : '#fff',
                      color: sentiments[a.key]===v ? COLORS[v] : '#aaa',
                      fontWeight: sentiments[a.key]===v ? 700 : 400,
                      fontSize: 13, cursor: 'pointer'
                    }}>{v > 0 ? `+${v}` : v}</button>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Commentaire</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Ton analyse du jour..."
                rows={4} style={{ display: 'block', marginTop: 4, width: '100%', border: '1.5px solid #dde1e7', borderRadius: 8, padding: '10px 12px', fontSize: 14, resize: 'vertical' }} />
            </div>

            <button onClick={saveEntry} disabled={saving} style={{
              marginTop: 16, width: '100%', background: '#1a1a2e', color: '#fff',
              border: 'none', borderRadius: 8, padding: '13px', fontSize: 15,
              fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer'
            }}>{saving ? 'Sauvegarde...' : 'Enregistrer'}</button>
          </div>
        )}

        {/* SYNTHESE */}
        {tab === 'synthese' && (
          <div>
            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Aucune donnée</div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, border: '1px solid #e8ecf0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
                  Moyenne sur {entries.length} entrée{entries.length > 1 ? 's' : ''}
                </div>
                {ASSETS.map(a => {
                  const vals = entries.map(e => e[a.key]).filter(v => v !== null && v !== undefined)
                  if (!vals.length) return null
                  const avg = (vals.reduce((x,y) => x+y, 0) / vals.length).toFixed(2)
                  const color = COLORS[Math.round(parseFloat(avg))]
                  return (
                    <div key={a.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#444' }}>{a.label}</span>
                      <span style={{ fontWeight: 700, color, fontSize: 13 }}>{parseFloat(avg) > 0 ? '+' : ''}{avg}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
