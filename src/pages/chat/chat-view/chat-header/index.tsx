import { ChatAvatar } from '@/components/chat-avatar'
import { useChatSession } from '../hooks/use-chat-session'
import { homeStore } from '@/pages/store'

export function ChatHeader() {
  const session = useChatSession()
  const isGroup = session && session.type === 'group'
  const tip = isGroup ? ` (${session.info.member_count}/${session.info.max_member_count})` : ''

  return (
    <div className="flex rounded justify-between items-center gap-2 w-full p-2 bg-white/48 dark:bg-zinc-3/12">
      <div className="flex justify-between items-center gap-2">
        <ChatAvatar item={session} />
        <div>
          <span>{session.name}</span>
          <span>{tip}</span>
        </div>
      </div>
      <div
        onClick={() => {
          const target = homeStore.mutate.contactList.find((item) => item.id === session.id)

          if (target) {
            target.chatting = false
          }
        }}
        className="grid place-content-center hover:bg-zinc-2/12 rounded-full p-1.6 cursor-pointer"
      >
        <span className="i-mdi-close" />
      </div>
    </div>
  )
}
