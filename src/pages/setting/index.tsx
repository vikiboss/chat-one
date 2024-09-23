import { Button } from '@arco-design/web-react'
import { useAsyncFn } from '@shined/react-use'
import localforage from 'localforage'
import { homeStore } from '../store'

export function Setting() {
  const clear = useAsyncFn(async () => {
    localforage.removeItem('homeStore')

    for (const contact of homeStore.mutate.contactList) {
      contact.unreadCount = 0
      contact.history = []
    }
  })

  return (
    <div>
      <h2>Setting</h2>
      <Button loading={clear.loading} onClick={clear.run}>
        Clear Data
      </Button>
    </div>
  )
}
