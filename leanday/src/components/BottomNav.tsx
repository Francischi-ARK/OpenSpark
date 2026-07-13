import type { Tab } from '../state/AppState'

const items: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: '今日', icon: '◉' },
  { id: 'food', label: '饮食', icon: '◎' },
  { id: 'plan', label: '方案', icon: '◇' },
  { id: 'me', label: '我的', icon: '○' },
]

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {items.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${tab === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.id)}
          type="button"
        >
          <span className="nav-icon" aria-hidden>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
