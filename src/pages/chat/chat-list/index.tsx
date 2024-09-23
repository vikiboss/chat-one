import { useListAnimation } from '@/hooks/use-list-animation'
import { cn } from '@/utils'
import { blackList } from '@/utils/blacklist'
import { homeStore } from '@/pages/store'
import { chatListStore } from '../store'
import { ChatAvatar } from '@/components/chat-avatar'
import { useChatList } from './hooks/use-chat-list'
import { useStoreSession } from '../hooks/use-store-session'
import { isTargetChat } from '../chat-view/hooks/use-chat-session'
import { useTimeAgo } from '@shined/react-use'

export function ChatList() {
  const chatList = useChatList()
  const session = useStoreSession()
  const chatListAnimationRef = useListAnimation()

  return (
    <div
      ref={chatListAnimationRef}
      className={cn('pl-0 flex flex-col h-full overflow-y-scroll', chatList.length === 0 ? 'w-full' : 'w-240px')}
    >
      {chatList.map((item) => {
        const isActive = isTargetChat(item, session)
        const filteredHistory = item.history.filter((e) => blackList.some((id) => e.user_id !== id))
        const lastMessage = filteredHistory[filteredHistory.length - 1]
        const lastMsgName = lastMessage?.sender.nickname ?? 'Unknown'
        const lastMsgText = lastMessage.raw_message || '[no message]'

        function LastMsgTime() {
          if (!lastMessage) return null
          return (
            <div className="text-xs text-gray/60">
              {useTimeAgo(new Date(lastMessage.time * 1000), {
                messages: {
                  justNow: '刚刚',
                  past: (n) => (n.match(/\d/) ? `${n}前` : n),
                  future: (n) => (n.match(/\d/) ? `${n}后` : n),
                  month: (n, past) => (n === 1 ? (past ? '上个月' : '下个月') : `${n} 个月`),
                  year: (n, past) => (n === 1 ? (past ? '去年' : '明年') : `${n} 年`),
                  day: (n, past) => (n === 1 ? (past ? '昨天' : '明天') : `${n} 天`),
                  week: (n, past) => (n === 1 ? (past ? '上周' : '下周') : `${n} 周`),
                  hour: (n) => `${n} 小时`,
                  minute: (n) => `${n} 分钟`,
                  second: (n) => `${n} 秒`,
                  invalid: '',
                },
              })}
            </div>
          )
        }

        return (
          <div
            key={item.id + item.type}
            title={item.type === 'group' ? `Group: ${item.name}` : `Private: ${item.name} (${item.info.nickname})`}
            className="border-0 border-solid border-b-1px border-b-zinc/12 last:border-b-transparent"
          >
            <div
              className={cn(
                'relative rounded cursor-pointer dark:hover:bg-zinc-3/12 hover:bg-white/48 w-full flex items-center justify-between gap-2 px-3 py-1',
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
              <div className="flex gap-2 items-center truncate w-full">
                <ChatAvatar item={item} />
                <div className="truncate w-full">
                  <div className="text-nowrap truncate">{item.name}</div>
                  {lastMessage && (
                    <div className="flex items-center justify-between gap-1 truncate w-full">
                      <div className="text-nowrap text-gray/80 dark:text-gray/60 text-xs truncate">
                        {item?.type === 'group' ? `${lastMsgName}: ${lastMsgText}` : lastMsgText}
                      </div>
                      <LastMsgTime />
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
