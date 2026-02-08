import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import AuthPage from './login.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
    ],
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)
