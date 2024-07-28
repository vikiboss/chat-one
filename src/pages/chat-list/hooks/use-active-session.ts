import { chatListStore } from '../store'

export function useActiveSession() {
  return chatListStore.useSnapshot((s) => s.session)
}
