import { useListAnimation } from '@/hooks/use-list-animation'
import { cn } from '@/utils'
import { blackList } from '@/utils/blacklist'
import { homeStore } from '@/pages/store'
import { chatListStore } from '../store'
import { ChatAvatar } from '@/components/chat-avatar'
import { useChatList } from './hooks/use-chat-list'
import { useStoreSession } from '../hooks/use-store-session'
import { isTargetChat } from '../chat-view/hooks/use-chat-session'

export function ChatList() {
  const chatList = useChatList()
  const session = useStoreSession()
  const chatListAnimationRef = useListAnimation()

  return (
    <div
      ref={chatListAnimationRef}
      className={cn(
        'pl-0 flex flex-col h-[calc(100vh-260px)] overflow-y-scroll',
        chatList.length === 0 ? 'w-full' : 'w-240px',
      )}
    >
      {chatList.map((item) => {
        const isActive = isTargetChat(item, session)
        const filteredHistory = item.history.filter((e) => blackList.some((id) => e.user_id !== id))
        const lastMessage = filteredHistory[filteredHistory.length - 1]
        const lastMsgName = lastMessage?.sender.nickname ?? 'Unknown'

        const lastMsgText =
          (lastMessage?.message.find((e) => e.type === 'image') ? '[图片]' : '') ||
          (lastMessage?.message.find((e) => e.type === 'mface') ? '[图片表情]' : '') ||
          (lastMessage?.message.find((e) => e.type === 'json') ? '[卡片消息]' : '') ||
          (lastMessage?.message.find((e) => e.type === 'record') ? '[语音消息]' : '') ||
          (lastMessage?.message.find((e) => e.type === 'face') ? '[QQ 表情]' : '') ||
          (lastMessage?.message.find((e) => e.type === 'forward') ? '[合并转发]' : '') ||
          lastMessage?.message.find((e) => e.type === 'text')?.data.text ||
          '[No Message]'

        return (
          <div
            key={item.id + item.type}
            title={item.type === 'group' ? `Group: ${item.name}` : `Private: ${item.name} (${item.info.nickname})`}
            className={cn(
              'relative cursor-pointer dark:hover:bg-zinc-3/12 hover:bg-white/48 w-full flex items-center justify-between gap-2 px-3 py-1 border-0 border-solid border-b-1px border-b-zinc/12 last:border-b-transparent',
              isActive ? 'bg-white/48 dark:bg-zinc-3/12' : 'bg-transparent',
            )}
            onClick={() => {
              const target = homeStore.mutate.contactList.find((c) => c.id === item.id && c.type === item.type)

              if (target) {
                target.unreadCount = 0
                target.chatting = true
              }

              chatListStore.mutate.session = { id: item.id, type: item.type }
            }}
          >
            <div className="flex gap-2 items-center truncate">
              <ChatAvatar item={item} />
              <div className="truncate">
                <div className="text-nowrap truncate">{item.name}</div>
                {lastMessage && (
                  <div className="text-nowrap text-gray/80 dark:text-gray/60 text-xs truncate">
                    {session?.type === 'group' ? `${lastMsgName}: ${lastMsgText}` : lastMsgText}
                  </div>
                )}
              </div>
            </div>
            {item.unreadCount > 0 && (
              <div className="absolute right-2 inline-block font-bold text-amber size-5 text-center">
                {item.unreadCount}
              </div>
            )}
          </div>
        )
      })}
      {chatList.length === 0 && (
        <div className="h-full grid-center">
          <div>No Chat Sessions, Select One from `Contact` Tab.</div>
        </div>
      )}
    </div>
  )
}
