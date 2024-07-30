import { useMediaQuery } from '@shined/react-use'
import { useEffect } from 'react'

export function useAutoDarkMode() {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)')

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('arco-theme', 'dark')
    } else {
      document.body.removeAttribute('arco-theme')
    }
  }, [isDark])

  return isDark
}
