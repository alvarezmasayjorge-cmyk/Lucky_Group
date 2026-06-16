import { Megaphone, Search, Target, Globe, ClipboardList } from 'lucide-react'

export const ROLES = [
  'Video Editor/Meta Specialist',
  'Google Specialist',
  'GoHighLevel Specialist',
  'Project Manager',
  'Executive Assistant',
  'CEO',
]

export const ROLE_BADGE_STYLES = {
  'Video Editor/Meta Specialist': 'bg-purple-50 text-purple-700 border-purple-200',
  'Google Specialist': 'bg-blue-50 text-blue-700 border-blue-200',
  'GoHighLevel Specialist': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Project Manager': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Executive Assistant': 'bg-amber-50 text-amber-700 border-amber-200',
  'CEO': 'bg-rose-50 text-rose-700 border-rose-200',
}

export const PLATFORMS = [
  { id: 'lsa',             label: 'LSA' },
  { id: 'google_ads',      label: 'Google Ads' },
  { id: 'facebook_ads',    label: 'Facebook Ads' },
  { id: 'ai_receptionist', label: 'AI Receptionist' },
  { id: 'seo',             label: 'SEO' },
  { id: 'website_built',   label: 'Website Built' },
]

export const BUDGET_PLATFORMS = [
  { id: 'lsa',         label: 'LSA' },
  { id: 'google_ads',  label: 'Google Ads' },
  { id: 'facebook_ads', label: 'Facebook Ads' },
]

export const AREAS = [
  { id: 'onboarding', name: 'Onboarding', color: 'from-cyan-500 to-blue-600' },
  { id: 'meta_ads', name: 'Meta Ads', color: 'from-blue-500 to-indigo-600' },
  { id: 'google_ads', name: 'Google Ads', color: 'from-amber-400 to-orange-500' },
  { id: 'lsa', name: 'LSA', color: 'from-sky-400 to-cyan-500' },
  { id: 'seo', name: 'SEO / AEO', color: 'from-violet-400 to-purple-600' },
  { id: 'ghl', name: 'Go High Level', color: 'from-emerald-400 to-teal-600' },
]

export const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'bg-red-500', text: 'text-red-600' },
  medium: { label: 'Medium', color: 'bg-amber-400', text: 'text-amber-600' },
  low: { label: 'Low', color: 'bg-gray-300', text: 'text-gray-500' },
}

export const STATUS = {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'completed',
}

export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    next: 'in_progress',
    iconColor: 'text-gray-300 hover:text-amber-400',
    rowOpacity: '',
  },
  in_progress: {
    label: 'In Progress',
    next: 'completed',
    iconColor: 'text-amber-400',
    rowOpacity: '',
  },
  completed: {
    label: 'Completed',
    next: 'pending',
    iconColor: 'text-green-500',
    rowOpacity: 'opacity-50 grayscale-[0.3]',
  },
}
