import { create } from '@shined/reactive'

import type { OneBot } from '@/hooks/use-onebot-api'

export type ContactItem = {
  id: number
  name: string
  chatting: boolean
  unreadCount: number
} & (
  | {
      type: 'private'
      info: OneBot.PrivateInfo
      history: OneBot.PrivateMessage[]
    }
  | {
      type: 'group'
      info: OneBot.GroupInfo
      history: OneBot.GroupMessage[]
    }
)

export const homeStore = create({
  tab: (location.pathname.replace('/', '') || 'chat') as 'chat' | 'contact' | 'setting',
  contactList: [] as ContactItem[],
})
