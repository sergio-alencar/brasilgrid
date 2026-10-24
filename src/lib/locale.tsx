import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Locale } from '../../shared/api.ts'
import { en } from '../i18n/en.tsx'
import { es } from '../i18n/es.tsx'
import { pt } from '../i18n/pt.tsx'

const LOCALE_KEY = 'brasilgrid:locale'
const DICTS = { pt, en, es }

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: typeof pt
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function detectLocale(): Locale {
  const lang = navigator.language ?? ''
  if (lang.startsWith('en')) return 'en'
  if (lang.startsWith('es')) return 'es'
  return 'pt'
}

function readStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(LOCALE_KEY)
    if (v === 'en') return 'en'
    if (v === 'es') return 'es'
    if (v === 'pt') return 'pt'
    // Nenhuma escolha salva ainda: usa o idioma do navegador.
    return detectLocale()
  } catch {
    return detectLocale()
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(LOCALE_KEY, l)
    } catch {
      // Sem localStorage: a escolha só vale pra sessão atual.
    }
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t: DICTS[locale] }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale precisa estar dentro de LocaleProvider')
  return ctx
}
