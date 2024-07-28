import { useActiveSession } from './use-active-session'
import { useChatList } from './use-chat-list'
import { chatListStore } from '../store'
import { useEffect } from 'react'

export function useChatSession() {
  const chatList = useChatList()
  const activeSession = useActiveSession()

  const target = chatList.find((c) => c.type === activeSession?.type && c.id === activeSession?.id)

  useEffect(() => {
    if (!target && chatList[0]) {
      chatListStore.mutate.session = {
        id: chatList[0].id,
        type: chatList[0].type,
      }
    }
  }, [target, chatList[0]])

  return target ?? chatList[0]
}
