import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* Первый кадр после монтирования — убираем сплэш из index.html */
requestAnimationFrame(() => {
  requestAnimationFrame(() => window.__hideSplash?.())
})
