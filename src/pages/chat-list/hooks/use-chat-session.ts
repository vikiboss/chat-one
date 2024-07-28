import { useEffect } from 'react'
import { chatListStore } from '../store'
import { useActiveSession } from './use-active-session'
import { useChatList } from './use-chat-list'

export function useChatSession() {
  const chatList = useChatList()
  const session = useActiveSession()

  const target = chatList.find((c) => c.type === session?.type && c.id === session?.id)

  useEffect(() => {
    if (!target && chatList[0]) {
      chatList[0].unreadCount = 0
      chatList[0].chatting = true

      chatListStore.mutate.session = {
        id: chatList[0].id,
        type: chatList[0].type,
      }
    }
  }, [target, chatList[0]])

  return target ?? chatList[0]
}
