import { Avatar } from '@/components/avatar'
import { globalStore, useConnected, useUserInfo } from '@/store'
import { useMount } from '@shined/react-use'
import { Outlet, useNavigate } from 'react-router-dom'
import { useTab } from './hooks/use-tab'
import { useWsListener } from './hooks/use-ws-listener'

export function Home() {
  useWsListener()

  const tab = useTab()
  const info = useUserInfo()
  const navigate = useNavigate()
  const isConnected = useConnected()
  const hasHost = globalStore.useSnapshot((s) => !!s.ws.host)

  useMount(() => {
    if (!isConnected && !hasHost) {
      navigate('/connect')
    }
  })

  if (!isConnected) {
    return null
  }

  return (
    <div className="size-screen grid-center">
      <div className="rounded p-2 h-[calc(100vh-200px)] w-[calc((100vh-200px)/0.618)] bg-stone/12 flex flex-col gap-2">
        <div className="h-5">
          {info ? (
            <div className="flex gap-1 items-center">
              <Avatar size="size-4" item={{ type: 'private', id: info.user_id }} />
              <div className="text-xs">
                {info.nickname ?? '-'} ({info.user_id ?? '-'})
              </div>
            </div>
          ) : (
            'Loading...'
          )}
        </div>
        <div className="flex gap-2">
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
          <main className="h-[calc(100vh-260px)] w-full overflow-scroll bg-zinc-1/6 rounded p-2">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
