import { Megaphone, Search, Target } from 'lucide-react'

export const ROLES = [
  'Client',
  'Media Buyer',
  'Funneler',
  'Video Editor',
  'Graphic Designer',
]

export const ROLE_BADGE_STYLES = {
  'Client': 'bg-amber-50 text-amber-700 border-amber-200',
  'Media Buyer': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Funneler': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Video Editor': 'bg-purple-50 text-purple-700 border-purple-200',
  'Graphic Designer': 'bg-rose-50 text-rose-700 border-rose-200',
}

export const AREAS = [
  { id: 'meta_ads', name: 'Meta Ads', color: 'from-blue-500 to-indigo-600' },
  { id: 'google_ads', name: 'Google Ads', color: 'from-amber-400 to-orange-500' },
  { id: 'ghl', name: 'Go High Level', color: 'from-emerald-400 to-teal-600' },
]

export const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'bg-red-500', text: 'text-red-600' },
  medium: { label: 'Medium', color: 'bg-amber-400', text: 'text-amber-600' },
  low: { label: 'Low', color: 'bg-gray-300', text: 'text-gray-500' },
}
