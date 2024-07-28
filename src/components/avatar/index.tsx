import { cn } from '@/utils'

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
}

export function Avatar(props: Props) {
  const { item, rounded = false, size = 'size-8', imgSize = 100, className, ...imgProps } = props

  return item.type === 'group' ? (
    <img
      className={cn(size, rounded ? 'rounded-full' : 'rounded', className)}
      src={`https://p.qlogo.cn/gh/${item.id}/${item.id}/${imgSize}`}
      {...imgProps}
      alt="avatar"
    />
  ) : (
    <img
      className={cn(size, rounded ? 'rounded-full' : 'rounded', className)}
      src={`https://q.qlogo.cn/headimg_dl?dst_uin=${item.id}&spec=${imgSize}`}
      {...imgProps}
      alt="avatar"
    />
  )
}
