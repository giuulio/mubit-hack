import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/public-sans'
import '@fontsource-variable/figtree'
import App from './App.tsx'
import { initialTheme } from './theme'
import './styles.css'

// Set the theme before the first paint, so a dark-mode viewer never sees a light flash.
document.documentElement.dataset.theme = initialTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
