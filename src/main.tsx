import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './shared/styles/tokens.css'
import './shared/styles/base.css'
import './features/historial/historial.css'
import './features/analisis/analisis.css'
import './features/informacion/informacion.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
