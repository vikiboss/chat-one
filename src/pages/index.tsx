import { ChatAvatar } from '@/components/chat-avatar'
import { globalStore, useConnected, useOnline, useUserInfo } from '@/store'
import { useBeforeUnload, useMount } from '@shined/react-use'
import { Outlet, useNavigate } from 'react-router-dom'
import { useTab } from './hooks/use-tab'
import { homeStore } from './store'
import localforage from 'localforage'

export function Home() {
  const tab = useTab()
  const info = useUserInfo()
  const navigate = useNavigate()
  const isConnected = useConnected()
  const isOnline = useOnline()
  const hasHost = globalStore.useSnapshot((s) => !!s.ws.host)

  useMount(() => {
    if (!isConnected && !hasHost) {
      navigate('/connect')
    }
  })

  useBeforeUnload(() => {
    localforage.setItem('homeStore', JSON.stringify(homeStore.snapshot()))
  })

  if (!isConnected && hasHost) {
    return (
      <div className="size-screen grid place-content-center">
        <div>WS is disconnected, please check the connection</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="size-screen grid-center">
        <div className="z-10 rounded p-2 h-[calc(100vh-6rem)] min-h-[calc(480px)] w-[calc(100vw-12rem)] min-w-[calc(800px)] bg-stone/12 flex flex-col gap-2">
          <div className="h-5">
            {info ? (
              <div className="flex gap-1 items-center">
                <ChatAvatar size="size-4" item={{ type: 'private', id: info.user_id }} />
                <div className="text-xs">
                  {info.nickname ?? '-'} - {info.user_id ?? '-'} - {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            ) : (
              'Loading...'
            )}
          </div>
          <div className="flex gap-2 h-[calc(100%-1.75rem)]">
            <aside className="flex flex-col gap-1 rounded">
              <div {...tab.props('chat')}>
                <span className="i-mdi-chat" />
                Chat
              </div>
              <div {...tab.props('contact')}>
                <span className="i-mdi-user" />
                Contact
              </div>
              <div {...tab.props('setting')}>
                <span className="i-mdi-settings" />
                Setting
              </div>
            </aside>
            <main className="h-full w-full overflow-scroll rounded">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <div className="absolute left-0 top-0 size-screen overflow-hidden before:content-[''] before:position-fixed before:left-0 before:right-0 before:top-0 before:bottom-0 before:z-1 before:backdrop-blur-[160px]">
        <div
          className="absolute opacity-50 bg-purple-3 dark:bg-purple-9 size-full animate-spin animate-duration-30000"
          style={{ clipPath: 'polygon(80% 0, 100% 70%, 100% 100%, 20% 90%)' }}
        />
        <div
          className="absolute opacity-50 bg-lime-3 dark:bg-lime-9 size-full animate-spin animate-duration-30000"
          style={{ clipPath: 'polygon(0 10%, 30% 0, 100% 40%, 70% 100%, 20% 90%)' }}
        />
        <div
          className="absolute opacity-50 bg-amber-3 dark:bg-amber-9 size-full animate-spin animate-duration-30000"
          style={{ clipPath: 'polygon(10% 0, 100% 70%, 100% 100%, 20% 90%)' }}
        />
      </div>
    </div>
  )
}
