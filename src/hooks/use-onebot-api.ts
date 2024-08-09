import { wsApi } from '@/store'
import { uuid } from '@/utils/uuid'
import { useEventBus } from '@shined/react-use'

const actions = new Set()

export const useOneBotApi = () => {
  const bus = useEventBus(Symbol.for('api_ret'))

  function deleteAction(actionId: string) {
    actions.delete(actionId)
    if (actions.size === 0) bus.cleanup()
  }

  function genRetPromise<Data>(timeout = 12_000) {
    const actionId = uuid()
    actions.add(actionId)

    return {
      retPromise: new Promise<Data>((resolve, reject) => {
        const timer = setTimeout(() => {
          deleteAction(actionId)
          reject(new Error('OneBot WS API Timeout'))
        }, timeout)

        bus.on((event, data: Data) => {
          if (event === `action:${actionId}`) {
            deleteAction(actionId)
            clearTimeout(timer)
            resolve(data)
          }
        })
      }),
      actionId,
    }
  }

  const api = {
    action: <Data>(action: string, params: Record<string, unknown> = {}) => {
      const { retPromise, actionId } = genRetPromise<Data>()
      wsApi.instance?.send(JSON.stringify({ action, params, echo: actionId }))
      return retPromise
    },
  }

  return api
}

export namespace OneBot {
  export type ContactType = 'private' | 'group'

  export interface AnonymousInfo {
    id: number
    name: string
    flag: string
  }

  export interface Message {
    time: number
    self_id: number
    post_type: string
    message_type: OneBot.ContactType
    sub_type: string
    message_id: number
    user_id: number
    message: any[]
    raw_message: string
    font: number
  }

  export interface Sender {
    user_id: number
    nickname: string
    sex?: 'male' | 'female' | 'unknown'
    age?: number
  }

  export interface PrivateMessage extends Message {
    sender: Sender
  }

  export interface GroupMessage extends Message {
    group_id: number
    anonymous: AnonymousInfo | null
    sender: Sender & {
      card?: string
      area?: string
      level?: string
      role?: 'owner' | 'admin' | 'member'
      title?: string
    }
  }

  export interface PrivateInfo {
    user_id: number
    nickname: string
  }

  export interface GroupInfo {
    group_id: number
    group_name: string
    member_count: number
    max_member_count: number
  }
}
