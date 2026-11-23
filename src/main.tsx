import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { storedTheme } from './app/useTheme'
import './shared/styles/tokens.css'
import './shared/styles/base.css'
import './features/analisis/analisis.css'

document.documentElement.setAttribute('data-theme', storedTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
