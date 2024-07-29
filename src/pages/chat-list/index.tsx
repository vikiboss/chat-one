import { Avatar } from '@/components/avatar'
import { useOneBotApi } from '@/hooks/use-onebot-api'
import { useUserInfo } from '@/store'
import { cn } from '@/utils'
import { Button, Input } from '@arco-design/web-react'
import { useAsyncFn, useControlledComponent, useScroll, useUpdateLayoutEffect } from '@shined/react-use'
import { toast } from 'react-hot-toast'
import { homeStore } from '../store'
import { useChatSession } from './hooks/use-chat-session'
import { chatListStore } from './store'
import { useTab } from '../hooks/use-tab'
import { useListAnimation } from '@/hooks/use-list-animation'

export function ChatList() {
  const tab = useTab()
  const api = useOneBotApi()
  const info = useUserInfo()
  const [session, list] = useChatSession()
  const msgInput = useControlledComponent('')
  const chatListAnimationRef = useListAnimation()
  const historyAnimationRef = useListAnimation()
  const scroll = useScroll(() => '#chat-history', { behavior: 'smooth' })

  useUpdateLayoutEffect(() => {
    if (tab.value === 'chat') {
      scroll.scrollToEnd('y')
    }
  }, [session, tab.value])

  const sendMsg = useAsyncFn(async () => {
    if (!msgInput.value) {
      toast.error('Message cannot be empty')
      return
    }

    const target = homeStore.mutate.contactList.find((c) => c.id === session.id && c.type === session.type)

    if (!target) return

    const commonMsg = {
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
      const { data } = await api.action<{ data: { message_id: number } }>('send_group_msg', {
        group_id: session.id,
        message: msgInput.value,
      })

      if (target.type === 'group') {
        target.history.push({
          ...commonMsg,
          message_id: data?.message_id ?? Date.now(),
          group_id: session.id,
          anonymous: null,
          message_type: 'group',
          sub_type: 'normal',
        })
      }
    } else {
      const { data } = await api.action<{ data: { message_id: number } }>('send_private_msg', {
        user_id: session.id,
        message: msgInput.value,
      })

      if (target.type === 'private') {
        target.history.push({
          ...commonMsg,
          message_id: data?.message_id ?? Date.now(),
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
      <div
        ref={chatListAnimationRef}
        className={cn(
          'pl-0 flex flex-col h-[calc(100vh-260px)] overflow-y-scroll',
          list.length === 0 ? 'w-full' : 'w-240px',
        )}
      >
        {list.map((item) => {
          const isActive = item.id === session.id && item.type === session.type
          const lastMessage = item.history[item.history.length - 1]

          return (
            <div
              key={item.id + item.type}
              title={item.type === 'group' ? `Group: ${item.name}` : `Private: ${item.name} (${item.info.nickname})`}
              className={cn(
                'relative cursor-pointer hover:bg-zinc-3/12 w-full flex items-center justify-between gap-2 px-3 py-1 border-0 border-solid border-b-1px border-b-zinc/12 last:border-b-transparent',
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
                  <div className="text-nowrap text-gray/60 text-xs truncate">
                    {lastMessage ? `${lastMessage?.sender.nickname}: ${lastMessage.raw_message}` : '[No message yet]'}
                  </div>
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
        {list.length === 0 && (
          <div className="h-full grid-center">
            <div>No Chat Sessions, Select One from `Contact` Tab.</div>
          </div>
        )}
      </div>

      {list.length !== 0 && (
        <div className="flex-1 overflow-hidden">
          {session ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex rounded items-center gap-2 w-full p-2 bg-zinc-1/12">
                  <Avatar item={session} />
                  <div>
                    {session.name}
                    {session.type === 'group' ? ` (${session.info.member_count}/${session.info.max_member_count})` : ''}
                  </div>
                </div>
                <div
                  id="chat-history"
                  ref={historyAnimationRef}
                  className="w-full h-[calc(100vh-358px)] overflow-scroll"
                >
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
                                      className="h-20 rounded"
                                      src={e.data.url}
                                      alt="chat-image"
                                    />
                                  )
                                case 'at':
                                  return (
                                    <div
                                      key={`${e.type}-${idx}`}
                                      className="inline-flex flex-center gap-1 mx-1 bg-blue/20 text-blue-5 px-1 py-0.25 rounded"
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
                <div className="w-full flex items-center gap-2">
                  <Input {...msgInput.props} disabled={sendMsg.loading} onPressEnter={sendMsg.run} />
                  <Button onClick={sendMsg.run} loading={sendMsg.loading} className="flex items-center">
                    <span className="i-mdi-send" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 grid-center h-full">
              <div>Place select a session on the left</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
