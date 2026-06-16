import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ThemeProvider'

const cycle = { system: 'light', light: 'dark', dark: 'system' } as const

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(cycle[theme])}>
      {theme === 'dark' && <Moon className="h-5 w-5" />}
      {theme === 'light' && <Sun className="h-5 w-5" />}
      {theme === 'system' && <Monitor className="h-5 w-5" />}
    </Button>
  )
}
