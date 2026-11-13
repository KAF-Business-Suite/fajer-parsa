import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
export function ThemeToggle({labels}: {labels?: {light:string;dark:string}} = {}) {
  const { theme, setTheme } = useTheme()
  const dark=theme==='dark'
  return <button type="button" className="theme-toggle fp-control" aria-pressed={dark} onClick={()=>setTheme(dark?'light':'dark')} aria-label={dark?(labels?.light ?? 'فعال کردن حالت روشن'):(labels?.dark ?? 'فعال کردن حالت تاریک')}>{dark?<Sun size={18} aria-hidden="true"/>:<Moon size={18} aria-hidden="true"/>}</button>
}
