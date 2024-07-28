import { wsApi } from '@/store'
import { useEventListener } from '@shined/react-use'
import { chatListStore } from '../chat-list/store'
import { homeStore } from '../store'

export function useWsListener() {
  useEventListener(wsApi.instance, 'message', (message: MessageEvent) => {
    const msg = JSON.parse(message.data)

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
            target.unreadCount++
            homeStore.mutate.contactList.splice(homeStore.mutate.contactList.indexOf(target), 1)
            homeStore.mutate.contactList.unshift(target)
          }

          target.history.push(msg)
        }

        break
      }
      case 'notice':
        break
      case 'request':
        break
      case 'meta_event':
        break
      default:
        break
    }
  })
}
