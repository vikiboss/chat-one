import { useContactList } from '@/pages/contact/hooks/use-contact-list'

export function useChatList() {
  const [_friends, _groups, list] = useContactList()
  return list.filter((c) => c.chatting || c.unreadCount > 0)
}
