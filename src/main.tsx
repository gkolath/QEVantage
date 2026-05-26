import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QEVantageProvider } from './context/QEVantageContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QEVantageProvider>
      <App />
    </QEVantageProvider>
  </StrictMode>,
)

