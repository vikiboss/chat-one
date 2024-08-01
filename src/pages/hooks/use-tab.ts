import { cn } from '@/utils'
import { useStableFn } from '@shined/react-use'
import { useNavigate } from 'react-router-dom'
import { homeStore } from '../store'

export function useTab() {
  const navigate = useNavigate()
  const value = homeStore.useSnapshot((s) => s.tab)

  const setTab = useStableFn((tab: 'chat' | 'contact' | 'setting') => {
    homeStore.mutate.tab = tab
    navigate(tab)
  })

  return {
    value,
    setTab,
    props(targetTab: 'chat' | 'contact' | 'setting') {
      return {
        onClick() {
          setTab(targetTab)
        },
        className: cn(
          'flex items-center gap-1 rounded cursor-pointer px-4 py-1',
          value === targetTab ? 'bg-lime-5/36 dark:bg-lime-8/36' : 'hover:bg-zinc/12 dark:hover:bg-zinc/12',
        ),
      }
    },
  }
}
