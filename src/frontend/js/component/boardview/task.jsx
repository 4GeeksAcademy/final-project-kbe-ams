import React from "react"
import { Context } from "../../store/appContext.jsx"

var _temp

const Task = ({ label, icon, bref }) => {
	const 
    { language, store, actions } = React.useContext(Context),
    itemRef= React.useRef(null)

  const 
    [ itemState, _scs ]= React.useState({
      label: label,
      inRename: false,
      icon: icon,
      millistamp: Date.now()
    }),
    itemStateRef= React.useRef(itemState)

  function merge_itemState(new_state){ _scs({ ...Object.assign(itemStateRef.current, { ...new_state, millistamp: Date.now() })})}

  React.useEffect(()=>{ 
    bref[0].current[bref[1]]= {
      get: (prop)=> { return !prop ? itemRef : itemState[prop] }, 
      set: (state)=>{ merge_itemState(state) },
      cmCallback: (e)=>{handleContextualMenu(e)}
    }
  },[])
  
  // --------------------------------------------------------------- CONTEXTUAL MENU 
    
  function handleContextualMenu(e){
    switch(e.detail.id){
      case 0:
        merge_itemState({inRename: true})
        _temp= itemState.label
        break
    }
  }

  function handleLabelEdit(e){
    if(e.type==='blur' || (e.type==='keydown' && (e.key==='Enter' || e.key==='Escape'))){
      if(e.key==='Escape') merge_itemState({inRename: false})
      else merge_itemState({inRename: false, label: e.target.value})
    }
  }

	return (
    <div ref={itemRef} data-item="task" className="flex h-12 rounded-md bg-zinc-200 dark:bg-zinc-800">
      { itemState.inRename ?
        <input className="clearinput mx-4 text-lg my-auto text-purple-800 dark:text-accent-n" defaultValue={_temp} onBlur={handleLabelEdit} onChange={handleLabelEdit} onKeyDown={handleLabelEdit}/>
        :
        <span className="mx-4 text-lg my-auto">{language.test(itemState.label)}</span>
      }
		</div>
	)
}

export default Task
