import { useOneBotApi } from '@/hooks/use-onebot-api'
import { useTab } from '@/pages/hooks/use-tab'
import { useUserInfo } from '@/store'
import { Button, Input } from '@arco-design/web-react'
import { useAsyncFn, useControlledComponent, useKeyModifier, useUpdateEffect } from '@shined/react-use'
import { useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useChatSession } from '../hooks/use-chat-session'
import { homeStore } from '@/pages/store'

export function MsgInput() {
  const tab = useTab()
  const info = useUserInfo()
  const api = useOneBotApi()
  const session = useChatSession()
  const inputRef = useRef<any>(null)
  const msgInput = useControlledComponent('')
  const isGroup = session && session.type === 'group'

  const isShiftPressed = useKeyModifier('Shift')

  useUpdateEffect(() => {
    if (tab.value === 'chat') {
      msgInput.setValue('')
      inputRef.current.focus()
    }
  }, [session.type, session.id, tab.value])

  const sendMsg = useAsyncFn(async () => {
    if (!msgInput.value) {
      toast.error('Message cannot be empty')
      return
    }

    const target = homeStore.mutate.contactList.find((c) => c.id === session.id && c.type === session.type)

    if (!target) return

    const commonMsg = {
      user_id: info?.user_id ?? 0,
      sender: {
        user_id: info?.user_id ?? 0,
        nickname: info?.nickname ?? 'Me',
      },
      time: Date.now() / 1000,
      message: [{ type: 'text', data: { text: msgInput.value } }] as never[],
      post_type: 'message',
      self_id: 0,
      raw_message: msgInput.value,
      font: 0,
    } as const

    if (isGroup) {
      const { data } = await api.action<{ data: { message_id: number } }>('send_group_msg', {
        group_id: session.id,
        message: msgInput.value,
      })

      if (target.type === 'group') {
        target.history.push({
          ...commonMsg,
          message_id: data?.message_id ?? Date.now(),
          group_id: session.id,
          anonymous: null,
          message_type: 'group',
          sub_type: 'normal',
        })
      }
    } else {
      const { data } = await api.action<{ data: { message_id: number } }>('send_private_msg', {
        user_id: session.id,
        message: msgInput.value,
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

    msgInput.setValue('')

    homeStore.mutate.contactList.splice(homeStore.mutate.contactList.indexOf(target), 1)
    homeStore.mutate.contactList.unshift(target)
  })

  return (
    <div className="relative w-full flex items-center gap-2">
      <Input.TextArea
        {...msgInput.props}
        allowClear
        autoFocus
        ref={(ref) => {
          inputRef.current = ref
        }}
        className="rounded"
        autoSize={{ maxRows: 3, minRows: 3 }}
        disabled={sendMsg.loading}
        onPressEnter={() => {
          !isShiftPressed && sendMsg.run()
        }}
      />
      <Button onClick={sendMsg.run} loading={sendMsg.loading} className="absolute bottom-2 right-2 flex items-center">
        <span className="i-mdi-send" />
      </Button>
    </div>
  )
}
