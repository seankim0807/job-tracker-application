import React, {useEffect, useState} from 'react'

const STATUSES = ['Applied','Interviewing','Offer','Rejected']

export default function Dashboard({api}){
  const [stats, setStats] = useState({total:0, counts:{}, response_rate:0})
  const [recent, setRecent] = useState([])

  useEffect(()=>{
    api.stats().then(setStats).catch(()=>{})
    api.listApplications({}).then(setRecent).catch(()=>{})
  },[])

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your job search progress</p>
      </div>

      <div className="pipeline">
        <div className="pipeline-item">
          <div className="count">{stats.total}</div>
          <div className="label">Total</div>
        </div>
        {STATUSES.map(s=>(
          <div className="pipeline-item" key={s}>
            <div className="count">{stats.counts?.[s] || 0}</div>
            <div className="label">{s}</div>
          </div>
        ))}
        <div className="pipeline-item">
          <div className="count">{stats.response_rate}%</div>
          <div className="label">Response Rate</div>
        </div>
      </div>

      <div className="recent">
        <div className="recent-header">Recent Applications</div>
        <ul>
          {recent.slice(0,8).map(a=>(
            <li key={a.id}>
              <div>
                <div className="company">{a.company}</div>
                <div className="role">{a.role}</div>
              </div>
              <span className={`status-badge status-${a.status}`}>{a.status}</span>
            </li>
          ))}
          {recent.length === 0 && (
            <li style={{color:'var(--muted)',justifyContent:'center',padding:'24px'}}>No applications yet</li>
          )}
        </ul>
      </div>
    </div>
  )
}
