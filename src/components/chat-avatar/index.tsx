import toast from 'react-hot-toast'
import { cn } from '@/utils'
import { useClipboard } from '@shined/react-use'

import type { OneBot } from '@/hooks/use-onebot-api'
import type { ImgHTMLAttributes } from 'react'

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  item: {
    id: number
    type: OneBot.ContactType
  }
  rounded?: boolean
  size?: string
  imgSize?: 40 | 100 | 160 | 640
  onClick?: (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => void
}

export function ChatAvatar(props: Props) {
  const { item, onClick, rounded = false, size = 'size-8', imgSize = 100, className, ...imgProps } = props

  const clipboard = useClipboard()

  const url =
    item.type === 'group'
      ? `https://p.qlogo.cn/gh/${item.id}/${item.id}/${imgSize}`
      : `https://q.qlogo.cn/headimg_dl?dst_uin=${item.id}&spec=${imgSize}`

  return (
    <img
      onClick={(e) => {
        clipboard.copy(item.id.toString())
        toast.success('Id copied to clipboard!')
        onClick?.(e)
      }}
      className={cn(
        size,
        rounded ? 'rounded-full' : 'rounded',
        onClick ? 'cursor-pointer hover:opacity-60 transition-all' : '',
        className,
      )}
      src={url}
      {...imgProps}
      title={item.id?.toString()}
      alt="avatar"
    />
  )
}
