import { useOneBotApi } from '@/hooks/use-onebot-api'
import { useMount } from '@shined/react-use'
import { homeStore } from '../../store'

import type { OneBot } from '@/hooks/use-onebot-api'

let lock = false

export const useContactList = () => {
  const api = useOneBotApi()

  const fetchList = async () => {
    if (lock) return

    lock = true

    const { data: gList = [] } = await api.action<{ data: OneBot.GroupInfo[] }>('get_group_list')
    const { data: pList = [] } = await api.action<{ data: OneBot.PrivateInfo[] }>('get_friend_list')

    homeStore.mutate.contactList = [
      ...gList
        .map((e) => {
          const group = homeStore.mutate.contactList.find((c) => c.type === 'group' && c.id === e.group_id)

          return {
            id: e.group_id,
            name: e.group_name,
            type: 'group' as const,
            info: e,
            history: (group?.history ?? []).slice(-600) as OneBot.GroupMessage[],
            chatting: group?.chatting ?? false,
            unreadCount: group?.unreadCount ?? 0,
          }
        })
        .filter((e, idx, arr) => arr.findIndex((t) => t.id === e.id) === idx),
      ...pList.map((e) => {
        const friend = homeStore.mutate.contactList.find((c) => c.type === 'private' && c.id === e.user_id)
        return {
          id: e.user_id,
          name: e.nickname,
          type: 'private' as const,
          info: e,
          history: (friend?.history ?? []).slice(-600) as OneBot.PrivateMessage[],
          chatting: friend?.chatting ?? false,
          unreadCount: friend?.unreadCount ?? 0,
        }
      }),
    ].sort((a, b) => b.unreadCount - a.unreadCount)

    lock = false
  }

  useMount(fetchList)

  return homeStore.useSnapshot(
    (s) =>
      [
        s.contactList.filter((c) => c.type === 'private'),
        s.contactList.filter((c) => c.type === 'group'),
        s.contactList,
      ] as const,
  )
}
