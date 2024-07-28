import { type OneBot, useOneBotApi } from '@/hooks/use-onebot-api'
import { useMount } from '@shined/react-use'
import { homeStore } from '../../store'

export const useContactList = () => {
  const api = useOneBotApi()

  useMount(async () => {
    if (homeStore.mutate.contactList.length) return

    const { data: gList = [] } = await api.action<{ data: OneBot.GroupInfo[] }>('get_group_list')
    const { data: pList = [] } = await api.action<{ data: OneBot.PrivateInfo[] }>('get_friend_list')

    homeStore.mutate.contactList = [
      ...gList
        .map((e) => ({
          id: e.group_id,
          name: e.group_name,
          type: 'group' as const,
          info: e,
          history: [],
          chatting: false,
          unreadCount: 0,
        }))
        .filter((e, idx, arr) => arr.findIndex((t) => t.id === e.id) === idx),
      ...pList
        .map((e) => ({
          id: e.user_id,
          name: e.nickname,
          type: 'private' as const,
          info: e,
          history: [],
          chatting: false,
          unreadCount: 0,
        }))
        .filter((e, idx, arr) => arr.findIndex((t) => t.id === e.id) === idx),
    ]
  })

  return homeStore.useSnapshot(
    (s) =>
      [
        s.contactList.filter((c) => c.type === 'private'),
        s.contactList.filter((c) => c.type === 'group'),
        s.contactList,
      ] as const,
  )
}
