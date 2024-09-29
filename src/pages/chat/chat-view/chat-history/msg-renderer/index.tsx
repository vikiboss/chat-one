import { ChatAvatar } from '@/components/chat-avatar'
import { qqFaceList } from '@/utils/cqface'
import { formatDate } from '@shined/react-use'
import toast from 'react-hot-toast'

interface MsgRendererProps {
  messages?: any[]
}

export function MsgRenderer(props: MsgRendererProps) {
  const { messages = [] } = props
  const singleItem = ['mface', 'record', 'video', 'json', 'xml'] as const

  let msgs = structuredClone(messages)

  for (const item of singleItem) {
    const single = messages.find((e) => e.type === item)

    if (single) {
      msgs = [single]
      break
    }
  }

  const reply = msgs.find((e) => e.type === 'reply')

  msgs = msgs
    .filter((e) => e.type !== 'reply' && e.type !== 'long_msg')
    .filter((e) => e.type !== 'text' || (e.type === 'text' && !!e.data.text.trim()))

  const atCls =
    'inline-flex flex-center gap-1 bg-blue/16 text-blue-4/80 px-1 py-0.25 rounded mx-1 last:mr-0! first:ml-0!'

  return (
    <div className="flex flex-col gap-2">
      {reply && (
        <div
          title={JSON.stringify(reply.data, null, 2)}
          className="text-xs flex flex-col justify-center gap-1 bg-gray/16 text-white/36 p-2 rounded cursor-pointer hover:bg-gray/32"
          onClick={() => {
            const msg = document.getElementById(reply.data.message_id)

            if (msg) {
              msg.scrollIntoView({ behavior: 'smooth', block: 'center' })
              const aniCls = 'animate-bounce-alt'
              setTimeout(() => msg.classList.toggle(aniCls), 300)
              setTimeout(() => msg.classList.toggle(aniCls), 1300)
            } else {
              toast.error('The message is too old to scroll to...')
            }
          }}
        >
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <ChatAvatar size="size-4" item={{ type: 'private', id: reply.data.user_id }} />
              <span>{formatDate(new Date(reply.data.time * 1000), 'HH:mm:ss')}</span>
            </div>
            <div className="i-mdi:format-vertical-align-top" />
          </div>
          <div>
            <span className="text-wrap whitespace-nowrap">{reply.data.raw_message || reply.data.alt_message}</span>
          </div>
        </div>
      )}
      <div>
        {msgs.map((e: any, idx) => {
          switch (e.type) {
            case 'text':
              return (
                <span title={JSON.stringify(e.data, null, 2)} key={`${e.type}-${idx}`}>
                  {e.data.text}
                </span>
              )

            case 'image': {
              let url: string = e.data.file?.startsWith('base64://')
                ? e.data.file.replace('base64://', 'data:image/png; base64,')
                : e.data.url?.replace('http:', 'https:') ?? ''

              if (url.includes('multimedia')) {
                url = url.replace('multimedia.nt.qq.com.cn', 'c2cpicdw.qpic.cn')
                url = url.replace('&spec=0', '')
                url += '&spec=0'
              }

              const sizeMatch = e.data.width && +e.data.width < 200 && e.data.height && +e.data.height < 200

              return (
                <img
                  title={JSON.stringify(e.data, null, 2)}
                  key={`${e.type}-${idx}`}
                  className="inline-block max-h-120 max-w-120 h-20 rounded-6px"
                  style={{
                    width: sizeMatch ? e.data.width : undefined,
                    height: sizeMatch ? e.data.height : undefined,
                  }}
                  src={url}
                  alt="Expired"
                />
              )
            }

            case 'at':
              return (
                <span title={JSON.stringify(e.data, null, 2)} key={`${e.type}-${idx}`} className={atCls}>
                  <span>@</span>
                  <ChatAvatar size="size-4" item={{ type: 'private', id: e.data.qq }} />
                </span>
              )

            case 'mention':
              return (
                <span title={JSON.stringify(e.data, null, 2)} key={`${e.type}-${idx}`} className={atCls}>
                  <span>@</span>
                  <ChatAvatar size="size-4" item={{ type: 'private', id: e.data.qq }} />
                </span>
              )

            case 'mention_all':
              return (
                <span title={JSON.stringify(e.data, null, 2)} key={`${e.type}-${idx}`} className={atCls}>
                  <span>@全体成员</span>
                </span>
              )

            case 'face': {
              const target = qqFaceList.find((f) => f.id === +e.data.id)
              const isNormalFace = !!target

              return isNormalFace ? (
                target.hasImage ? (
                  <img
                    key={`${e.type}-${idx}`}
                    className="h-5 inline-block align-middle"
                    title={JSON.stringify(e.data, null, 2)}
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
              return (
                <span title={JSON.stringify(e.data, null, 2)} key={`${e.type}-${idx}`}>
                  {JSON.parse(e.data.data).prompt || JSON.stringify(e.data)}
                </span>
              )

            // case 'reply':
            //   return (
            //     <div className="inline-flex items-center" key={`${e.type}-${idx}`}>
            //       <span>[回复</span>
            //       <MsgRenderer messages={[{ type: 'at', data: { qq: e.data.user_id || e.data.qq } }]} />
            //       <span>]</span>
            //     </div>
            //   )

            case 'forward':
              return (
                <span title={JSON.stringify(e.data, null, 2)} key={`${e.type}-${idx}`}>
                  [合并转发]
                </span>
              )

            case 'record':
              return (
                <span key={`${e.type}-${idx}`} title={JSON.stringify(e.data, null, 2)}>
                  [语音消息] ${e.data.url}
                </span>
              )

            case 'video': {
              const url = e.data.url?.startsWith('base64://')
                ? e.data.url.replace('base64://', 'data:video/mp4;base64,')
                : e.data.url

              return (
                <video
                  autoPlay={false}
                  controls
                  key={`${e.type}-${idx}`}
                  className="inline-block h-48 rounded-2 min-w-36"
                  src={url}
                  title={JSON.stringify(e.data, null, 2)}
                >
                  <track kind="captions" />
                </video>
              )
            }

            case 'mface':
              return e.data.url ? (
                <img
                  key={`${e.type}-${idx}`}
                  className="inline-block h-24 rounded"
                  src={e.data.url}
                  alt="m-face-image"
                  title={JSON.stringify(e.data, null, 2)}
                />
              ) : (
                <span title={JSON.stringify(e.data, null, 2)} key={`${e.type}-${idx}`}>
                  [魔法表情, id={e.data.id || ''}]
                </span>
              )

            case 'bface': {
              const id = e.data.file.slice(0, 2)
              const hash = e.data.file.slice(0, 32)
              const url = `https://gxh.vip.qq.com/club/item/parcel/item/${id}/${hash}/raw300.gif`
              return (
                <img
                  key={`${e.type}-${idx}`}
                  className="inline-block h-24 rounded"
                  src={url}
                  alt="m-face-image"
                  title={JSON.stringify(e.data, null, 2)}
                />
              )
            }

            case 'file':
              return (
                <div
                  key={`${e.type}-${idx}`}
                  className="inline-flex flex-col flex-wrap gap-1"
                  title={JSON.stringify(e.data, null, 2)}
                >
                  <div className="i-mdi-file text-4xl opacity-60" />
                  <div>
                    [文件] {e.data.name} ({(+e.data.size / 1024).toFixed(3)}KB)
                  </div>
                </div>
              )

            default:
              return (
                <div className="inline-block" title={JSON.stringify(e.data, null, 2)} key={`${e.type}-${idx}`}>
                  {JSON.stringify(e)}
                </div>
              )
          }
        })}
      </div>
    </div>
  )
}
