import { wsApi } from '@/store'
import { uuid } from '@/utils/uuid'

export const onebotBus = createEventBus()

export const useOneBotApi = () => {
  function genRetPromise<Data>(timeout = 12_000) {
    const actionId = uuid()

    return {
      retPromise: new Promise<Data>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error('OneBot WS API Timeout'))
        }, timeout)

        const off = onebotBus.on(`action:${actionId}`, (data: Data) => {
          clearTimeout(timer)
          off()
          resolve(data)
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

function createEventBus() {
  const listeners = new Map<string, Set<(payload: any) => void>>()

  function on(eventName: string, listener: (payload: any) => void) {
    const set = listeners.get(eventName) || new Set()
    set.add(listener)
    listeners.set(eventName, set)
    return () => off(eventName, listener)
  }

  function off(eventName: string, listener: (payload: any) => void) {
    const set = listeners.get(eventName)
    if (!set) return
    set.delete(listener)
    if (set.size === 0) listeners.delete(eventName)
  }

  function emit(eventName: string, data: any) {
    const set = listeners.get(eventName)
    if (!set) return
    for (const listener of set) listener(data)
  }

  return { on, emit }
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
