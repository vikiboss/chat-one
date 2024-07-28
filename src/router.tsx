import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Home } from './pages'
import { Chat } from './pages/chat-list/chat'
import { Connect } from './pages/connect'
import { ChatList } from './pages/chat-list'
import { Setting } from './pages/setting'
import { Contact } from './pages/contact'

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
          element: <ChatList />,
          children: [
            {
              path: ':type/:id',
              element: <Chat />,
            },
          ],
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
