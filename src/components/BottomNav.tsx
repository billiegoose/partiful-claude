import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/e/new/edit', icon: '＋', label: 'Create' },
  { path: '/profile', icon: '👤', label: 'Profile' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex z-40">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={[
              'flex-1 flex flex-col items-center py-3 gap-1 min-h-[60px] text-xs',
              'transition-colors',
              isActive ? 'text-white' : 'text-zinc-500',
            ].join(' ')}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
