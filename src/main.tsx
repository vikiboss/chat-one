import { createRoot } from 'react-dom/client'

import '@arco-design/web-react/dist/css/arco.css'
import 'virtual:uno.css'
import './index.css'

import { App } from './app.tsx'

const mainDiv = document.getElementById('main')

if (mainDiv) {
  const root = createRoot(mainDiv)

  root.render(<App />)
} else {
  console.error('mainDiv is null')
}
