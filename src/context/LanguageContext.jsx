import { createContext, useContext, useState } from 'react'
import ru from '../i18n/ru'
import en from '../i18n/en'
import tj from '../i18n/tj'

const dicts = { ru, en, tj }

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ru')
  const t = dicts[lang]
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
