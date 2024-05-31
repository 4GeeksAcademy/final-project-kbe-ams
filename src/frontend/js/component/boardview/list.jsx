import React from "react"
import Constants from "../../app/constants.js"

import { Context } from "../../store/appContext.jsx"
import getPointerHook from "../../effects/useGlobalPointerHook.jsx"

import Task from "./task.jsx"

var _temp

const List = ({id, title, coords, users, tasks, tags, styles, bref}) => {
  
  // --------------------------------------------------------------- INITIALIZATION 

	const 
    { language, store, actions } = React.useContext(Context),
    [ pointer, pointerUtils ]= getPointerHook(),
    [ localTasks, set_localTasks ]= React.useState(tasks),
    [ renameState, set_renameState ]= React.useState(false),
    itemRef= React.useRef(null)

  const 
    [ itemState, _scs ]= React.useState({
      title: title,
      inRename: false,
      coords: { x:coords.x, y:coords.y },
      offset: { x:0, y:0 },
      size: { x:"fit-content", y:"fit-content" },
      dirty: 0,
      millistamp: Date.now()
    }),
    itemStateRef= React.useRef(itemState),
    [ childItems, set_childItems ]= React.useState([]),
    itemUtils= React.useRef([])
  
  function merge_itemState(new_state){ _scs({ ...Object.assign(itemStateRef.current, { ...new_state, millistamp: Date.now() })})}

  React.useEffect(()=>{ 
    bref[0].current[bref[1]]= {
      get: (prop)=> { return !prop ? itemRef : itemState[prop] }, 
      set: (state)=>{ merge_itemState(state) },
      cmCallback: (e)=>{handleContextualMenu(e)}
    }
    merge_itemState({dirty:Constants.ITEM_DIRTY.all | Constants.ITEM_DIRTY.data})
  },[])

  // --------------------------------------------------------------- DIRTY UPDATES
  
  // apply canvas position changes
  React.useEffect(()=>{
    if(itemState.dirty != 0){
      const itemStyle= itemRef.current.style

      if(itemState.dirty & Constants.ITEM_DIRTY.upload){
        console.log("upload data pls")
      }

      if(itemState.dirty & Constants.ITEM_DIRTY.data){
        
        if(localTasks){

          console.log("ok updating")
            
          itemUtils.current= localTasks.length > 0 ? Array(localTasks.length) : null
          const react= localTasks.map((e,i)=>
            <Task key={`${e.id}|${e.list}`} bref={[itemUtils, i]} {...e} />
          )

          console.log(react)

          set_childItems(react)
          //console.log(`list contains ${react.length} tasks`)
        }
        //else console.log(`empty list with id: ${id}`)
      }

      if(itemState.dirty & Constants.ITEM_DIRTY.coords){
        itemStyle.setProperty("--item-coords-x", itemState.coords.x + "px" )
        itemStyle.setProperty("--item-coords-y", itemState.coords.y + "px" )
      }
  
      if(itemState.dirty & Constants.ITEM_DIRTY.size){
        itemStyle.setProperty("--item-size-x", itemState.size.x + "px")
        itemStyle.setProperty("--item-size-y", itemState.size.y + "px")
      }
  
      if(itemState.dirty & Constants.ITEM_DIRTY.style){
      }
      
      if(itemState.dirty & Constants.ITEM_DIRTY.cursor){
      }
  
      merge_itemState({dirty:0})
    }
  },[itemState.millistamp])
  
  // --------------------------------------------------------------- CONTEXTUAL MENU 
    
  async function handleContextualMenu(e){

    const item= itemUtils.current.find(x=>x?.get()?.current.contains(e.detail.element)??false)
    if(item) {
      item.cmCallback(e)  
    }
    else {
      switch(e.detail.id){
        case 0:
          merge_itemState({inRename: true})
          _temp= language.test(itemState.title)
          break
        case 1:
          break
        case 2:
          break
        case 3:
          const archiveResult= await actions.pushListData(id, {archived: !itemState.archived})
          if (archiveResult) merge_itemState({dirty: Constants.ITEM_DIRTY.data})
          else console.log("error archiving the list")
          break
        case 4:
          const removeResult= await actions.deleteList(id)
          if (removeResult) merge_itemState({dirty: Constants.ITEM_DIRTY.data})
          else console.log("error deleting the list")
          break
      }
    }
  }

  // --------------------------------------------------------------- BUTTON HANDLES

  async function handleAddRowButton(e) {
    const task= await actions.objects_instance_task_create(id)
    if(task) set_localTasks(localTasks.concat(task))
    merge_itemState({dirty:Constants.ITEM_DIRTY.data})
  }

  function handleBuzzButton(e) {
    console.log("buzz button")
  }

  function handleStylesButton(e) {
    console.log("styles button")
  }

  function handleMenuButton(e) {
    console.log("menu button")
  }

  function handleTitleEdit(e){
    if(e.type==='blur' || (e.type==='keydown' && (e.key==='Enter' || e.key==='Escape'))){
      if(e.key==='Escape') merge_itemState({inRename: false})
      else merge_itemState({inRename: false, title: e.target.value, dirty: Constants.ITEM_DIRTY.upload})
    }
  }

  // --------------------------------------------------------------- RETURN 

	return (
		<div ref={itemRef} data-item="list" className="k--list k--ghostifyable h-min min-w-80 rounded-lg cursor-auto bg-zinc-100 text-gray-700 dark:bg-zinc-900 dark:text-white">
      <div className="flex flex-col h-full justify-between">
        <div>
          <button data-knob="grab" className="devknob w-full h-6 cursor-move pointer-skip-below text-gray-400 dark:text-zinc-700 overflow-hidden">
            <div className="w-fit mx-auto my-auto">
              <i className="-translate-y-1 fa fa-solid fa-grip-lines text-2xl" />
            </div>
          </button>
          { itemState.inRename ?
            <input className="clearinput mx-4 h-8 font-bold text-xl bg-black px-1 rounded-md text-purple-800 dark:text-accent-n" defaultValue={_temp} onKeyDown={handleTitleEdit} onChange={handleTitleEdit} onBlur={handleTitleEdit} />
            :
            <h3 className="mx-4 h-8 font-bold text-xl" >{language.test(itemState.title)}</h3>
          }
          <div className="flex flex-col m-2 gap-2">
            {childItems}
          </div>
        </div>
        <div className="flex flex-row justify-between h-6 relative text-lg text-gray-400 dark:text-zinc-600">
          <button className="flex hover:text-gray-600 dark:hover:text-zinc-500" onClick={handleAddRowButton}>
            <i className="mx-2 mb-2 fa fa-solid fa-plus my-auto" />
            <span className="-mt-1.5">{language.get("board.list.btn-additem")}</span>
          </button>
          <div className="flex">
            <div className="flex mr-4 gap-3">
              <ListIconButton icon="fa-solid fa-bell-concierge" onClick={handleBuzzButton} />
              <ListIconButton icon="fa-solid fa-palette" onClick={handleStylesButton} />
              <ListIconButton icon="fa-solid fa-bars" onClick={handleMenuButton} />
            </div>
            <div className="-mt-1 relative">
              <i className="fa fa-solid fa-angles-right my-auto rotate-45 text-2xl" />
              <button data-knob="resize" className="devknob absolute cursor-se-resize size-7 right-0 bottom-0" />
            </div>
          </div>
        </div>
      </div>
		</div>
	)
}

export default List

const ListIconButton= ({ icon, onClick})=>{
  return (
    <button className="flex hover:text-gray-600 dark:hover:text-zinc-400" onClick={onClick}>
      <i className={"fa " + icon} />
    </button>
  )
}
