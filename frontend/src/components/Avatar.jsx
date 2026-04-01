import React, {useState} from 'react'

const COLORS = ['#0d6e4f','#0e7490','#7c3aed','#b45309','#9f1239','#1d4ed8']

function getDomain(url){
  if(!url) return null
  try {
    const u = url.startsWith('http') ? url : 'https://' + url
    return new URL(u).hostname.replace('www.','')
  } catch { return null }
}

export default function Avatar({name, url}){
  const [failed, setFailed] = useState(false)
  const domain = getDomain(url)
  const color = COLORS[name.charCodeAt(0) % COLORS.length]

  if(domain && !failed){
    return (
      <img
        className="avatar avatar-img"
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        onError={()=>setFailed(true)}
      />
    )
  }

  return (
    <span className="avatar" style={{background: color}}>
      {name[0].toUpperCase()}
    </span>
  )
}
