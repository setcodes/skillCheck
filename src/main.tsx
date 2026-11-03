import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import { runMigrations } from './shared/bank/migrations'
import './app/styles/index.css'

runMigrations()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
