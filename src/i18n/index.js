import { useSyncExternalStore } from "react"
import es from "./es.js"
import en from "./en.js"

const DICTIONARIES = { es, en }
const LOCALES = { es: "es-MX", en: "en-US" }
const STORAGE_KEY = "bentoboxd_language:v1"

const listeners = new Set()

/** Preferencia guardada o, sin ella, el idioma del navegador. */
export function detectLanguage(saved, browserLanguage) {
  if (saved in DICTIONARIES) return saved
  return browserLanguage?.toLowerCase().startsWith("es") ? "es" : "en"
}

function readSavedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function setMeta(selector, content) {
  document.querySelector(selector)?.setAttribute("content", content)
}

function applyToDocument(language) {
  const { title, description, ogDescription, ogLocale } = DICTIONARIES[language].document
  document.documentElement.lang = language
  setMeta('meta[name="description"]', description)
  setMeta('meta[property="og:title"]', title)
  setMeta('meta[property="og:description"]', ogDescription)
  setMeta('meta[property="og:locale"]', ogLocale)
}

let language = detectLanguage(readSavedLanguage(), navigator.language)
applyToDocument(language)

export const getLanguage = () => language
export const getLocale = () => LOCALES[language]
/** Para código fuera de React; los componentes usan useMessages. */
export const getMessages = () => DICTIONARIES[language]

export function setLanguage(next) {
  language = next
  applyToDocument(next)
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Almacenamiento no disponible: el idioma solo dura esta sesión.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useLanguage() {
  return useSyncExternalStore(subscribe, getLanguage)
}

export function useMessages() {
  return DICTIONARIES[useLanguage()]
}
