import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import { Provider } from 'react-redux'
import { store } from './app/app.store.js'
import { ToastProvider } from './features/Shared/hooks/ToastProvider.jsx'


createRoot(document.getElementById('root')).render(

  <Provider store={store} >
    <ToastProvider>
      <App />
    </ToastProvider>
  </Provider>

)
