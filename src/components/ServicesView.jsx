import { Check, Grid3x3 } from 'lucide-react'
import { PLATFORMS } from '../lib/constants'

export default function ServicesView({ clients, onToggleService }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ minWidth: `${200 + PLATFORMS.length * 140}px` }}>
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4 font-bold sticky left-0 bg-gray-50/50 z-10">Client Name</th>
              {PLATFORMS.map(p => (
                <th key={p.id} className="px-4 py-4 font-bold text-center">{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={PLATFORMS.length + 1} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Grid3x3 className="w-10 h-10 text-gray-200" />
                    <p className="text-gray-500 font-medium">No clients yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map(client => {
                const services = client.services || {}
                const hasAny = PLATFORMS.some(p => services[p.id])
                return (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className={`px-6 py-4 font-bold sticky left-0 bg-white z-10 ${hasAny ? 'text-gray-900' : 'text-red-500'}`}>
                      {client.name}
                    </td>
                    {PLATFORMS.map(p => {
                      const active = !!services[p.id]
                      return (
                        <td key={p.id} className="px-4 py-4 text-center">
                          <button
                            onClick={() => onToggleService(client.id, p.id, active)}
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-md border-2 transition-all ${
                              active
                                ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600'
                                : 'bg-white border-gray-300 text-transparent hover:border-gray-400'
                            }`}
                            aria-label={`Toggle ${p.label} for ${client.name}`}
                          >
                            <Check className="w-4 h-4" strokeWidth={3} />
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
