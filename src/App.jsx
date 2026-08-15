import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { MusicProvider } from './context/MusicContext'
import { SettingsProvider } from './context/SettingsContext'
import PublicLayout from './components/layout/PublicLayout'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

/* Главная едет в основном чанке — с неё начинают почти все.
   Остальное подгружается по переходу: админка с пятью вкладками
   и docx-выгрузкой посетителю не нужна вообще. */
const Admin         = lazy(() => import('./pages/Admin'))
const Projects      = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const TeamPage      = lazy(() => import('./pages/TeamPage'))

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={
              <LanguageProvider>
                <SettingsProvider>
                  <MusicProvider>
                    <Routes>
                      <Route element={<PublicLayout />}>
                        <Route path="/projects"       element={<Projects />} />
                        <Route path="/projects/:slug" element={<ProjectDetail />} />
                        <Route path="/team"           element={<TeamPage />} />
                        <Route path="/"               element={<Home />} />
                        <Route path="*"               element={<NotFound />} />
                      </Route>
                    </Routes>
                  </MusicProvider>
                </SettingsProvider>
              </LanguageProvider>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
