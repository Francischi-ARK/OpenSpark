import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav } from './components/BottomNav'
import { FoodScreen } from './screens/Food'
import { MeScreen } from './screens/Me'
import { Onboarding } from './screens/Onboarding'
import { PlanScreen } from './screens/Plan'
import { TodayScreen } from './screens/Today'
import { AppProvider, useApp } from './state/AppState'
import './index.css'

function Shell() {
  const { onboarded, completeOnboarding, tab, setTab } = useApp()

  if (!onboarded) {
    return (
      <div className="app-shell">
        <Onboarding onDone={completeOnboarding} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
        >
          {tab === 'today' && <TodayScreen />}
          {tab === 'food' && <FoodScreen />}
          {tab === 'plan' && <PlanScreen />}
          {tab === 'me' && <MeScreen />}
        </motion.div>
      </AnimatePresence>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
