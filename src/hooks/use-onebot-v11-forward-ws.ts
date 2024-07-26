import { useCreation, useEventBus } from '@shined/react-use'
import { useWebsocket } from './use-websocket'
import { uuid } from '../utils/uuid'

export interface UseOneBotV11ForwardWSOptions {
  onMessage?: (message: OneBot.GroupMessage | OneBot.PrivateMessage) => void
  onNotice?: (notice: unknown) => void
  onRequest?: (request: unknown) => void
  onMetaEvent?: (metaEvent: unknown) => void
  onWsMessage?: (event: unknown) => void
  onConnected?: () => void
  onDisconnected?: () => void
}

const busKey = Symbol('api_ret')

export function useOnebotV11ForwardWS(url: string, options: UseOneBotV11ForwardWSOptions = {}) {
  const {
    onConnected = () => {},
    onDisconnected = () => {},
    onWsMessage = () => {},
    onMessage = () => {},
    onNotice = () => {},
    onRequest = () => {},
    onMetaEvent = () => {},
  } = options

  const bus = useEventBus(busKey)
  const actions = useCreation(() => new Set())

  const apiWs = useWebsocket(url, {
    onOpen: onConnected,
    onClose: onDisconnected,
    onMessage(message) {
      const msg = JSON.parse(message.data)

      onWsMessage(msg)

      if (msg.echo) {
        bus.emit(`action:${msg.echo}`, msg)
      }

      switch (msg.post_type) {
        case 'message':
          onMessage(msg)
          break
        case 'notice':
          onNotice(msg)
          break
        case 'request':
          onRequest(msg)
          break
        case 'meta_event':
          onMetaEvent(msg)
          break
        default:
          break
      }
    },
  })

  function genRetPromise<Data>() {
    const actionId = uuid()
    actions.add(actionId)

    return {
      retPromise: new Promise<Data>((resolve) => {
        bus.on((event, data: Data) => {
          if (event === `action:${actionId}`) {
            actions.delete(actionId)
            if (actions.size === 0) bus.cleanup()
            resolve(data)
          }
        })
      }),
      actionId,
    }
  }

  const api = useCreation(() => ({
    action: <Data>(action: string, params: Record<string, unknown> = {}) => {
      const { retPromise, actionId } = genRetPromise<Data>()
      apiWs.current?.send(JSON.stringify({ action, params, echo: actionId }))
      return retPromise
    },
    ws: apiWs,
  }))

  return api
}

export namespace OneBot {
  export interface AnonymousInfo {
    id: number
    name: string
    flag: string
  }

  export interface Message {
    time: number
    self_id: number
    post_type: string
    message_type: string
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
      card: string
      area: string
      level: string
      role: 'owner' | 'admin' | 'member'
      title: string
    }
  }
}
