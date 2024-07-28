import { Button } from '@arco-design/web-react'

export function Setting() {
  return (
    <div>
      <h2>Setting</h2>
      <Button
        onClick={() => {
          localStorage.clear()
        }}
      >
        Clear Data
      </Button>
    </div>
  )
}
