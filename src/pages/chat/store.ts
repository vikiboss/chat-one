import { create } from '@shined/reactive'

import type { OneBot } from '@/hooks/use-onebot-api'

export type StoreSession = { id: number; type: OneBot.ContactType } | undefined

export const chatListStore = create({
  session: undefined as StoreSession,
})
