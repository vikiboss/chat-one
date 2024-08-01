import { useOneBotApi, type OneBot } from '@/hooks/use-onebot-api'
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

  const isShiftPressed = useKeyModifier('Shift')

  useUpdateEffect(() => {
    if (tab.value === 'chat') {
      msgInput.setValue('')
      inputRef.current.focus()
    }
  }, [session.type, session.id, tab.value])

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

  const sendImg = useAsyncFn(async (dataURL: string) => {
    const base64 = dataURL.replace(/^data:image\/\w+;base64,/, '')
    const base64Url = `base64://${base64}`
    await sendMessages(session.type, session.id, [{ type: 'image', data: { file: base64Url } }])
  })

  const sendMsg = useAsyncFn(async () => {
    if (!msgInput.value) {
      toast.error('Message cannot be empty')
      return
    }

    await sendMessages(session.type, session.id, [{ type: 'text', data: { text: msgInput.value } }])

    msgInput.setValue('')
  })

  return (
    <div className="relative w-full flex items-center gap-2">
      <Input.TextArea
        {...msgInput.props}
        allowClear
        autoFocus
        ref={inputRef}
        className="rounded"
        autoSize={{ maxRows: 3, minRows: 3 }}
        disabled={sendMsg.loading || sendImg.loading}
        onPaste={(e) => {
          if (e.clipboardData?.items.length) {
            for (const item of e.clipboardData.items) {
              if (item.type.startsWith('image')) {
                const file = item.getAsFile()
                if (!file) continue
                const reader = new FileReader()
                reader.addEventListener('load', async (event) => {
                  if (event.target?.result) {
                    sendImg.run(event.target.result.toString())
                  }
                })
                reader.readAsDataURL(file)
              }
            }
          }
        }}
        onPressEnter={() => {
          !isShiftPressed && sendMsg.run()
        }}
      />
      <Button
        onClick={sendMsg.run}
        loading={sendMsg.loading || sendImg.loading}
        className="absolute bottom-2 right-2 flex items-center"
      >
        <span className="i-mdi-send" />
      </Button>
    </div>
  )
}
