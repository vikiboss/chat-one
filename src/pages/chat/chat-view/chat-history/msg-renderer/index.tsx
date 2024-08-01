import { ChatAvatar } from '@/components/chat-avatar'
import { qqFaceList } from '@/utils/cqface'

interface MsgRendererProps {
  messages?: any[]
}

export function MsgRenderer(props: MsgRendererProps) {
  const { messages = [] } = props
  const singleItem = ['mface', 'record', 'video', 'json', 'xml'] as const

  for (const item of singleItem) {
    const single = messages.find((e) => e.type === item)

    if (single) {
      messages.length = 0
      messages[0] = single
      break
    }
  }

  return (
    <div>
      {messages.map((e: any, idx) => {
        switch (e.type) {
          case 'text':
            return <span key={`${e.type}-${idx}`}>{e.data.text}</span>

          case 'image':
            return <img key={`${e.type}-${idx}`} className="h-20 rounded-6px" src={e.data.url} alt="chat-image" />

          case 'at':
            return (
              <div
                key={`${e.type}-${idx}`}
                className="inline-flex flex-center gap-1 mx-1 bg-blue/20 text-blue-5 px-1 py-0.25 rounded"
              >
                <span>@</span>
                <ChatAvatar size="size-4" item={{ type: 'private', id: e.data.qq }} />
              </div>
            )

          case 'face': {
            const target = qqFaceList.find((f) => f.id === +e.data.id)
            const isNormalFace = !!target

            return isNormalFace ? (
              target.hasImage ? (
                <img
                  key={`${e.type}-${idx}`}
                  className="h-5"
                  src={`https://static-face-host.viki.moe/face/gif/s${e.data.id}.${target.format ?? 'gif'}`}
                  alt="face"
                />
              ) : (
                `[表情, id=${e.data.id}]`
              )
            ) : (
              `[超级表情, id=${e.data.id}]`
            )
          }

          case 'json':
            return <span key={`${e.type}-${idx}`}>{JSON.parse(e.data.data).prompt || JSON.stringify(e.data)}</span>

          case 'reply':
            return <span key={`${e.type}-${idx}`}>[回复消息]</span>

          case 'forward':
            return <span key={`${e.type}-${idx}`}>[合并转发]</span>

          case 'record':
            return `[语音消息, url=${e.data.url}]`

          case 'video':
            return `[视频消息, url=${e.data.url}]`

          case 'mface':
            return e.data.url ? (
              <img key={`${e.type}-${idx}`} className="h-24 rounded" src={e.data.url} alt="m-face-image" />
            ) : (
              <span key={`${e.type}-${idx}`}>[原创表情, id={e.data.id || ''}]</span>
            )

          default:
            return <span key={`${e.type}-${idx}`}>{JSON.stringify(e)}</span>
        }
      })}
    </div>
  )
}
