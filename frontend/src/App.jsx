import React, {useState} from 'react'
import { api } from './api'
import Dashboard from './components/Dashboard'
import Applications from './components/Applications'

export default function App(){
  const [view, setView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navigate(v){
    setView(v)
    setSidebarOpen(false)
  }

  return (
    <div className="app-root">
      {sidebarOpen && <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}/>}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h1>Job <span>Tracker</span></h1>
        <nav>
          <button onClick={()=>navigate('dashboard')} className={view==='dashboard'?'active':''}>📊 Dashboard</button>
          <button onClick={()=>navigate('applications')} className={view==='applications'?'active':''}>📋 Applications</button>
        </nav>
        <div className="sidebar-footer">Job Tracker v1.0</div>
      </aside>
      <main className="main-content">
        <div className="mobile-topbar">
          <button className="hamburger" onClick={()=>setSidebarOpen(o=>!o)}>☰</button>
          <span className="mobile-title">Job Tracker</span>
        </div>
        {view==='dashboard' ? <Dashboard api={api} /> : <Applications api={api} />}
      </main>
    </div>
  )
}
