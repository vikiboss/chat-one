import { create } from '@shined/reactive'
import { useReactive } from '@shined/react-use'
import { cqcode } from './utils/cqcode'
import { useOnebotV11ForwardWS } from './hooks/use-onebot-v11-forward-ws'

import type { OneBot } from './hooks/use-onebot-v11-forward-ws'

export function App() {
  const [state, mutate] = useReactive(
    {
      active: undefined as undefined | { type: 'group' | 'private'; id: number },
      groups: [] as any[],
      friends: [] as any[],
      history: [] as (OneBot.GroupMessage | OneBot.PrivateMessage)[],
    },
    { create },
  )

  const api = useOnebotV11ForwardWS(__WS_URL__ ?? '', {
    async onConnected() {
      console.log('WS connection is ready!')

      const gRes = await api.action<{ data: any[] }>('get_group_list')
      mutate.groups.push(...gRes.data)

      const fRes = await api.action<{ data: any[] }>('get_friend_list')
      mutate.friends.push(...fRes.data)
    },
    onMessage(message) {
      console.log(message)
      mutate.history.push(message)
    },
    onDisconnected() {
      console.log('WS connection is closed!')
    },
  })

  return (
    <div className="h-screen w-screen">
      <div>
        <pre>Chat One</pre>
      </div>

      <div className="flex flex-col gap-2 flex-wrap">
        <div className="flex gap-2">
          {state.groups.map((group) => {
            return (
              <button
                key={group.group_id}
                type="button"
                title={group.group_id}
                onClick={() => {
                  mutate.active = { type: 'group', id: group.group_id }
                }}
                className="appearance-none border-none text-xs bg-amber/20 px-2 py-1 rounded hover:bg-amber/36 hover:cursor-pointer"
              >
                {group.group_name}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2 flex-wrap">
          {state.friends.map((friend) => {
            return (
              <button
                type="button"
                key={friend.user_id}
                title={friend.user_id}
                onClick={() => {
                  mutate.active = { type: 'private', id: friend.user_id }
                }}
                className="appearance-none border-none text-xs bg-lime/20 px-2 py-1 rounded hover:bg-lime/36 hover:cursor-pointer"
              >
                {friend.nickname}
              </button>
            )
          })}
        </div>
        <div>Content</div>
      </div>

      <button
        type="button"
        onClick={async () => {
          // const res = await api.action("send_private_msg", {
          // 	user_id: 1141284758,
          // 	message: "Ciallo～(∠·ω< )⌒☆",
          // });

          const res = await api.action('send_group_msg', {
            group_id: 528990803,
            message: 'Ciallo～(∠·ω< )⌒☆',
          })

          console.log(res)
        }}
      >
        {'Ciallo～(∠·ω< )⌒☆'}
      </button>
      <div>Active: {state.active?.type === 'group' ? `[G-${state.active.id}]` : `[F-${state.active?.id}]`}</div>
      <div>
        {state.history
          .filter((e) => {
            if (state.active === undefined) {
              return true
            }
            if (state.active.type === 'group') {
              return 'group_id' in e && e.group_id === state.active.id
            }
            if (state.active.type === 'private') {
              return 'user_id' in e && e.user_id === state.active.id
            }
            return true
          })
          .map((e) => {
            return (
              <div key={e.message_id} className="border border-solid rounded border-amber/36 my-4 px-2 py-1 mx-2">
                <div className="flex gap-2">
                  <div>{'group_id' in e ? `[G-${e.group_id}]` : `[F-${e.user_id}]`}</div>
                  <div>{e.sender.nickname ?? 'Unknown'} </div>
                  <div className="text-gray/60">{new Date(e.time * 1000).toLocaleString('zh-CN')}</div>
                </div>
                <pre className="text-wrap">{cqcode.unescape(e.raw_message)}</pre>
              </div>
            )
          })}
      </div>
    </div>
  )
}
