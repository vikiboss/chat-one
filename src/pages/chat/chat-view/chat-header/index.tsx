import { ChatAvatar } from '@/components/chat-avatar'
import { useChatSession } from '../hooks/use-chat-session'

export function ChatHeader() {
  const session = useChatSession()
  const isGroup = session && session.type === 'group'
  const tip = isGroup ? ` (${session.info.member_count}/${session.info.max_member_count})` : ''

  return (
    <div className="flex rounded items-center gap-2 w-full p-2 bg-zinc-1/12">
      <ChatAvatar item={session} />
      <div>
        <span>{session.name}</span>
        <span>{tip}</span>
      </div>
    </div>
  )
}
