import React from "react"
import { useParams } from "react-router-dom"
import Constants from "../app/constants.js"

import { Context } from "../store/appContext.jsx"

import Toolbar from "../component/boardview/toolbar.jsx"
import SidePanel from "../component/boardview/sidepanel.jsx"

import Board from "../component/boardview/board.jsx"
import ContextMenu from "../component/contextmenu/contextmenu.jsx"

import { useGlobalPointerHook } from "../effects/useGlobalPointerHook.jsx"

import Utils from "../app/utils.js"

const _READYSTATE= Object.freeze({
  check: "check",
  requireLoad: "requireload",
  loading: "loading",
  errored: "errored",
  ready: "ready"
})

/**
 *  -- Board View --
 * 
 *  Renders a board loading it from URL param 'bid' (board ID)
 *  if nothing is given, or ids doesn't get any result, we should render some custom "error, board not found" component/view
 */
const BoardView= ()=>{
  const
    { language, store, actions }= React.useContext(Context),
    [ contextMenu, set_contextMenu ]= React.useState(null),
    [ localState, set_localState ]= React.useState(-1),
    [ lastUpdate, set_lastUpdate ]= React.useState({ millistamp:0, interval:1 }),
    { bid }= useParams(),
    lastUpdateRef= React.useRef(lastUpdate),
    selfRef= React.useRef(null)

  // custom stateless React Hook I made for handling pointer behaviour
  useGlobalPointerHook()

  React.useEffect(()=>{
    if(selfRef.current) {
      window.addEventListener("k-contextmenu", onContexMenu)
      set_localState(_READYSTATE.check)
      return ()=>{
        window.removeEventListener("k-contextmenu", onContexMenu)
      }
    }
  },[self.current, bid])

  // state updates
  React.useEffect(()=> { async function handle(){
    if(localState== _READYSTATE.check){
      if(store.readyState.board) {
        console.log("clearing previous board")
        actions.clearBoard()
      } 
      actions.setNavbarBreadcumb([ 
        ["/title.dashboard", "/dashboard"]
      ])
      set_localState(_READYSTATE.requireLoad)
    }
    else if(localState== _READYSTATE.requireLoad) {
      const idnum= Number(bid??"-1")
      if(idnum > 0) {
        set_localState(_READYSTATE.loading)
        console.log("loading board")
        const result= await actions.boards_instance_get(idnum) // board gets into 'store.board'
        set_localState(result ? _READYSTATE.ready: _READYSTATE.errored)
      }
      else {
        set_localState(_READYSTATE.errored)
        console.log("invalid board id, not loading")
      }
    }
    else if(localState == _READYSTATE.loading){
      actions.setNavbarBreadcumb([ 
        ["/title.dashboard", "/dashboard"],
        ["/common.loading", null] 
      ])
    }
    else if(localState === _READYSTATE.ready){
      actions.setNavbarBreadcumb(
        store.board.workspace_id != -1 ?
        [
          ["/title.dashboard", "/dashboard"],
          [store.board.workspace.title, `/workspace/${store.board.workspace_id}`],
          [store.board.name, null]
        ] : [
          ["/title.dashboard", "/dashboard"],
          [store.board.name, null]
        ]
      )
    }
    else if(localState == _READYSTATE.errored){
      actions.setNavbarBreadcumb([ 
        ["/title.dashboard", "/dashboard"],
        ["/error.boardnotfound", null] 
      ])
    }
  } handle() },[localState])

/*
  React.useEffect(()=>{
    const last= lastUpdateRef.current?? null
    if(store.board && last){

      setTimeout(async ()=>{

        const idnum= Number(bid??"-1")

        console.log(`fetch changes, upload changes | boardid: ${bid}`)
        const res= await actions.boards_fetch(idnum, lastUpdateRef.current??0)
        //console.log(res)
        
        const new_interval= Utils.clamp((res ? lastUpdate[1]*2 : lastUpdate[1]*res*.85)|0, 250, 5000)
        set_lastUpdate({millistamp: res ? Date.now() : last.millistamp, interval: new_interval})
  
      }, last.interval)
    }
  },[lastUpdateRef.current?.interval]) 
*/

  async function onContexMenu(e){
    const props= e.detail
    set_contextMenu(null)
    if(props) {
      await Utils.waitUntil(()=>contextMenu===null)
      await Utils.wait(50)
      set_contextMenu(<ContextMenu {...props} />)
    }
  }

  return (
    <div ref={selfRef} className="flex flex-col h-full overflow-hidden relative -z-50 select-none">
      { store.readyState.pointer &&
        <>
          { localState== _READYSTATE.ready ?
            <>
              <div className="pointer-skip absolute inset-0 flex">
                <Toolbar />
                <SidePanel />
              </div>
              <Board/>
            </>
            :
            <>
            { localState== _READYSTATE.errored &&
              <div className="flex h-full">
                <div className="m-auto size-fit font-black text-red-400 text-4xl max-w-50">{language.get("error.boardnotfound")}</div>
              </div>
            }
            { localState== _READYSTATE.loading &&
              <div className="flex h-full">
                <div className="m-auto size-fit">{language.get("common.loading")}</div>
              </div>
            }
            </>
          }
        </>
      }
      { contextMenu }
    </div>
  )
}

export default BoardView