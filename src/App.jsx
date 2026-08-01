import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { MusicProvider } from './context/MusicContext'
import { SettingsProvider } from './context/SettingsContext'
import PublicLayout from './components/layout/PublicLayout'
import Admin from './pages/Admin'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import TeamPage from './pages/TeamPage'

export default function App() {
  return (
    <BrowserRouter>
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
                    <Route path="*"               element={<Home />} />
                  </Route>
                </Routes>
              </MusicProvider>
            </SettingsProvider>
          </LanguageProvider>
        } />
      </Routes>
    </BrowserRouter>
  )
}
