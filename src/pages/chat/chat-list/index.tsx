import { cn } from '@/utils'
import { useListAnimation } from '@/hooks/use-list-animation'
import { blackList } from '@/utils/blacklist'
import { homeStore } from '@/pages/store'
import { chatListStore } from '../store'
import { ChatAvatar } from '@/components/chat-avatar'
import { useChatList } from './hooks/use-chat-list'
import { useStoreSession } from '../hooks/use-store-session'
import { isTargetChat } from '../chat-view/hooks/use-chat-session'
import { useTimeAgo, CHINESE_MESSAGES } from '@shined/react-use'

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
        const lastMsgName = lastMessage?.sender?.nickname ?? 'Unknown'
        const lastMsgText = convertMessageToText(lastMessage)

        function LastMsgTime() {
          if (!lastMessage) return null

          return (
            <div className="text-xs text-gray/60">
              {useTimeAgo(lastMessage.time * 1000, { messages: CHINESE_MESSAGES })}
            </div>
          )
        }

        return (
          <div
            key={item.id + item.type}
            title={item.type === 'group' ? `Group: ${item.name}` : `Private: ${item.name} (${item.info?.nickname})`}
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

export const convertMessageToText = (lastMessage: any) => {
  const alt = lastMessage?.raw_message || lastMessage?.alt_message

  if (alt) return alt

  if (!lastMessage?.message) return '[No Message]'

  const messageTypesToText = {
    at: '[@消息]',
    image: '[图片]',
    mface: '[图片表情]',
    json: '[卡片消息]',
    record: '[语音消息]',
    video: '[视频消息]',
    face: '[QQ 表情]',
    forward: '[合并转发]',
  }

  const textParts = lastMessage.message
    .map((msgPart) => {
      // Check each known type and return its text representation if found
      if (messageTypesToText[msgPart.type]) {
        return messageTypesToText[msgPart.type]
      }
      // If a text message, return its content directly
      if (msgPart.type === 'text' && msgPart.data?.text) {
        return msgPart.data.text
      }
      // For any unrecognized type, return nothing
      return ''
    })
    .filter((text) => text.length > 0) // Remove any empty strings

  // Join all parts of the message. If no recognizable parts were found, default to '[No Message]'
  return textParts.length > 0 ? textParts.join(' ') : '[No Message]'
}
