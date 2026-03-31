import React, {useEffect} from 'react'

export default function Toast({message, type='success', onDone}){
  useEffect(()=>{
    const t = setTimeout(onDone, 2800)
    return ()=>clearTimeout(t)
  },[])

  return (
    <div className={`toast toast-${type}`}>{message}</div>
  )
}
