import React, {useEffect, useState} from 'react'
import ModalForm from './ModalForm'
import Toast from './Toast'
import Avatar from './Avatar'

function fmt(d){
  if(!d) return '—'
  const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'))
  return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
}

function exportCSV(apps){
  const headers = ['Company','Role','Status','Location','URL','Date Applied','Notes','Created At']
  const rows = apps.map(a=>[
    a.company, a.role, a.status, a.location||'', a.url||'',
    a.date_applied||'', a.notes||'', a.created_at?.slice(0,10)||''
  ])
  const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const el = document.createElement('a')
  el.href = url; el.download = 'applications.csv'; el.click()
  URL.revokeObjectURL(url)
}

const SORT_COLS = {company:'company', role:'role', status:'status', date:'date_applied'}

export default function Applications({api}){
  const [apps, setApps] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [sortCol, setSortCol] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  function load(){
    setLoading(true)
    api.listApplications({q,status}).then(data=>{setApps(data);setLoading(false)}).catch(()=>setLoading(false))
  }

  useEffect(()=>{ load() },[q,status])

  function toggleSort(col){
    if(sortCol===col) setSortDir(d=>d==='asc'?'desc':'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const sorted = [...apps].sort((a,b)=>{
    const v1 = (a[sortCol]||'').toLowerCase()
    const v2 = (b[sortCol]||'').toLowerCase()
    return sortDir==='asc' ? v1.localeCompare(v2) : v2.localeCompare(v1)
  })

  function showToast(message,type='success'){ setToast({message,type}) }

  async function onAdd(data){ await api.createApplication(data); setModal(null); load(); showToast('Application added') }
  async function onEdit(id,data){ await api.updateApplication(id,data); setModal(null); load(); showToast('Application updated') }
  async function onDelete(id){
    if(!confirm('Delete this application?')) return
    await api.deleteApplication(id); load(); showToast('Application deleted','error')
  }

  function SortIcon({col}){
    if(sortCol!==col) return <span className="sort-icon">↕</span>
    return <span className="sort-icon active">{sortDir==='asc'?'↑':'↓'}</span>
  }

  return (
    <div className="applications">
      {toast && <Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)}/>}
      <div className="page-header">
        <h2>Applications</h2>
        <p>Manage and track all your job applications</p>
      </div>
      <div className="toolbar">
        <input placeholder="Search company, role, notes…" value={q} onChange={e=>setQ(e.target.value)}/>
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option>Applied</option>
          <option>Interviewing</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <button className="export-btn" onClick={()=>exportCSV(apps)} disabled={apps.length===0}>↓ Export</button>
        <button className="add-btn" onClick={()=>setModal({})}>+ Add</button>
      </div>

      {loading ? (
        <div className="loading-rows">{[...Array(5)].map((_,i)=><div key={i} className="skeleton-row"/>)}</div>
      ) : sorted.length===0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>{q||status?'No results found':'No applications yet'}</h3>
          <p>{q||status?'Try adjusting your search or filter.':'Add your first job application to get started.'}</p>
          {!q&&!status&&<button className="add-btn" onClick={()=>setModal({})}>+ Add Application</button>}
        </div>
      ) : (
        <table className="apps-table">
          <thead>
            <tr>
              <th onClick={()=>toggleSort('company')} className="sortable">Company <SortIcon col="company"/></th>
              <th onClick={()=>toggleSort('role')} className="sortable">Role <SortIcon col="role"/></th>
              <th onClick={()=>toggleSort('status')} className="sortable">Status <SortIcon col="status"/></th>
              <th onClick={()=>toggleSort('date_applied')} className="sortable">Date <SortIcon col="date_applied"/></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(a=>(
              <tr key={a.id} className={a.notes?'has-notes':''} data-notes={a.notes||''}>
                <td>
                  <div className="company-cell">
                    <Avatar name={a.company} url={a.url}/>
                    <div>
                      <div>{a.company}</div>
                      {a.url && <a href={a.url.startsWith('http')?a.url:'https://'+a.url} target="_blank" rel="noreferrer" className="job-link">View posting ↗</a>}
                    </div>
                  </div>
                </td>
                <td>{a.role}</td>
                <td><span className={`status-cell status-${a.status}`}>{a.status}</span></td>
                <td>{fmt(a.date_applied||a.created_at?.slice(0,10))}</td>
                <td className="actions">
                  <button onClick={()=>setModal(a)}>Edit</button>
                  <button className="btn-delete" onClick={()=>onDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && <ModalForm initial={modal} onClose={()=>setModal(null)} onSubmit={(data)=>modal.id?onEdit(modal.id,data):onAdd(data)}/>}
    </div>
  )
}
