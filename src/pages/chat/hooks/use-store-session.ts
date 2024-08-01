import { chatListStore } from '../store'

export function useStoreSession() {
  return chatListStore.useSnapshot((s) => s.session)
}
