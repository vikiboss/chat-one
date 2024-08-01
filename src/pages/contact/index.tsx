import { ChatAvatar } from '@/components/chat-avatar'
import { Button } from '@arco-design/web-react'
import { homeStore } from '../store'
import { useContactList } from './hooks/use-contact-list'

export function Contact() {
  const [friends, groups, list] = useContactList()
  const chatList = list.filter((c) => c.chatting || c.unreadCount > 0)

  return (
    <div>
      <div>
        <h2 className="my-2">Groups</h2>
        <div className="flex flex-col gap-1">
          {groups.map((g) => {
            const isInChat = chatList.find((e) => e.type === 'group' && e.id === g.id)
            return (
              <Button
                key={g.info.group_id}
                size="small"
                status={isInChat ? 'success' : 'default'}
                className="size-full flex items-center gap-2 py-1"
                onClick={() => {
                  const target = homeStore.mutate.contactList.find((e) => e.type === 'group' && e.id === g.id)
                  if (target) target.chatting = !isInChat
                }}
              >
                <span className="w-4">{isInChat ? '-' : '+'}</span>
                <ChatAvatar size="size-6" item={g} />
                <span>{g.name}</span>
              </Button>
            )
          })}
        </div>
      </div>
      <div>
        <h2 className="my-2">Friends</h2>
        <div className="flex flex-col gap-1">
          {friends.map((f) => {
            const isInChat = chatList.find((e) => e.type === 'private' && e.id === f.id)
            return (
              <Button
                key={f.info.user_id}
                size="small"
                status={isInChat ? 'success' : 'default'}
                className="size-full flex items-center gap-2 py-1"
                onClick={() => {
                  const target = homeStore.mutate.contactList.find((e) => e.type === 'private' && e.id === f.id)
                  if (target) target.chatting = !isInChat
                }}
              >
                <span className="w-4">{isInChat ? '-' : '+'}</span>
                <ChatAvatar size="size-6" item={f} />
                <span>{f.name}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
