import { router } from './router'
import { useWebSocket } from '@shined/react-use'
import { toast, Toaster } from 'react-hot-toast'
import { RouterProvider } from 'react-router-dom'
import { useAutoDarkMode } from './hooks/use-dark-mode'
import { globalStore, useWsUrl } from './store'
import { onebotBus, useOneBotApi } from './hooks/use-onebot-api'
import { blackList } from './utils/blacklist'
import { homeStore } from './pages/store'
import { chatListStore } from './pages/chat/store'

export function App() {
  useAutoDarkMode()

  const api = useOneBotApi()

  const ws = useWebSocket(useWsUrl(), {
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
      const instance = ws.ws
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

      const isInBlacklist = blackList.some((id) => msg.user_id === id)

      switch (msg.post_type) {
        case 'message': {
          const target = homeStore.mutate.contactList.find((c) => {
            const isGroup = msg.message_type === 'group'
            return isGroup ? c.id === msg.group_id : c.id === msg.user_id
          })

          const { id, type } = chatListStore.mutate.session || {}

          if (target) {
            if (id === target.id && type === target.type) {
              target.unreadCount = 0
              target.chatting = true
            } else {
              !isInBlacklist && target.unreadCount++
              homeStore.mutate.contactList.splice(homeStore.mutate.contactList.indexOf(target), 1)
              homeStore.mutate.contactList.unshift(target)
            }

            const idx = msg.message.findIndex((e: any) => e.type === 'reply')

            if (idx !== -1 && msg.message.length > idx + 1) {
              const atItem = msg.message[idx + 1]

              if (atItem.type === 'at') {
                msg.message.splice(idx + 1, 1)
                msg.message[idx].data.__user_id__ = atItem.data.qq
              }
            }

            target.history.push(msg)
          }

          break
        }
        case 'notice':
          break
        case 'request':
          break
        case 'meta_event': {
          switch (msg.meta_event_type) {
            case 'heartbeat': {
              globalStore.mutate.isOnline = msg.status.online
              break
            }
            default:
              break
          }
          break
        }
        default:
          break
      }
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
