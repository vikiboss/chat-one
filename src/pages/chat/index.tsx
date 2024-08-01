import { ChatList } from './chat-list'
import { useChatList } from './chat-list/hooks/use-chat-list'
import { ChatView } from './chat-view'

export function Chat() {
  const isChatListEmpty = useChatList().length === 0

  return (
    <div className="flex gap-2">
      <ChatList />
      {!isChatListEmpty && <ChatView />}
    </div>
  )
}
