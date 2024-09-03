import { toast, Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { useAutoDarkMode } from './hooks/use-dark-mode'
import { onebotBus, useOneBotApi } from './hooks/use-onebot-api'
import { useWebsocket } from './hooks/use-websocket'
import { router } from './router'
import { globalStore, useWsUrl } from './store'

export function App() {
  useAutoDarkMode()

  const api = useOneBotApi()

  const wsRef = useWebsocket(useWsUrl(), {
    onClose() {
      console.log('[ws closed]')
      globalStore.mutate.isConnected = false
      toast.error('WS connection closed')
    },
    async onOpen() {
      console.log('[ws opened]')
      globalStore.mutate.isConnected = true

      if (wsRef.current) {
        globalStore.mutate.ws.ref.instance = wsRef.current

        const iRes = await api.action<{ data: any }>('get_login_info')
        globalStore.mutate.userInfo = iRes.data
      }
    },
    onMessage(message) {
      const msg = JSON.parse(message.data)
      console.log('[ws message]', msg)
      if (msg.echo) onebotBus.emit(`action:${msg.echo}`, msg)
    },
    onError(error) {
      console.error('[ws error]', error)
      toast.error('WS connection error')
    },
  })

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
