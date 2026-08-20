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

/* Показ старой версии после выкладки.
   Сайт — PWA: страницу отдаёт service worker из своего кэша. Новая
   версия скачивалась и вставала у руля (skipWaiting + clientsClaim),
   но уже открытую страницу об этом никто не уведомлял — она так и
   висела на старом коде до ручной перезагрузки. Причём это касалось
   всех посетителей, а не только нас.

   Слушатель вешаем ТОЛЬКО если управляющий worker уже есть: при самом
   первом заходе clientsClaim тоже вызывает это событие, и без проверки
   получилась бы лишняя перезагрузка у каждого нового посетителя.
   Флаг — страховка от повторного срабатывания. */
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })
}
