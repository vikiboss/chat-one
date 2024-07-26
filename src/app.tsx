import { create } from '@shined/reactive'
import { cn } from './utils'
import { useAsyncFn, useControlledComponent, useKeyStroke, useReactive } from '@shined/react-use'
import { useOnebotV11ForwardWS } from './hooks/use-onebot-v11-forward-ws'

import type { OneBot } from './hooks/use-onebot-v11-forward-ws'

export function App() {
  const [state, mutate] = useReactive(
    {
      info: undefined as
        | undefined
        | {
            user_id: number
            nickname: string
          },
      url: __WS_URL__ || '',
      active: undefined as
        | undefined
        | {
            type: 'group' | 'private'
            id: number
            name: string
          },
      groups: [] as any[],
      friends: [] as any[],
      history: [] as (OneBot.GroupMessage | OneBot.PrivateMessage)[],
    },
    { create },
  )

  const wsInput = useControlledComponent('')
  const input = useControlledComponent('')

  const send = useAsyncFn(async () => {
    if (input.value.trim() === '') return
    if (state.active === undefined) return

    if (state.active.type === 'group') {
      await api.action('send_group_msg', {
        group_id: state.active.id,
        message: input.value,
      })

      mutate.history.unshift({
        message_id: Date.now(),
        group_id: state.active.id,
        sender: { user_id: state.info?.user_id ?? 0, nickname: state.info?.nickname ?? 'Me' },
        time: Date.now() / 1000,
        message: [{ type: 'text', data: { text: input.value } }],
        anonymous: null,
        post_type: 'message',
        message_type: 'group',
        self_id: 0,
        sub_type: 'normal',
        user_id: 0,
        raw_message: input.value,
        font: 0,
      })
    }

    if (state.active.type === 'private') {
      await api.action('send_private_msg', {
        user_id: state.active.id,
        message: input.value,
      })

      mutate.history.unshift({
        message_id: Date.now(),
        user_id: state.active.id,
        sender: { user_id: state.info?.user_id ?? 0, nickname: state.info?.nickname ?? 'Me' },
        time: Date.now() / 1000,
        message: [{ type: 'text', data: { text: input.value } }],
        anonymous: null,
        post_type: 'message',
        message_type: 'private',
        self_id: 0,
        sub_type: 'friend',
        raw_message: input.value,
        font: 0,
      })
    }

    input.setValue('')
  })

  useKeyStroke('Enter', send.run, { target: '#msg-input' })

  const api = useOnebotV11ForwardWS(state.url, {
    async onConnected() {
      console.log('WS connection is ready!')

      const iRes = await api.action<{ data: any }>('get_login_info')
      mutate.info = iRes.data

      const gRes = await api.action<{ data: any[] }>('get_group_list')
      mutate.groups = gRes.data

      const fRes = await api.action<{ data: any[] }>('get_friend_list')
      mutate.friends = fRes.data
    },
    onMessage(message) {
      mutate.history.unshift(message)
    },
    onDisconnected() {
      console.log('WS connection is closed!')
    },
  })

  const histories = state.history.filter((e) => {
    if (state.active === undefined) return true

    if (state.active.type === 'group') {
      return 'group_id' in e && e.group_id === state.active.id
    }

    if (state.active.type === 'private') {
      return !('group_id' in e) && e.user_id === state.active.id
    }

    return true
  })

  return (
    <div className="p-2 h-screen w-screen relative">
      <div>
        <div className="flex gap-2 my-2">
          <div>Chat One, input WS:</div>
          <input disabled={send.loading} {...wsInput.props} type="text" />
          <button
            type="button"
            onClick={() => {
              mutate.url = wsInput.value
            }}
          >
            connect
          </button>
          {state.info ? (
            <div className="flex gap-1 items-center">
              <img
                className="h-5 w-5 rounded"
                src={`https://avatar.viki.moe?qq=${state.info.user_id}&size=100`}
                alt="avatar"
              />
              <div className="text-xs">
                {state.info.nickname ?? '-'} ({state.info.user_id ?? '-'})
              </div>
            </div>
          ) : (
            <div>Not Logged</div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              mutate.active = undefined
            }}
          >
            show all
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-wrap">
        <h3 className="my-2">Group</h3>
        <div className="flex gap-2 flex-wrap">
          {state.groups.map((group) => {
            return (
              <div
                key={group.group_id}
                onClick={() => {
                  mutate.active = { type: 'group', id: group.group_id, name: group.group_name }
                }}
                className={cn(
                  'flex gap-1 items-center border-solid border-amber/20 pr-1 rounded hover:bg-amber/20 hover:cursor-pointer',
                  state.active?.type === 'group' && state.active.id === group.group_id && 'bg-amber/20',
                )}
              >
                <img
                  className="h-5 w-5 rounded"
                  src={`https://p.qlogo.cn/gh/${group.group_id}/${group.group_id}/100`}
                  alt="avatar"
                />
                <div title={group.group_id} className={cn('text-xs')}>
                  {group.group_name}
                </div>
              </div>
            )
          })}
        </div>
        <h3 className="my-2">Friends</h3>
        <div className="flex gap-2 flex-wrap">
          {state.friends.map((friend) => {
            return (
              <div
                key={friend.user_id}
                onClick={() => {
                  mutate.active = { type: 'private', id: friend.user_id, name: friend.nickname }
                }}
                className={cn(
                  'flex gap-1 items-center border-solid border-lime/20 pr-1 rounded hover:bg-lime/20 hover:cursor-pointer',
                  state.active?.type === 'private' && state.active.id === friend.user_id && 'bg-lime/20',
                )}
              >
                <img
                  className="h-5 w-5 rounded"
                  src={`https://avatar.viki.moe?qq=${friend.user_id}&size=100`}
                  alt="avatar"
                />
                <div title={friend.user_id} className={cn('text-xs')}>
                  {friend.nickname}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <h3 className="my-2">
        {state.active
          ? state.active.type === 'group'
            ? `[Chat: Group] ${state.active.name} (${state.active.id})`
            : `[Chat: Private] ${state.active.name} (${state.active.id})`
          : 'No Active, show all'}
      </h3>

      <div>
        {histories.map((e) => {
          return (
            <div key={e.message_id} className="border border-solid rounded border-amber/20 my-4 px-2 py-1 mx-2">
              <div className="flex items-center gap-1">
                <img
                  className="h-5 w-5 rounded"
                  src={`https://avatar.viki.moe?qq=${e.sender.user_id}&size=100`}
                  alt="avatar"
                />
                <div className="flex text-xs px-1 py-0.5 rounded bg-blue-2/12">{e.sender.nickname ?? 'Unknown'} </div>
                <div className="text-xs text-gray/60">{new Date(e.time * 1000).toLocaleString('zh-CN')}</div>
              </div>
              <pre className="text-wrap mt-1 mb-0">
                {e.message.map((e: any, idx) => {
                  switch (e.type) {
                    case 'text':
                      return <span key={idx + e}>{e.data.text}</span>
                    case 'image':
                      return <img key={idx + e} className="h-24 rounded" src={e.data.url} alt="chat-image" />
                    case 'at':
                      return (
                        <span key={idx + e} className="mx-1 bg-blue/20 text-blue-5 px-2 py-1 rounded">
                          @{e.data.qq}
                        </span>
                      )
                    case 'face':
                      return (
                        <span key={idx + e}>
                          [face:{e.data.id}:{e.data.text}]
                        </span>
                      )
                    default:
                      return (
                        <span>
                          {e.type}: {JSON.stringify(e.data)}
                        </span>
                      )
                  }
                })}
              </pre>
            </div>
          )
        })}
      </div>

      <div className="fixed absolute bottom-0 pb-4 w-full px-4 flex">
        <input id="msg-input" {...input.props} type="text" className="text-lg flex-1" />
      </div>
    </div>
  )
}
