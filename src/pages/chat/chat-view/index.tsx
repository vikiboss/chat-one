import { ChatHeader } from './chat-header'
import { ChatHistory } from './chat-history'
import { MsgInput } from './msg-input'
import { useChatSession } from './hooks/use-chat-session'

export function ChatView() {
  const session = useChatSession()

  return (
    <div className="flex-1 overflow-hidden">
      {session ? (
        <div className="flex flex-col gap-2">
          <ChatHeader />
          <ChatHistory />
          <MsgInput />
        </div>
      ) : (
        <div className="flex-1 grid-center h-full">
          <div>Place select a session on the left</div>
        </div>
      )}
    </div>
  )
}
