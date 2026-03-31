const BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, opts = {}){
  const res = await fetch(BASE + path, opts)
  if (!res.ok) throw new Error((await res.json()).error || res.statusText)
  return res.json()
}

export const api = {
  listApplications: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request('/applications' + (qs ? ('?' + qs) : ''))
  },
  createApplication: (data) => request('/applications', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)}),
  updateApplication: (id, data) => request(`/applications/${id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)}),
  deleteApplication: (id) => request(`/applications/${id}`, {method:'DELETE'}),
  stats: () => request('/stats')
}
