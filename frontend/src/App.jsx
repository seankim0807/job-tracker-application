import React, {useState} from 'react'
import { api } from './api'
import Dashboard from './components/Dashboard'
import Applications from './components/Applications'

export default function App(){
  const [view, setView] = useState('dashboard')

  return (
    <div className="app-root">
      <aside className="sidebar">
        <h1>Job <span>Tracker</span></h1>
        <nav>
          <button onClick={()=>setView('dashboard')} className={view==='dashboard'?'active':''}>Dashboard</button>
          <button onClick={()=>setView('applications')} className={view==='applications'?'active':''}>Applications</button>
        </nav>
      </aside>
      <main className="main-content">
        {view==='dashboard' ? <Dashboard api={api} /> : <Applications api={api} />}
      </main>
    </div>
  )
}
