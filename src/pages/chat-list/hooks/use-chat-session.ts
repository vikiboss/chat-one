import { useActiveSession } from './use-active-session'
import { useChatList } from './use-chat-list'

export function useChatSession() {
  const chatList = useChatList()
  const activeSession = useActiveSession()

  return chatList.find((c) => c.type === activeSession?.type && c.id === activeSession?.id) ?? chatList[0]
}
