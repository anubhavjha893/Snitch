import './App.css'
import './extras.css'
import './extras2.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes'
import { useDispatch } from 'react-redux'
import { getMe } from '../features/auth/service/auth.api'
import { setLoading, setUser } from '../features/auth/state/auth.slice'
import { useEffect } from 'react'
import ThemeToggle from '../features/Shared/Components/ThemeToggle'


function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    getMe()
      .then(data => dispatch(setUser(data.user)))
      .catch(() => dispatch(setUser(null)))
      .finally(() => dispatch(setLoading(false)))
  }, [dispatch])

  return (
    <>
      <ThemeToggle />
      <RouterProvider router={routes} />
    </>
  )
}

export default App
