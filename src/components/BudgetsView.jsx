import { useState } from 'react'
import { Wallet, ChevronDown, ChevronRight } from 'lucide-react'
import { BUDGET_PLATFORMS as PLATFORMS } from '../lib/constants'

const CURRENCIES = ['USD', 'EUR', 'MXN', 'GBP', 'COP', 'CAD', 'AUD']

const formatMoney = (amount, currency) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount || 0)
  } catch {
    return `${(amount || 0).toFixed(2)} ${currency}`
  }
}

export default function BudgetsView({ clients, onSaveBudget }) {
  const [edits, setEdits] = useState({})
  const [expanded, setExpanded] = useState({})

  const toggleExpand = (clientId) =>
    setExpanded(prev => ({ ...prev, [clientId]: !prev[clientId] }))

  // Get current value from local edit buffer or client doc
  const valueOf = (clientId, path, fallback) => {
    const e = edits[clientId]
    if (!e) return fallback
    const parts = path.split('.')
    let v = e
    for (const p of parts) { if (v == null) return fallback; v = v[p] }
    return v !== undefined ? v : fallback
  }

  const setEditPath = (clientId, path, value) => {
    setEdits(prev => {
      const base = { ...(prev[clientId] || {}) }
      const parts = path.split('.')
      if (parts.length === 1) {
        base[parts[0]] = value
      } else {
        base[parts[0]] = { ...(base[parts[0]] || {}), [parts[1]]: { ...((base[parts[0]] || {})[parts[1]] || {}), [parts[2]]: value } }
      }
      return { ...prev, [clientId]: base }
    })
  }

  const commitPlatform = (client, platformId, field) => {
    const raw = valueOf(client.id, `platform_budgets.${platformId}.${field}`, 0)
    const num = Math.max(0, Number(raw) || 0)

    // Get all current platform values from edit buffer or client doc
    const pb = client.platform_budgets || {}
    const updatedPb = {}
    for (const p of PLATFORMS) {
      const alloc = p.id === platformId && field === 'allocated'
        ? num
        : Number(valueOf(client.id, `platform_budgets.${p.id}.allocated`, pb[p.id]?.allocated ?? 0)) || 0
      const spent = p.id === platformId && field === 'spent'
        ? num
        : Number(valueOf(client.id, `platform_budgets.${p.id}.spent`, pb[p.id]?.spent ?? 0)) || 0
      updatedPb[p.id] = { allocated: alloc, spent }
    }

    const totalAllocated = PLATFORMS.reduce((s, p) => s + updatedPb[p.id].allocated, 0)
    const totalSpent = PLATFORMS.reduce((s, p) => s + updatedPb[p.id].spent, 0)

    onSaveBudget(client.id, {
      platform_budgets: updatedPb,
      budget_allocated: totalAllocated,
      budget_spent: totalSpent,
    })
  }

  const commitCurrency = (client, value) => {
    setEditPath(client.id, 'budget_currency', value)
    onSaveBudget(client.id, { budget_currency: value })
  }

  // Footer totals grouped by currency
  const totalsByCurrency = {}
  for (const c of clients) {
    const cur = c.budget_currency || 'USD'
    if (!totalsByCurrency[cur]) totalsByCurrency[cur] = { allocated: 0, spent: 0 }
    totalsByCurrency[cur].allocated += c.budget_allocated ?? 0
    totalsByCurrency[cur].spent += c.budget_spent ?? 0
  }
  const currencyRows = Object.entries(totalsByCurrency)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[780px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4 font-bold w-8" />
              <th className="px-6 py-4 font-bold">Client / Platform</th>
              <th className="px-4 py-4 font-bold text-center">Currency</th>
              <th className="px-6 py-4 font-bold text-right">Allocated</th>
              <th className="px-6 py-4 font-bold text-right">Spent</th>
              <th className="px-6 py-4 font-bold text-right">Remaining</th>
              <th className="px-6 py-4 font-bold w-1/5">% Used</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Wallet className="w-10 h-10 text-gray-200" />
                    <p className="text-gray-500 font-medium">No clients yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map(client => {
                const currency = (edits[client.id]?.budget_currency) ?? client.budget_currency ?? 'USD'
                const allocated = client.budget_allocated ?? 0
                const spent = client.budget_spent ?? 0
                const remaining = allocated - spent
                const pct = allocated === 0 ? 0 : Math.round((spent / allocated) * 100)
                const barColor = pct > 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-brand-primary'
                const isExpanded = !!expanded[client.id]
                const pb = client.platform_budgets || {}

                return [
                  // Client header row
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => toggleExpand(client.id)}>
                    <td className="pl-4 py-4 text-gray-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{client.name}</td>
                    <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                      <select
                        value={currency}
                        onChange={(e) => commitCurrency(client, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-700">{formatMoney(allocated, currency)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-700">{formatMoney(spent, currency)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${remaining < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                      {formatMoney(remaining, currency)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>,

                  // Platform sub-rows (shown when expanded)
                  ...(isExpanded ? PLATFORMS.map(platform => {
                    const pAlloc = Number(valueOf(client.id, `platform_budgets.${platform.id}.allocated`, pb[platform.id]?.allocated ?? 0)) || 0
                    const pSpent = Number(valueOf(client.id, `platform_budgets.${platform.id}.spent`, pb[platform.id]?.spent ?? 0)) || 0
                    const pRemaining = pAlloc - pSpent
                    const pPct = pAlloc === 0 ? 0 : Math.round((pSpent / pAlloc) * 100)
                    const pBarColor = pPct > 100 ? 'bg-red-400' : pPct >= 80 ? 'bg-amber-400' : 'bg-brand-primary/60'

                    return (
                      <tr key={`${client.id}-${platform.id}`} className="bg-gray-50/30 hover:bg-gray-50/60 transition-colors">
                        <td className="pl-4 py-2.5" />
                        <td className="px-6 py-2.5 text-sm text-gray-600 font-medium pl-10">{platform.label}</td>
                        <td className="px-4 py-2.5" />
                        <td className="px-6 py-2.5 text-right">
                          <input
                            type="number" min="0" step="0.01"
                            value={valueOf(client.id, `platform_budgets.${platform.id}.allocated`, pb[platform.id]?.allocated ?? 0)}
                            onChange={e => setEditPath(client.id, `platform_budgets.${platform.id}.allocated`, e.target.value)}
                            onBlur={() => commitPlatform(client, platform.id, 'allocated')}
                            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
                            onClick={e => e.stopPropagation()}
                            className="w-28 text-right bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                          />
                        </td>
                        <td className="px-6 py-2.5 text-right">
                          <input
                            type="number" min="0" step="0.01"
                            value={valueOf(client.id, `platform_budgets.${platform.id}.spent`, pb[platform.id]?.spent ?? 0)}
                            onChange={e => setEditPath(client.id, `platform_budgets.${platform.id}.spent`, e.target.value)}
                            onBlur={() => commitPlatform(client, platform.id, 'spent')}
                            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
                            onClick={e => e.stopPropagation()}
                            className="w-28 text-right bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                          />
                        </td>
                        <td className={`px-6 py-2.5 text-right text-sm font-semibold ${pRemaining < 0 ? 'text-red-500' : 'text-gray-600'}`}>
                          {formatMoney(pRemaining, currency)}
                        </td>
                        <td className="px-6 py-2.5">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div className={`${pBarColor} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(pPct, 100)}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-500 min-w-[3rem] text-right">{pPct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  }) : []),
                ]
              })
            )}
          </tbody>
          {currencyRows.length > 0 && (
            <tfoot className="border-t-2 border-gray-200 bg-gray-50/50">
              {currencyRows.map(([cur, t]) => (
                <tr key={cur} className="text-sm">
                  <td className="px-6 py-3" />
                  <td className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">
                    Total ({cur})
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-6 py-3 text-right font-bold text-gray-900">{formatMoney(t.allocated, cur)}</td>
                  <td className="px-6 py-3 text-right font-bold text-gray-900">{formatMoney(t.spent, cur)}</td>
                  <td className={`px-6 py-3 text-right font-bold ${t.allocated - t.spent < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatMoney(t.allocated - t.spent, cur)}
                  </td>
                  <td className="px-6 py-3" />
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
