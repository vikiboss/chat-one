import { useTab } from '@/pages/hooks/use-tab'
import { Button, Input } from '@arco-design/web-react'
import { useAsyncFn, useControlledComponent, useKeyModifier, useUpdateEffect } from '@shined/react-use'
import { useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useChatSession } from '../hooks/use-chat-session'
import { useSendMsg } from '../hooks/use-send-msg'

export function MsgInput() {
  const tab = useTab()
  const session = useChatSession()
  const inputRef = useRef<any>(null)
  const msgInput = useControlledComponent('')

  const isShiftPressed = useKeyModifier('Shift')
  const { sendMsgFn } = useSendMsg()

  useUpdateEffect(() => {
    if (tab.value === 'chat') {
      msgInput.setValue('')
      inputRef.current.focus()
    }
  }, [session.type, session.id, tab.value])

  const sendImg = useAsyncFn(async (dataURL: string) => {
    const base64 = dataURL.replace(/^data:image\/\w+;base64,/, '')
    const base64Url = `base64://${base64}`
    await sendMsgFn.run(session.type, session.id, [{ type: 'image', data: { file: base64Url } }])
  })

  const sendMsg = useAsyncFn(async () => {
    if (!msgInput.value) {
      toast.error('Message cannot be empty')
      return
    }

    await sendMsgFn.run(session.type, session.id, [{ type: 'text', data: { text: msgInput.value } }])

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
        disabled={sendMsgFn.loading || sendMsg.loading || sendImg.loading}
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
        loading={sendMsgFn.loading || sendMsg.loading || sendImg.loading}
        className="absolute bottom-2 right-2 flex items-center"
      >
        <span className="i-mdi-send" />
      </Button>
    </div>
  )
}
