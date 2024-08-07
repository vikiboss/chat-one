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

const cache = localStorage.getItem('homeStore')
const initialStore = cache ? JSON.parse(cache ?? '') : undefined

export interface HomeStore {
  tab: 'chat' | 'contact' | 'setting'
  contactList: ContactItem[]
}

export const homeStore = create<HomeStore>(
  initialStore || {
    tab: (location.pathname.replace('/', '') || 'chat') as 'chat' | 'contact' | 'setting',
    contactList: [] as ContactItem[],
  },
)
