import { useState, useEffect, useRef } from 'react'
import { X, Building2, Loader2 } from 'lucide-react'

export default function NewClientModal({ isOpen, onClose, onConfirm, isLoading, errorMessage }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm(trimmed)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Client</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
              {errorMessage}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-white shadow-sm font-medium disabled:opacity-50"
              placeholder="e.g. Acme Corp"
              maxLength={80}
            />
          </div>

          <p className="text-xs text-gray-500">
            A full checklist template will be created automatically for this client across all areas.
          </p>

          <div className="flex justify-end space-x-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-gray-600 font-bold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex items-center px-6 py-2.5 text-white font-bold bg-gray-900 rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
