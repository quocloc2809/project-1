import React, { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header/Header'
import MainContent from './components/MainContent/MainContent'
import Login from './components/Login/Login'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('authUser')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        // ignore
      }
    }
  }, [])

  const handleLogin = (userData) => {
    console.log('[App] handleLogin called with:', userData)
    setUser(userData)
    localStorage.setItem('authUser', JSON.stringify(userData))
    console.log('[App] User state updated, should render MainContent')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('authUser')
  }

  console.log('[App] Current user state:', user)

  if (!user) {
    console.log('[App] No user, showing Login')
    return <Login onLogin={handleLogin} />
  }

  console.log('[App] User logged in, rendering MainContent with mode:', user.mode)
  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      <MainContent mode={user.mode} />
    </div>
  )
}

export default App