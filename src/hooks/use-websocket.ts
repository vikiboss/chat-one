import { useEventListener, useUnmount } from '@shined/react-use'
import { useEffect, useRef } from 'react'

interface WebSocketOptions {
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  protocols?: string | string[]
}

export function useWebsocket(url: string, options: WebSocketOptions = {}) {
  const { onOpen = () => {}, onClose = () => {}, onError = () => {}, onMessage = () => {}, protocols } = options

  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (url) {
      wsRef.current = new WebSocket(url, protocols)
    }

    return () => {
      wsRef.current?.close()
    }
  }, [url, protocols])

  useEventListener(() => wsRef.current, 'message', onMessage)
  useEventListener(() => wsRef.current, 'open', onOpen)
  useEventListener(() => wsRef.current, 'close', onClose)
  useEventListener(() => wsRef.current, 'error', onError)

  useUnmount(() => wsRef.current?.close())

  return wsRef
}
