import { useTab } from '@/pages/hooks/use-tab'
import { useUserInfo } from '@/store'
import { useChatSession } from '../hooks/use-chat-session'
import { useListAnimation } from '@/hooks/use-list-animation'
import { useClipboard, useScroll, useUpdateEffect } from '@shined/react-use'
import { blackList } from '@/utils/blacklist'
import { MsgRenderer } from './msg-renderer'
import { ChatAvatar } from '@/components/chat-avatar'
import { cn } from '@/utils'
import { useSendMsg } from '../hooks/use-send-msg'

import type { OneBot } from '@/hooks/use-onebot-api'
import toast from 'react-hot-toast'

export function ChatHistory() {
  const tab = useTab()
  const info = useUserInfo()
  const session = useChatSession()
  const historyAnimationRef = useListAnimation()
  const scroll = useScroll(() => '#chat-history', { behavior: 'smooth' })

  useUpdateEffect(() => {
    if (tab.value === 'chat' && scroll.arrivedState.bottom) {
      scroll.scrollToEnd('y')
    }
  }, [session.history, tab.value])

  useUpdateEffect(() => {
    if (tab.value === 'chat') {
      scroll.scrollToEnd('y')
    }
  }, [session.id, session.type, tab.value])

  const clipboard = useClipboard()

  return (
    <div id="chat-history" ref={historyAnimationRef} className="flex-1 w-full overflow-scroll">
      {(
        session.history.filter((e) => blackList.some((id) => id !== e.user_id)).slice(-160) as
          | OneBot.GroupMessage[]
          | OneBot.PrivateMessage[]
      ).map((msg) => {
        const lastMessageIsSameUser =
          session.history[session.history.findIndex((e) => e.message_id === msg.message_id) - 1]?.sender.user_id ===
          msg.sender.user_id

        const isSelf = msg.sender.user_id === info?.user_id

        const avatar = !lastMessageIsSameUser ? (
          <ChatAvatar
            onClick={() => {
              clipboard.copy(msg.sender.user_id.toString())
              toast.success('Uin copied to clipboard')
            }}
            rounded
            item={{ type: 'private', id: msg.user_id }}
          />
        ) : (
          <div className="w-8" />
        )

        function EchoBtn() {
          const { sendMsgFn } = useSendMsg()

          return (
            <div
              onClick={async () => {
                const targetMsg = structuredClone(msg.message)

                for (const item of targetMsg) {
                  if (item.type === 'image') {
                    item.data.url = item.data.url?.replace('http:', 'https:') ?? ''

                    if (item.data.url?.includes('multimedia')) {
                      item.data.url = item.data.url.replace('multimedia.nt.qq.com.cn', 'c2cpicdw.qpic.cn')
                      item.data.url = item.data.url.replace('&spec=0', '')
                      item.data.url += '&spec=0'
                    }
                  }
                }

                await sendMsgFn.run(session.type, session.id, [...targetMsg])
              }}
              className={cn(
                'transition-all cursor-pointer grid place-content-center text-[10px] size-5 rounded-full bg-blue-5/20 hover:bg-blue-5/36 text-white mb-1',
                sendMsgFn.loading ? 'cursor-not-allowed opacity-60' : 'group-hover:opacity-100 opacity-0',
              )}
            >
              <span className={cn(sendMsgFn.loading ? 'i-mdi-loading animate-spin' : 'i-mdi-plus')} />
            </div>
          )
        }

        const card = 'card' in msg.sender ? msg.sender.card : ''
        const name = card ? `${card} (${msg.sender.nickname})` : msg.sender.nickname

        const isNoBorder =
          msg.message.some((e) => e.type === 'mface') ||
          (msg.message.length === 1 && ['image', 'video', 'record'].some((e) => e === msg.message[0].type))

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
              <div className={cn('flex gap-2 items-end w-full', isSelf ? 'justify-end' : '')}>
                {isSelf && <EchoBtn />}
                <pre
                  className={cn(
                    'max-w-4/5 text-wrap mb-0 font-sans break-all',
                    !lastMessageIsSameUser ? 'mt-1' : 'mt-0',
                  )}
                >
                  <div
                    className={cn(
                      'rounded-2 transition-all inline-block',
                      isSelf ? 'rounded-se-0.5' : 'rounded-ss-0.5',
                      isNoBorder ? '' : 'py-2 px-3',
                      isNoBorder
                        ? 'bg-transparent'
                        : isSelf
                          ? 'bg-amber/12 group-hover:bg-amber/18'
                          : 'bg-zinc/6 group-hover:bg-zinc/12',
                    )}
                  >
                    <MsgRenderer messages={msg.message} />
                  </div>
                </pre>
                {!isSelf && <EchoBtn />}
              </div>
            </div>
            {isSelf && avatar}
          </div>
        )
      })}
    </div>
  )
}
