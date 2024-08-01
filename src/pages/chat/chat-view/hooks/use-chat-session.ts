import { useEffect } from 'react'
import { chatListStore, type StoreSession } from '../../store'
import { useStoreSession } from '../../hooks/use-store-session'
import { useChatList } from '../../chat-list/hooks/use-chat-list'

export function isTargetChat(target: StoreSession, other: StoreSession) {
  return target && other && target.id === other.id && target.type === other.type
}

export function useChatSession() {
  const chatList = useChatList()
  const session = useStoreSession()
  const target = chatList.find((c) => isTargetChat(c, session))

  useEffect(() => {
    if (!target && chatList[0]) {
      const target = chatList[0]
      target.unreadCount = 0
      target.chatting = true
      chatListStore.mutate.session = { id: target.id, type: target.type }
    }
  }, [target, chatList])

  return target ?? chatList[0]
}
