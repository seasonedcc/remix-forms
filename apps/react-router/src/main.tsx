import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Index, { action } from './routes/index'
import Success from './routes/success'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
    action,
  },
  {
    path: '/success',
    element: <Success />,
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
