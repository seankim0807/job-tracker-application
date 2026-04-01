import React, {useEffect, useState} from 'react'
import ModalForm from './ModalForm'
import Toast from './Toast'
import Avatar from './Avatar'

function fmt(d){
  if(!d) return '—'
  const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'))
  return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
}

export default function Applications({api}){
  const [apps, setApps] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  function load(){
    setLoading(true)
    api.listApplications({q, status}).then(data=>{setApps(data); setLoading(false)}).catch(()=>setLoading(false))
  }

  useEffect(()=>{ load() }, [q, status])

  function showToast(message, type='success'){
    setToast({message, type})
  }

  async function onAdd(data){
    await api.createApplication(data)
    setModal(null)
    load()
    showToast('Application added')
  }

  async function onEdit(id,data){
    await api.updateApplication(id, data)
    setModal(null)
    load()
    showToast('Application updated')
  }

  async function onDelete(id){
    if (!confirm('Delete this application?')) return
    await api.deleteApplication(id)
    load()
    showToast('Application deleted', 'error')
  }

  return (
    <div className="applications">
      {toast && <Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)} />}
      <div className="page-header">
        <h2>Applications</h2>
        <p>Manage and track all your job applications</p>
      </div>
      <div className="toolbar">
        <input placeholder="Search company, role, notes…" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option>Applied</option>
          <option>Interviewing</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <button className="add-btn" onClick={()=>setModal({})}>+ Add Application</button>
      </div>

      {loading ? (
        <div className="loading-rows">
          {[...Array(5)].map((_,i)=><div key={i} className="skeleton-row"/>)}
        </div>
      ) : apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>{q || status ? 'No results found' : 'No applications yet'}</h3>
          <p>{q || status ? 'Try adjusting your search or filter.' : 'Add your first job application to get started.'}</p>
          {!q && !status && <button className="add-btn" onClick={()=>setModal({})}>+ Add Application</button>}
        </div>
      ) : (
        <table className="apps-table">
          <thead>
            <tr><th>Company</th><th>Role</th><th>Status</th><th>Date Applied</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {apps.map(a=>(
              <tr key={a.id}>
                <td>
                  <div className="company-cell">
                    <Avatar name={a.company} url={a.url} />
                    <span>{a.company}</span>
                  </div>
                </td>
                <td>{a.role}</td>
                <td><span className={`status-cell status-${a.status}`}>{a.status}</span></td>
                <td>{fmt(a.date_applied || a.created_at?.slice(0,10))}</td>
                <td className="actions">
                  <button onClick={()=>setModal(a)}>Edit</button>
                  <button className="btn-delete" onClick={()=>onDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <ModalForm initial={modal} onClose={()=>setModal(null)} onSubmit={(data)=> modal.id ? onEdit(modal.id,data) : onAdd(data)} />
      )}
    </div>
  )
}
