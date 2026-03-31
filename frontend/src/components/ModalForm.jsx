import React, {useState, useEffect} from 'react'

export default function ModalForm({initial = {}, onClose, onSubmit}){
  const [form, setForm] = useState({company:'',role:'',status:'Applied',location:'',url:'',notes:'',date_applied:'', ...initial})

  useEffect(()=> setForm(f => ({...f,...initial})), [initial])

  function change(e){
    const {name,value} = e.target
    setForm(prev=> ({...prev, [name]: value}))
  }

  function submit(e){
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <form onSubmit={submit}>
          <h3>{initial.id ? 'Edit' : 'Add'} Application</h3>
          <label>Company<input name="company" value={form.company} onChange={change} required/></label>
          <label>Role<input name="role" value={form.role} onChange={change} required/></label>
          <label>Status
            <select name="status" value={form.status} onChange={change}>
              <option>Applied</option>
              <option>Interviewing</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
          </label>
          <label>Location<input name="location" value={form.location} onChange={change}/></label>
          <label>URL<input name="url" value={form.url} onChange={change}/></label>
          <label>Date Applied<input type="date" name="date_applied" value={form.date_applied || ''} onChange={change}/></label>
          <label>Notes<textarea name="notes" value={form.notes} onChange={change}></textarea></label>
          <div className="actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
