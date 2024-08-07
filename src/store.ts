import { create, ref } from '@shined/reactive'
import localforage from 'localforage'

export const globalStore = create({
  ws: {
    host: (await localforage.getItem('ws_host')) || '',
    accessToken: (await localforage.getItem('ws_access_token')) || '',
    ref: ref({
      instance: undefined as WebSocket | undefined,
    }),
  },
  isConnected: false,
  isOnline: false,
  userInfo: undefined as { user_id: number; nickname: string } | undefined,
})

globalStore.subscribe((changes) => {
  if (changes.propsPath === 'ws.host') {
    localforage.setItem('ws_host', changes.snapshot.ws.host)
  }

  if (changes.propsPath === 'ws.accessToken') {
    localforage.setItem('ws_access_token', changes.snapshot.ws.accessToken)
  }
})

export const useWsUrl = () =>
  globalStore.useSnapshot((s) => {
    return s.ws.host
      ? s.ws.accessToken
        ? `ws://${s.ws.host}?access_token=${s.ws.accessToken}`
        : `ws://${s.ws.host}`
      : ''
  })

export const wsApi = globalStore.mutate.ws.ref
export const useConnected = () => globalStore.useSnapshot((s) => s.isConnected)
export const useOnline = () => globalStore.useSnapshot((s) => s.isOnline)
export const useUserInfo = () => globalStore.useSnapshot((s) => s.userInfo)
