import React from 'react'
import { Context } from '../../store/appContext.jsx'

const ContextMenu= ({ mid, coords, items, eventback, detailback })=>{

  const
    { language }= React.useContext(Context),
    selfRef= React.useRef(null)

  // #region --------------------------------------------------------------- CONTEXTUAL MENU
  
  React.useEffect(()=>{
    window.addEventListener("contextmenu", _preventContextualMenu)
    return ()=>{ window.removeEventListener("contextmenu", _preventContextualMenu) }
  },[])
  
  React.useEffect(()=>{
    if(selfRef.current){
      const 
        selfRect= selfRef.current.getBoundingClientRect(),
        selfStyle= selfRef.current.style
        
      selfStyle.setProperty("--contextmenu-coords-x", (coords.x|0) + "px" )
      selfStyle.setProperty("--contextmenu-coords-y", (coords.y|0) + "px" )

      if(coords.x + selfRect.width > window.innerWidth) selfStyle.setProperty("--contextmenu-offset-x", -selfRect.width + "px")
      else selfStyle.removeProperty("--contextmenu-offset-x")

      if(coords.y + selfRect.height > window.innerHeight) selfStyle.setProperty("--contextmenu-offset-y", -selfRect.height + "px")
      else selfStyle.removeProperty("--contextmenu-offset-y")
    }
  },[selfRef.current])
  
  function _preventContextualMenu(e){ if(e.target=== selfRef.current || selfRef.current?.contains(e.target)) e.preventDefault() }

  function handleItemClick(id){
    window.dispatchEvent(new CustomEvent(eventback, { detail: { id, ...detailback }}))
  }

  // #endregion

  return (
    <div ref={selfRef} data-mid={mid} className="k--contextmenu rounded-md border px-1 py-1 text-sm bg-gray-200 text-black border-gray-300 dark:bg-zinc-800 dark:text-gray-200 dark:border-zinc-500">
      <ul>
        { items && items.map((e,i)=>
          e ? 
            !e.hidden && 
            <li key={`ctx-${i}`} onClick={e.enabled ? ()=>{handleItemClick(e.id)} : null} className={"min-w-40 px-1 rounded-sm py-2px my-px " + (e.enabled ? "hover:bg-gray-300 dark:hover:bg-zinc-700" : "text-gray-400 dark:text-gray-600")}>
              {language.get(e.label)}
            </li>
          :
          <li key={`ctx-${i}`} className="h-px bg-gray-300 dark:bg-zinc-500" />
        )}
      </ul>
    </div>
  )
}

export default ContextMenu