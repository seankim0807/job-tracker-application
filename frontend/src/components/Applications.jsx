import React, {useEffect, useState, useRef} from 'react'
import ModalForm from './ModalForm'
import Toast from './Toast'
import Avatar from './Avatar'
import ConfirmDialog from './ConfirmDialog'

const STATUSES = ['Applied','Interviewing','Offer','Rejected']

function fmt(d){
  if(!d) return '—'
  const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'))
  return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
}

function exportCSV(apps){
  const headers = ['Company','Role','Status','Location','URL','Date Applied','Notes','Created At']
  const rows = apps.map(a=>[
    a.company,a.role,a.status,a.location||'',a.url||'',
    a.date_applied||'',a.notes||'',a.created_at?.slice(0,10)||''
  ])
  const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const el = document.createElement('a')
  el.href=url; el.download='applications.csv'; el.click()
  URL.revokeObjectURL(url)
}

function StatusPicker({value, onChange}){
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(()=>{
    function handle(e){ if(ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return ()=>document.removeEventListener('mousedown', handle)
  },[])
  return (
    <div className="status-picker" ref={ref}>
      <span className={`status-cell status-${value}`} onClick={e=>{e.stopPropagation();setOpen(o=>!o)}} title="Click to change status">
        {value} ▾
      </span>
      {open && (
        <div className="status-dropdown">
          {STATUSES.map(s=>(
            <div key={s} className={`status-option ${s===value?'active':''}`}
              onClick={e=>{e.stopPropagation();onChange(s);setOpen(false)}}>
              <span className={`status-cell status-${s}`}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Applications({api}){
  const [apps, setApps] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [sortCol, setSortCol] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [confirmId, setConfirmId] = useState(null)

  function load(){
    setLoading(true)
    api.listApplications({q,status}).then(data=>{setApps(data);setLoading(false)}).catch(()=>setLoading(false))
  }

  useEffect(()=>{ load() },[q,status])

  useEffect(()=>{
    function onKey(e){
      if(e.key==='n'&&!modal&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA') setModal({})
      if(e.key==='Escape') setModal(null)
    }
    document.addEventListener('keydown',onKey)
    return ()=>document.removeEventListener('keydown',onKey)
  },[modal])

  function toggleSort(col){
    if(sortCol===col) setSortDir(d=>d==='asc'?'desc':'asc')
    else{setSortCol(col);setSortDir('asc')}
  }

  const sorted = [...apps].sort((a,b)=>{
    const v1=(a[sortCol]||'').toLowerCase()
    const v2=(b[sortCol]||'').toLowerCase()
    return sortDir==='asc'?v1.localeCompare(v2):v2.localeCompare(v1)
  })

  function showToast(message,type='success'){setToast({message,type})}

  async function onAdd(data){await api.createApplication(data);setModal(null);load();showToast('Application added')}
  async function onEdit(id,data){await api.updateApplication(id,data);setModal(null);load();showToast('Application updated')}
  async function onDelete(){
    await api.deleteApplication(confirmId);setConfirmId(null);load();showToast('Application deleted','error')
  }
  async function onStatusChange(id,newStatus){
    await api.updateApplication(id,{status:newStatus});load();showToast(`Status updated to ${newStatus}`)
  }

  function SortIcon({col}){
    if(sortCol!==col) return <span className="sort-icon">↕</span>
    return <span className="sort-icon active">{sortDir==='asc'?'↑':'↓'}</span>
  }

  const confirmApp = apps.find(a=>a.id===confirmId)

  return (
    <div className="applications">
      {toast && <Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)}/>}
      {confirmId && <ConfirmDialog
        message={`Are you sure you want to delete "${confirmApp?.company} — ${confirmApp?.role}"?`}
        onConfirm={onDelete}
        onCancel={()=>setConfirmId(null)}
      />}

      <div className="page-header">
        <h2>Applications</h2>
        <p>Manage and track all your job applications</p>
      </div>

      <div className="toolbar">
        <input placeholder="Search company, role, notes…" value={q} onChange={e=>setQ(e.target.value)}/>
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        {!loading && <span className="result-count">{sorted.length} application{sorted.length!==1?'s':''}</span>}
        <button className="export-btn" onClick={()=>exportCSV(apps)} disabled={apps.length===0}>↓ Export</button>
        <button className="add-btn" onClick={()=>setModal({})}>+ Add <kbd>N</kbd></button>
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
              <th onClick={()=>toggleSort('location')} className="sortable">Location <SortIcon col="location"/></th>
              <th onClick={()=>toggleSort('date_applied')} className="sortable">Date <SortIcon col="date_applied"/></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(a=>(
              <tr key={a.id} className={a.notes?'has-notes':''} data-notes={a.notes?`📝 ${a.notes}`:''}>
                <td>
                  <div className="company-cell">
                    <Avatar name={a.company} url={a.url}/>
                    <div>
                      <div className="company-name">{a.company}{a.notes && <span className="notes-dot" title="Has notes">📝</span>}</div>
                      {a.url && <a href={a.url.startsWith('http')?a.url:'https://'+a.url} target="_blank" rel="noreferrer" className="job-link">View posting ↗</a>}
                    </div>
                  </div>
                </td>
                <td className="role-cell">{a.role}</td>
                <td><StatusPicker value={a.status} onChange={s=>onStatusChange(a.id,s)}/></td>
                <td className="location-cell">{a.location || <span className="muted-dash">—</span>}</td>
                <td className="date-cell">{fmt(a.date_applied||a.created_at?.slice(0,10))}</td>
                <td className="actions">
                  <button onClick={()=>setModal(a)}>Edit</button>
                  <button className="btn-delete" onClick={()=>setConfirmId(a.id)}>Delete</button>
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
