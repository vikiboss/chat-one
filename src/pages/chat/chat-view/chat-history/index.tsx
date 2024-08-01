import { useTab } from '@/pages/hooks/use-tab'
import { useUserInfo } from '@/store'
import { useChatSession } from '../hooks/use-chat-session'
import { useListAnimation } from '@/hooks/use-list-animation'
import { useScroll, useUpdateEffect } from '@shined/react-use'
import { blackList } from '@/utils/blacklist'
import { MsgRenderer } from './msg-renderer'
import { ChatAvatar } from '@/components/chat-avatar'
import { cn } from '@/utils'

import type { OneBot } from '@/hooks/use-onebot-api'

export function ChatHistory() {
  const tab = useTab()
  const info = useUserInfo()
  const session = useChatSession()
  const historyAnimationRef = useListAnimation()
  const scroll = useScroll(() => '#chat-history', { behavior: 'smooth' })

  useUpdateEffect(() => {
    if (tab.value === 'chat' && (scroll.arrivedState.bottom || !scroll.isScrolling)) {
      scroll.scrollToEnd('y')
    }
  }, [session.history, tab.value])

  useUpdateEffect(() => {
    if (tab.value === 'chat') {
      scroll.scrollToEnd('y')
    }
  }, [session.id, session.type, tab.value])

  return (
    <div id="chat-history" ref={historyAnimationRef} className="w-full h-[calc(100vh-400px)] overflow-scroll">
      {(
        session.history.filter((e) => blackList.some((id) => id !== e.user_id)).slice(-100) as
          | OneBot.GroupMessage[]
          | OneBot.PrivateMessage[]
      ).map((msg) => {
        const lastMessageIsSameUser =
          session.history[session.history.findIndex((e) => e.message_id === msg.message_id) - 1]?.sender.user_id ===
          msg.sender.user_id

        const isSelf = msg.sender.user_id === info?.user_id

        const avatar = !lastMessageIsSameUser ? (
          <ChatAvatar rounded item={{ type: 'private', id: msg.user_id }} />
        ) : (
          <div className="w-8" />
        )

        const card = 'card' in msg.sender ? msg.sender.card : ''
        const name = card ? `${card} (${msg.sender.nickname})` : msg.sender.nickname

        const isNoBorder =
          msg.message.some((e) => e.type === 'mface') ||
          (msg.message.length === 1 && ['image', 'record'].some((e) => e === msg.message[0].type))

        return (
          <div
            key={msg.message_id}
            title={new Date(msg.time * 1000).toLocaleString('zh-CN')}
            className={cn('flex w-full gap-2 p-2 group', !lastMessageIsSameUser ? 'py-2' : 'pt-0')}
          >
            {!isSelf && avatar}
            <div className={cn('flex flex-col w-full', isSelf ? 'items-end' : '')}>
              {!lastMessageIsSameUser && (
                <div className={cn('flex items-center gap-1 text-right')}>
                  {!isSelf && <div className="font-bold">{name}</div>}
                  <div className="text-gray/60 text-xs transition-all opacity-0 group-hover:opacity-100">
                    {new Date(msg.time * 1000).toLocaleString('zh-CN')}
                  </div>
                  {isSelf && <div className="font-bold">{name}</div>}
                </div>
              )}
              <pre className={cn('text-wrap mb-0 font-sans', !lastMessageIsSameUser ? 'mt-1' : 'mt-0')}>
                <div
                  className={cn(
                    isNoBorder ? '' : 'py-2 px-3',
                    'rounded-2  transition-all inline-block',
                    isNoBorder
                      ? 'bg-transparent'
                      : isSelf
                        ? 'rounded-se-0.5 bg-amber/12 group-hover:bg-amber/12'
                        : 'rounded-ss-0.5 bg-zinc/6 group-hover:bg-zinc/12',
                  )}
                >
                  <MsgRenderer messages={msg.message} />
                </div>
              </pre>
            </div>
            {isSelf && avatar}
          </div>
        )
      })}
    </div>
  )
}
