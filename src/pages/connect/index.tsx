import { globalStore, useConnected } from '@/store'
import { wait } from '@/utils/wait'
import { Button, Input } from '@arco-design/web-react'
import { useAsyncFn, useControlledComponent, useUpdateEffect } from '@shined/react-use'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export function Connect() {
  const navigate = useNavigate()
  const isConnected = useConnected()
  const ws = globalStore.useSnapshot((s) => s.ws)
  const wsHostInput = useControlledComponent(ws.host)
  const wsAccessTokenInput = useControlledComponent(ws.accessToken)

  const submit = useAsyncFn(async () => {
    await wait()

    globalStore.mutate.ws.host = wsHostInput.value
    globalStore.mutate.ws.accessToken = wsAccessTokenInput.value
  })

  useUpdateEffect(() => {
    if (isConnected) {
      toast.success('Connected successfully!')
      navigate('/')
    }
  }, [isConnected])

  return (
    <div className="w-screen h-screen grid place-content-center">
      <div className="flex flex-col gap-4 mb-20">
        <h1>Connect to Chat One</h1>
        <Input {...wsHostInput.props} className="w-320px" placeholder="WebSocket Host" type="text" />
        <Input
          {...wsAccessTokenInput.props}
          className="w-320px"
          placeholder="WebSocket AccessKey (optional)"
          type="text"
        />

        <Button type="primary" loading={submit.loading} onClick={submit.run}>
          Connect
        </Button>
      </div>
    </div>
  )
}
