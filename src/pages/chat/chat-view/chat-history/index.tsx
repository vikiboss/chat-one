import { useTab } from '@/pages/hooks/use-tab'
import { useUserInfo } from '@/store'
import { useChatSession } from '../hooks/use-chat-session'
import { useListAnimation } from '@/hooks/use-list-animation'
import { useScroll, useUpdateEffect } from '@shined/react-use'
import { blackList } from '@/utils/blacklist'
import { ChatAvatar } from '@/components/chat-avatar'
import { cn } from '@/utils'
import { qqFaceList } from '@/utils/qq-face'

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
        const singleItem = ['mface', 'record', 'video', 'json', 'xml'] as const

        for (const item of singleItem) {
          const single = msg.message.find((e) => e.type === item)

          if (single) {
            msg.message = [single]
            break
          }
        }

        const avatar = !lastMessageIsSameUser ? (
          <ChatAvatar rounded item={{ type: 'private', id: msg.user_id }} />
        ) : (
          <div className="w-8" />
        )

        const card = 'card' in msg.sender ? msg.sender.card : ''
        const name = card ? `${card} (${msg.sender.nickname})` : msg.sender.nickname

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
                    'py-2 px-3 rounded-2  transition-all inline-block',
                    isSelf
                      ? 'rounded-se-0.5 bg-amber/12 group-hover:bg-amber/12'
                      : 'rounded-ss-0.5 bg-zinc/6 group-hover:bg-zinc/12',
                  )}
                >
                  {msg.message.map((e: any, idx) => {
                    switch (e.type) {
                      case 'text':
                        return <span key={`${e.type}-${idx}`}>{e.data.text}</span>

                      case 'image':
                        return (
                          <img key={`${e.type}-${idx}`} className="h-20 rounded" src={e.data.url} alt="chat-image" />
                        )

                      case 'at':
                        return (
                          <div
                            key={`${e.type}-${idx}`}
                            className="inline-flex flex-center gap-1 mx-1 bg-blue/20 text-blue-5 px-1 py-0.25 rounded"
                          >
                            <span>@</span>
                            <ChatAvatar size="size-4" item={{ type: 'private', id: e.data.qq }} />
                          </div>
                        )

                      case 'face': {
                        const target = qqFaceList.find((f) => f.id === +e.data.id)
                        const isNormalFace = !!target

                        return isNormalFace ? (
                          <img
                            key={`${e.type}-${idx}`}
                            className="h-5"
                            src={`/face/s${e.data.id}.${target.format}`}
                            alt="face"
                          />
                        ) : (
                          `[超级表情, id: ${e.data.id}]`
                        )
                      }

                      case 'json':
                        return (
                          <span key={`${e.type}-${idx}`}>
                            {JSON.parse(e.data.data).prompt || JSON.stringify(e.data)}
                          </span>
                        )

                      case 'reply':
                        return <span key={`${e.type}-${idx}`}>[回复]</span>

                      case 'forward':
                        return <span key={`${e.type}-${idx}`}>[和并转发]</span>

                      case 'record':
                        return (
                          <audio key={`${e.type}-${idx}`} controls autoPlay={false}>
                            <track kind="captions" />
                            <source src={e.data.url} type='audio/mp3; codecs="mp3"' />
                          </audio>
                        )

                      case 'mface':
                        return e.data.url ? (
                          <img key={`${e.type}-${idx}`} className="h-24 rounded" src={e.data.url} alt="m-face-image" />
                        ) : (
                          <span key={`${e.type}-${idx}`}>[mface:{e.data.id}]</span>
                        )

                      default:
                        return <span key={`${e.type}-${idx}`}>{JSON.stringify(e)}</span>
                    }
                  })}
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
