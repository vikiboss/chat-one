import { router } from './router'
import { useWebSocket } from '@shined/react-use'
import { toast, Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { useAutoDarkMode } from './hooks/use-dark-mode'
import { globalStore, useWsUrl } from './store'
import { onebotBus, useOneBotApi } from './hooks/use-onebot-api'

export function App() {
  useAutoDarkMode()

  const api = useOneBotApi()

  const { ws } = useWebSocket(useWsUrl(), {
    filter: (e) => {
      const data = JSON.parse(e.data)
      return data.meta_event_type === 'heartbeat'
    },
    onClose() {
      console.log('[ws closed]')
      globalStore.mutate.isConnected = false
      toast.error('WS connection closed')
    },
    async onOpen() {
      console.log('[ws opened]')
      globalStore.mutate.isConnected = true
      const instance = ws()
      if (instance) {
        globalStore.mutate.ws.ref.instance = instance
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
    reconnect: {
      count: 3,
      interval: 3000,
      onReconnect: () => {
        toast('WS reconnecting...')
      },
      onReconnectFailed: () => {
        toast.error('WS reconnect failed')
      },
    },
  })

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
