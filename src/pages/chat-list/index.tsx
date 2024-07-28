import { cn } from '@/utils'
import { toast } from 'react-hot-toast'
import { useChatList } from './hooks/use-chat-list'
import { useChatSession } from './hooks/use-chat-session'
import { chatListStore } from './store'
import { Avatar } from '@/components/avatar'
import { useRef } from 'react'
import { useAsyncFn, useControlledComponent, useUpdateEffect } from '@shined/react-use'
import { Button, Input } from '@arco-design/web-react'
import { homeStore } from '../store'
import { useOneBotApi } from '@/hooks/use-onebot-api'
import { useUserInfo } from '@/store'

export function ChatList() {
  const api = useOneBotApi()
  const list = useChatList()
  const info = useUserInfo()
  const ref = useRef<HTMLDivElement>(null)
  const session = useChatSession()
  const msgInput = useControlledComponent('')

  useUpdateEffect(() => {
    ref.current?.scrollTo(0, ref.current.scrollHeight)
  }, [session])

  const sendMsg = useAsyncFn(async () => {
    if (!msgInput.value) {
      toast.error('Message cannot be empty')
      return
    }
    const target = homeStore.mutate.contactList.find((c) => c.id === session.id && c.type === session.type)
    if (!target) return

    const commonMsg = {
      message_id: Date.now(),
      user_id: info?.user_id ?? 0,
      sender: {
        user_id: info?.user_id ?? 0,
        nickname: info?.nickname ?? 'Me',
      },
      time: Date.now() / 1000,
      message: [{ type: 'text', data: { text: msgInput.value } }] as never[],
      post_type: 'message',
      self_id: 0,
      raw_message: msgInput.value,
      font: 0,
    } as const

    if (session.type === 'group') {
      await api.action('send_group_msg', {
        group_id: session.id,
        message: msgInput.value,
      })

      if (target.type === 'group') {
        target.history.push({
          ...commonMsg,
          group_id: session.id,
          anonymous: null,
          message_type: 'group',
          sub_type: 'normal',
        })
      }
    } else {
      await api.action('send_private_msg', {
        user_id: session.id,
        message: msgInput.value,
      })

      if (target.type === 'private') {
        target.history.push({
          ...commonMsg,
          sender: { user_id: info?.user_id ?? 0, nickname: info?.nickname ?? 'Me' },
          message_type: 'private',
          sub_type: 'friend',
        })
      }
    }

    msgInput.setValue('')

    homeStore.mutate.contactList.splice(homeStore.mutate.contactList.indexOf(target), 1)
    homeStore.mutate.contactList.unshift(target)
  })

  return (
    <div className="flex gap-2">
      <div className="pl-0 flex flex-col w-240px h-[calc(100vh-260px)] overflow-y-scroll">
        {list.map((item) => {
          const isActive = item.id === session.id && item.type === session.type
          const lastMessage = item.history[item.history.length - 1]

          return (
            <div
              key={item.id + item.type}
              title={item.type === 'group' ? `Group: ${item.name}` : `Private: ${item.name} (${item.info.nickname})`}
              className={cn(
                'cursor-pointer hover:bg-zinc-3/12 w-full flex items-center justify-between gap-2 px-3 py-1 border-0 border-solid border-b-1px border-b-zinc/12 last:border-b-transparent',
                isActive ? 'bg-zinc-3/12' : 'bg-transparent',
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
              <div className="flex gap-2 items-center">
                <Avatar item={item} />
                <div className="truncate">
                  <div className="text-nowrap truncate">{item.name}</div>
                  <div className="text-gray/60 text-xs">
                    {lastMessage ? `${lastMessage?.sender.nickname}: ${lastMessage.raw_message}` : '[No message yet]'}
                  </div>
                </div>
              </div>
              {item.unreadCount > 0 && (
                <div className="inline-block font-bold text-amber size-5 text-center">{item.unreadCount}</div>
              )}
            </div>
          )
        })}
        {list.length === 0 && <li className="h-full grid-center">No Chat Session</li>}
      </div>

      <div className="flex-1 overflow-hidden">
        {session ? (
          <>
            <div className="flex flex-col flex-1">
              <div className="flex rounded items-center gap-2 w-full p-2 bg-zinc-1/12">
                <Avatar item={session} />
                <div>
                  {session.name}
                  {session.type === 'group' ? ` (${session.info.member_count}/${session.info.max_member_count})` : ''}
                </div>
              </div>
              <div ref={ref} className="w-full h-[calc(100vh-358px)] w-full overflow-scroll my-2">
                {session.history.map((msg) => {
                  const isSelf = msg.sender.user_id === info?.user_id

                  return (
                    <div key={msg.message_id} className="flex w-full gap-2 p-2">
                      {!isSelf && <Avatar rounded item={{ type: 'private', id: msg.user_id }} />}
                      <div className={cn('flex flex-col w-full', isSelf ? 'items-end' : '')}>
                        <div className={cn('flex items-center gap-1 text-right')}>
                          {!isSelf && <div className="font-bold">{msg.sender.nickname}</div>}
                          <div className="text-gray/60 text-xs">
                            {new Date(msg.time * 1000).toLocaleString('zh-CN')}
                          </div>
                          {isSelf && <div className="font-bold">{msg.sender.nickname}</div>}
                        </div>
                        <pre className="text-wrap mt-1 mb-0 font-sans">
                          {msg.message.map((e: any, idx) => {
                            switch (e.type) {
                              case 'text':
                                return <span key={`${e.type}-${idx}`}>{e.data.text}</span>
                              case 'image':
                                return (
                                  <img
                                    key={`${e.type}-${idx}`}
                                    className="w-20 rounded"
                                    src={e.data.url}
                                    alt="chat-image"
                                  />
                                )
                              case 'at':
                                return (
                                  <div
                                    key={`${e.type}-${idx}`}
                                    className="inline-flex flex-center gap-1 mx-1 bg-blue/20 text-blue-5 px-1 py-0.5 rounded"
                                  >
                                    <span>@</span>
                                    <Avatar size="size-4" item={{ type: 'private', id: e.data.qq }} />
                                  </div>
                                )
                              case 'face':
                                return (
                                  <img
                                    key={`${e.type}-${idx}`}
                                    className="h-5"
                                    src={`/face/s${e.data.id}.gif`}
                                    alt="face"
                                  />
                                )
                              case 'json':
                                return <span key={`${e.type}-${idx}`}>{JSON.parse(e.data.data).prompt}</span>
                              case 'reply':
                                return <span key={`${e.type}-${idx}`}>[reply:{e.data.id}]</span>
                              case 'mface':
                                return e.data.url ? (
                                  <img
                                    key={`${e.type}-${idx}`}
                                    className="h-24 rounded"
                                    src={e.data.url}
                                    alt="m-face-image"
                                  />
                                ) : (
                                  <span key={`${e.type}-${idx}`}>[mface:{e.data.id}]</span>
                                )
                              default:
                                return <span key={`${e.type}-${idx}`}>{JSON.stringify(e)}</span>
                            }
                          })}
                        </pre>
                      </div>
                      {isSelf && <Avatar rounded item={{ type: 'private', id: msg.user_id }} />}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="bottom-0 w-full flex items-center gap-2">
              <Input {...msgInput.props} disabled={sendMsg.loading} onPressEnter={sendMsg.run} />
              <Button onClick={sendMsg.run} loading={sendMsg.loading} className="flex items-center">
                <span className="i-mdi-send" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 grid-center h-full">
            <div>Place select a session on the left</div>
          </div>
        )}
      </div>
    </div>
  )
}
