import { useOneBotApi, type OneBot } from '@/hooks/use-onebot-api'
import { homeStore } from '@/pages/store'
import { useUserInfo } from '@/store'
import { useAsyncFn } from '@shined/react-use'

export function useSendMsg() {
  const info = useUserInfo()
  const api = useOneBotApi()

  async function sendMessages(type: OneBot.ContactType, id: number, message: any[]) {
    const isGroup = type === 'group'

    const target = homeStore.mutate.contactList.find((c) => c.id === id && c.type === type)

    if (!target) return

    const commonMsg = {
      user_id: info?.user_id ?? 0,
      sender: {
        user_id: info?.user_id ?? 0,
        nickname: info?.nickname ?? 'Me',
      },
      time: Date.now() / 1000,
      message,
      post_type: 'message',
      self_id: 0,
      raw_message: message.toString(),
      font: 0,
    } as const

    if (isGroup) {
      const { data } = await api.action<{ data: { message_id: number } }>('send_group_msg', {
        group_id: id,
        message,
      })

      if (target.type === 'group') {
        target.history.push({
          ...commonMsg,
          message_id: data?.message_id ?? Date.now(),
          group_id: id,
          anonymous: null,
          message_type: 'group',
          sub_type: 'normal',
        })
      }
    } else {
      const { data } = await api.action<{ data: { message_id: number } }>('send_private_msg', {
        user_id: id,
        message,
      })

      if (target.type === 'private') {
        target.history.push({
          ...commonMsg,
          message_id: data?.message_id ?? Date.now(),
          sender: { user_id: info?.user_id ?? 0, nickname: info?.nickname ?? 'Me' },
          message_type: 'private',
          sub_type: 'friend',
        })
      }
    }

    homeStore.mutate.contactList.splice(homeStore.mutate.contactList.indexOf(target), 1)
    homeStore.mutate.contactList.unshift(target)
  }

  const sendMsgFn = useAsyncFn(sendMessages)

  return {
    sendMsgFn,
  }
}
