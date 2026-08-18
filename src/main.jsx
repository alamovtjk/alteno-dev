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

/* Пока на экране лого (и сразу после) — тихо, в простое браузера, тянем
   чанки страниц, куда посетитель почти наверняка пойдёт дальше (Проекты,
   Команда, карточка проекта). Ничего не блокирует: тот же import(), что
   и в App.jsx у lazy() — файл просто осядет в кэше браузера, и переход
   по ссылке позже будет мгновенным вместо "подождите, гружу код". */
const prefetchNextRoutes = () => {
  import('./pages/Projects.jsx')
  import('./pages/TeamPage.jsx')
  import('./pages/ProjectDetail.jsx')
}
if ('requestIdleCallback' in window) {
  requestIdleCallback(prefetchNextRoutes, { timeout: 3000 })
} else {
  setTimeout(prefetchNextRoutes, 2000)
}
