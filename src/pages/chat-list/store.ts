import { create } from '@shined/reactive'

import type { OneBot } from '@/hooks/use-onebot-api'

export const chatListStore = create({
  session: undefined as
    | undefined
    | {
        id: number
        type: OneBot.ContactType
      },
})
