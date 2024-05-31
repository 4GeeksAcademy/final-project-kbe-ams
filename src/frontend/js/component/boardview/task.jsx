import React from "react"
import { Context } from "../../store/appContext.jsx"

var _temp

const Task = ({ id, label, position, icon, bref, listupdatecallback }) => {
	const 
    { language, store, actions } = React.useContext(Context),
    inputRef= React.useRef(null),
    selfRef= React.useRef(null)

  const 
    [ itemState, _scs ]= React.useState({
      id: id,
      label: label,
      inRename: false,
      editonce: false,
      icon: icon,
      upload: false,
      millistamp: Date.now()
    }),
    itemStateRef= React.useRef(itemState)

  function merge_itemState(new_state){ _scs({ ...Object.assign(itemStateRef.current, { ...new_state, millistamp: Date.now() })})}

  React.useEffect(()=>{ 
    bref[0].current[bref[1]]= {
      get: (prop)=> { return !prop ? selfRef : itemState[prop] }, 
      set: (state)=>{ merge_itemState(state) },
      cmCallback: (e)=>{handleContextualMenu(e)}
    }
  },[])

  React.useEffect(()=>{ async function handle(){

    if(selfRef.current && itemState.editonce){
      const result= await actions.objects_task_push(itemState.id, itemState.label)
      if(result) listupdatecallback()
    }

  } handle()
  },[itemState.label])

  React.useEffect(()=>{ 
    if(inputRef.current){
      inputRef.current.focus()
    }
  },[inputRef.current])
  
  // --------------------------------------------------------------- CONTEXTUAL MENU 
    
  function handleContextualMenu(e){
    switch(e.detail.id){
      case 0:
        merge_itemState({inRename: true})
        _temp= language.test(itemState.label)
        break
    }
  }

  function enterRename(){
    merge_itemState({inRename: true, editonce: true})
    _temp= language.test(itemState.label)
  }

  function handleLabelEdit(e){
    if(e.type==='blur' || (e.type==='keydown' && (e.key==='Enter' || e.key==='Escape'))){
      if(e.key==='Escape') merge_itemState({inRename: false})
      else merge_itemState({inRename: false, label: e.target.value})
    }
  }

	return (
    <div ref={selfRef} data-item="task" className="flex h-12 rounded-md bg-zinc-200 dark:bg-zinc-800">
      { itemState.inRename ?
        <input ref={inputRef} className="clearinput mx-4 text-lg my-auto text-purple-800 dark:text-accent-n" placeholder={_temp} onBlur={handleLabelEdit} onChange={handleLabelEdit} onKeyDown={handleLabelEdit}/>
        :
        <span onDoubleClick={()=>{enterRename()}} className="mx-4 text-lg my-auto">{language.test(itemState.label)}</span>
      }
		</div>
	)
}

export default Task
