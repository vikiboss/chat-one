import { Navigate, createBrowserRouter } from 'react-router-dom'
import { Home } from './pages'
import { Chat } from './pages/chat'
import { Connect } from './pages/connect'
import { Contact } from './pages/contact'
import { Setting } from './pages/setting'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Home />,
      children: [
        {
          index: true,
          element: <Navigate to="chat" replace />,
        },
        {
          path: 'chat',
          element: <Chat />,
        },
        {
          path: 'contact',
          element: <Contact />,
        },
        {
          path: 'setting',
          element: <Setting />,
        },
      ],
    },
    {
      path: '/connect',
      element: <Connect />,
    },
  ],
  {},
)
