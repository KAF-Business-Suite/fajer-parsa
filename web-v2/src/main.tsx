import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/vazirmatn'
import '@fontsource-variable/manrope'
import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'motion/react'
import App from './App'
import { normalizeLegacyInbound } from './inbound-route'
import './index.css'

// Reuse the generated HTML until React commits the interactive version.
normalizeLegacyInbound()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="data-theme" themes={['light', 'dark']} enableSystem={false} defaultTheme="light" storageKey="fp.theme.v1">
      <MotionConfig reducedMotion="user"><App /></MotionConfig>
    </ThemeProvider>
  </React.StrictMode>,
)
