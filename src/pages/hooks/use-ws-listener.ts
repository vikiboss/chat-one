import { globalStore, wsApi } from '@/store'
import { useEventListener } from '@shined/react-use'
import { chatListStore } from '../chat/store'
import { homeStore } from '../store'
import { blackList } from '@/utils/blacklist'

export function useWsListener() {
  useEventListener(wsApi.instance, 'message', (message: MessageEvent) => {
    const msg = JSON.parse(message.data)

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
  })
}
