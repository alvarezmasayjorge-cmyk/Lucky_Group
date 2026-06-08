import { useState } from 'react'
import { Wallet } from 'lucide-react'

const CURRENCIES = ['USD', 'EUR', 'MXN', 'GBP', 'COP', 'CAD', 'AUD']

const formatMoney = (amount, currency) => {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount || 0)
  } catch {
    return `${(amount || 0).toFixed(2)} ${currency}`
  }
}

export default function BudgetsView({ clients, onSaveBudget }) {
  // Local edit buffer keyed by client id, so we only write to Firestore on confirm.
  const [edits, setEdits] = useState({})

  const valueFor = (client, field, fallback) => {
    const e = edits[client.id]
    if (e && e[field] !== undefined) return e[field]
    return client[field] ?? fallback
  }

  const setEdit = (clientId, field, value) => {
    setEdits(prev => ({ ...prev, [clientId]: { ...prev[clientId], [field]: value } }))
  }

  const commitNumber = (client, field) => {
    const raw = valueFor(client, field, 0)
    const num = Math.max(0, Number(raw) || 0)
    if (num === (client[field] ?? 0)) {
      // No change — just clear any local buffer for this field.
      setEdits(prev => {
        const next = { ...prev[client.id] }
        delete next[field]
        return { ...prev, [client.id]: next }
      })
      return
    }
    onSaveBudget(client.id, { [field]: num })
  }

  const commitCurrency = (client, value) => {
    setEdit(client.id, 'budget_currency', value)
    if (value !== (client.budget_currency || 'USD')) {
      onSaveBudget(client.id, { budget_currency: value })
    }
  }

  // Totals grouped by currency (summing across currencies is meaningless).
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
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4 font-bold">Client Name</th>
              <th className="px-6 py-4 font-bold text-center">Currency</th>
              <th className="px-6 py-4 font-bold text-right">Allocated</th>
              <th className="px-6 py-4 font-bold text-right">Spent</th>
              <th className="px-6 py-4 font-bold text-right">Remaining</th>
              <th className="px-6 py-4 font-bold w-1/4">% Used</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Wallet className="w-10 h-10 text-gray-200" />
                    <p className="text-gray-500 font-medium">No clients yet.</p>
                    <p className="text-gray-400 text-sm">Create a client to track its budget.</p>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map(client => {
                const currency = valueFor(client, 'budget_currency', 'USD')
                const allocated = Number(valueFor(client, 'budget_allocated', 0)) || 0
                const spent = Number(valueFor(client, 'budget_spent', 0)) || 0
                const remaining = allocated - spent
                const pct = allocated === 0 ? 0 : Math.round((spent / allocated) * 100)
                const barColor = pct > 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-brand-primary'

                return (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={currency}
                        onChange={(e) => commitCurrency(client, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={valueFor(client, 'budget_allocated', 0)}
                        onChange={(e) => setEdit(client.id, 'budget_allocated', e.target.value)}
                        onBlur={() => commitNumber(client, 'budget_allocated')}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                        className="w-28 text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={valueFor(client, 'budget_spent', 0)}
                        onChange={(e) => setEdit(client.id, 'budget_spent', e.target.value)}
                        onBlur={() => commitNumber(client, 'budget_spent')}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                        className="w-28 text-right bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                      />
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${remaining < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                      {formatMoney(remaining, currency)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`${barColor} h-2 rounded-full transition-all`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700 min-w-[3rem] text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          {currencyRows.length > 0 && (
            <tfoot className="border-t-2 border-gray-200 bg-gray-50/50">
              {currencyRows.map(([cur, t]) => (
                <tr key={cur} className="text-sm">
                  <td className="px-6 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs" colSpan="2">
                    Total ({cur})
                  </td>
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
