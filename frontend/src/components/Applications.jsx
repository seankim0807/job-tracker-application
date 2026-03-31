import React, {useEffect, useState} from 'react'
import ModalForm from './ModalForm'

export default function Applications({api}){
  const [apps, setApps] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState(null)

  function load(){
    api.listApplications({q, status}).then(setApps).catch(()=>{})
  }

  useEffect(()=>{ load() }, [q, status])

  async function onAdd(data){
    await api.createApplication(data)
    setModal(null)
    load()
  }

  async function onEdit(id,data){
    await api.updateApplication(id, data)
    setModal(null)
    load()
  }

  async function onDelete(id){
    if (!confirm('Delete this application?')) return
    await api.deleteApplication(id)
    load()
  }

  return (
    <div className="applications">
      <div className="toolbar">
        <input placeholder="Search company, role, notes" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All</option>
          <option>Applied</option>
          <option>Interviewing</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <button onClick={()=>setModal({})}>+ Add</button>
      </div>
      <table className="apps-table">
        <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {apps.map(a=> (
            <tr key={a.id}>
              <td>{a.company}</td>
              <td>{a.role}</td>
              <td>{a.status}</td>
              <td>{a.date_applied || a.created_at?.slice(0,10)}</td>
              <td className="actions">
                <button onClick={()=>setModal(a)}>Edit</button>
                <button onClick={()=>onDelete(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modal && (
        <ModalForm initial={modal} onClose={()=>setModal(null)} onSubmit={(data)=> modal.id ? onEdit(modal.id,data) : onAdd(data)} />
      )}
    </div>
  )
}
