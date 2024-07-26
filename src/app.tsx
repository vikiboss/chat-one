import { create } from '@shined/reactive'
import { cn } from './utils'
import { useAsyncFn, useControlledComponent, useKeyStroke, useReactive } from '@shined/react-use'
import { useOnebotV11ForwardWS } from './hooks/use-onebot-v11-forward-ws'

import type { OneBot } from './hooks/use-onebot-v11-forward-ws'

export function App() {
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
        sender: { user_id: 0, nickname: 'Me' },
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
        sender: { user_id: 0, nickname: 'Me' },
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

  const [state, mutate] = useReactive(
    {
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

  const api = useOnebotV11ForwardWS(__WS_URL__ ?? wsInput.value, {
    async onConnected() {
      console.log('WS connection is ready!')

      const gRes = await api.action<{ data: any[] }>('get_group_list')
      mutate.groups.push(...gRes.data)

      const fRes = await api.action<{ data: any[] }>('get_friend_list')
      mutate.friends.push(...fRes.data)
    },
    onMessage(message) {
      console.log(message)
      mutate.history.unshift(message)
    },
    onDisconnected() {
      console.log('WS connection is closed!')
    },
  })

  const histories = state.history.filter((e) => {
    if (state.active === undefined) return false

    if (state.active.type === 'group') {
      return 'group_id' in e && e.group_id === state.active.id
    }

    if (state.active.type === 'private') {
      return 'user_id' in e && e.user_id === state.active.id
    }

    return true
  })

  return (
    <div className="p-2 h-screen w-screen relative">
      <div>
        <div className="flex gap-2 my-2">
          <div>Chat One, input WS:</div>
          <input disabled={send.loading} {...wsInput.props} type="text" />
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
        <div className="flex gap-2">
          {state.groups.map((group) => {
            return (
              <button
                key={group.group_id}
                type="button"
                title={group.group_id}
                onClick={() => {
                  mutate.active = { type: 'group', id: group.group_id, name: group.group_name }
                }}
                className={cn(
                  'appearance-none border-none text-xs bg-amber/20 px-2 py-1 rounded hover:bg-amber/36 hover:cursor-pointer',
                  state.active?.type === 'group' && state.active.id === group.group_id && 'bg-amber/36',
                )}
              >
                {group.group_name}
              </button>
            )
          })}
        </div>
        <h3 className="my-2">Friends</h3>
        <div className="flex gap-2 flex-wrap">
          {state.friends.map((friend) => {
            return (
              <button
                type="button"
                key={friend.user_id}
                title={friend.user_id}
                onClick={() => {
                  mutate.active = { type: 'private', id: friend.user_id, name: friend.nickname }
                }}
                className={cn(
                  'appearance-none border-none text-xs bg-lime/20 px-2 py-1 rounded hover:bg-lime/36 hover:cursor-pointer',
                  state.active?.type === 'group' && state.active.id === friend.group_id && 'bg-lime/36',
                )}
              >
                {friend.nickname}
              </button>
            )
          })}
        </div>
      </div>

      <h3 className="my-2">
        {state.active
          ? state.active.type === 'group'
            ? `Group: ${state.active.name}`
            : `Private: ${state.active.name}`
          : 'No Active'}
      </h3>

      <div>
        {histories.map((e) => {
          return (
            <div key={e.message_id} className="border border-solid rounded border-amber/36 my-4 px-2 py-1 mx-2">
              <div className="flex gap-2">
                <div>{'group_id' in e ? `[G-${e.group_id}]` : `[F-${e.user_id}]`}</div>
                <div>{e.sender.nickname ?? 'Unknown'} </div>
                <div className="text-gray/60">{new Date(e.time * 1000).toLocaleString('zh-CN')}</div>
              </div>
              <pre className="text-wrap">
                {e.message.map((e: any, idx) => {
                  switch (e.type) {
                    case 'text':
                      return <span key={idx + e}>{e.data.text}</span>
                    case 'image':
                      return <img key={idx + e} className="h-24 rounded" src={e.data.url} alt="chat-image" />
                    case 'at':
                      return (
                        <span key={idx + e} className="mx-1 rounded bg-blue/20 text-blue-5">
                          @{e.data.text}
                        </span>
                      )
                    case 'face':
                      return (
                        <span key={idx + e}>
                          [face:{e.data.id}:{e.data.text}]
                        </span>
                      )
                    case 'reply':
                      return `[Reply] ${e.data.message_id}`
                    case 'record':
                      return `[Record] ${e.data.file}`
                    case 'video':
                      return `[Video] ${e.data.url}`
                    case 'audio':
                      return `[Audio] ${e.data.url}`
                    case 'file':
                      return `[File] ${e.data.url}`
                    case 'share':
                      return `[Share] ${e.data.url}`
                    case 'location':
                      return `[Location] ${e.data.lat}, ${e.data.lon}`
                    case 'music':
                      return `[Music] ${e.data.url}`
                    case 'contact':
                      return `[Contact] ${e.data.user_id}`
                    case 'dice':
                      return `[Dice] ${e.data.type}`
                    case 'rps':
                      return `[RPS] ${e.data.type}`
                    case 'xml':
                      return `[XML] ${e.data.data}`
                    case 'json':
                      return `[JSON] ${e.data.data}`
                    case 'app':
                      return `[App] ${e.data.data}`
                    case 'node':
                      return `[Node] ${e.data.data}`
                    case 'forward':
                      return `[Forward] ${e.data.message_id}`
                  }
                })}
              </pre>
            </div>
          )
        })}
      </div>

      <div className="fixed absolute bottom-4 w-full flex">
        <input id="msg-input" {...input.props} type="text" className="text-lg mx-4 flex-1" />
      </div>
    </div>
  )
}
