import React, {useEffect, useState} from 'react'

const STATUSES = ['Applied','Interviewing','Offer','Rejected']

function Avatar({name}){
  const colors = ['#0d6e4f','#0e7490','#7c3aed','#b45309','#9f1239','#1d4ed8']
  const i = name.charCodeAt(0) % colors.length
  return (
    <span className="avatar" style={{background:colors[i]}}>{name[0].toUpperCase()}</span>
  )
}

function fmt(d){
  if(!d) return ''
  const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'))
  return dt.toLocaleDateString('en-US',{month:'short',day:'numeric'})
}

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
              <div className="company-cell">
                <Avatar name={a.company} />
                <div>
                  <div className="company">{a.company}</div>
                  <div className="role">{a.role}</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <span style={{color:'var(--muted)',fontSize:'0.8rem'}}>{fmt(a.date_applied || a.created_at?.slice(0,10))}</span>
                <span className={`status-badge status-${a.status}`}>{a.status}</span>
              </div>
            </li>
          ))}
          {recent.length === 0 && (
            <li style={{color:'var(--muted)',justifyContent:'center',padding:'32px 20px',fontSize:'0.875rem'}}>
              No applications yet — add one to get started!
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
