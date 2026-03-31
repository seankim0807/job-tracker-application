import React, {useEffect, useState} from 'react'

export default function Dashboard({api}){
  const [stats, setStats] = useState({total:0,counts:{},response_rate:0})
  const [recent, setRecent] = useState([])

  useEffect(()=>{
    api.stats().then(setStats).catch(()=>{})
    api.listApplications({}).then(setRecent).catch(()=>{})
  },[])

  return (
    <div className="dashboard">
      <section className="cards">
        <div className="card">
          <strong>Total</strong>
          <div className="big">{stats.total}</div>
        </div>
        <div className="card">
          <strong>Applied</strong>
          <div className="big">{stats.counts?.Applied || 0}</div>
        </div>
        <div className="card">
          <strong>Interviewing</strong>
          <div className="big">{stats.counts?.Interviewing || 0}</div>
        </div>
        <div className="card">
          <strong>Offer</strong>
          <div className="big">{stats.counts?.Offer || 0}</div>
        </div>
      </section>
      <section className="recent">
        <h2>Recent Applications</h2>
        <ul>
          {recent.slice(0,8).map(a=> (
            <li key={a.id}>
              <div className="left">{a.company} — {a.role}</div>
              <div className="right">{a.status}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
