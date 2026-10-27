import { useTheme } from 'next-themes'
import { AnimatedThemeToggler } from './magicui/animated-theme-toggler'
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <AnimatedThemeToggler className="theme-toggle" theme={theme === 'dark' ? 'dark' : 'light'} onThemeChange={setTheme} duration={320} aria-label={theme === 'dark' ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تاریک'}/>
}
