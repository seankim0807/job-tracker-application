import React from 'react'

export default function ConfirmDialog({message, onConfirm, onCancel}){
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e=>e.stopPropagation()}>
        <div className="confirm-icon">🗑️</div>
        <h3>Delete Application</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
