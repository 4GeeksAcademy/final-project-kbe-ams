import React from "react"

import Constants from "../../app/constants.js"
import Utils from "../../app/utils.js"

import { Context } from "../../store/appContext.jsx"

import getPointerHook from "../../effects/useGlobalPointerHook.jsx"
import List from "./list.jsx"

const
  _ACTION_TYPE= { end:0, item:1, board:2 },
  _ACTION_ID= { pan:0, grab:1, resize:2 },
  _ZOOM_LEVELS= Utils.generateZoomLevels(.025, 10.0, 48, 24), // min, max, steps, 1.0 location
  _CONTEXTMENU_CALLBACK_EVENT= "k-oncontextaction"

const _READYSTATE= Object.freeze({
  check: "check",
  requireLoad: "requireload",
  loading: "loading",
  errored: "errored",
  ready: "ready"
})

/**
 *  -- Board --
 * 
 *  There was shitload of code involved in achieving this shit in React cos React sucks, it was surelly a challenge ngl
 */
const Board= ()=>{

  // #region --------------------------------------------------------------- INITIALIZATION

  const
    { language, store, actions }= React.useContext(Context),
    [ localState, set_localState ]= React.useState(-1),
    [ pointer, pointerUtils ]= getPointerHook(),
    canvasRef= React.useRef(null),
    selfRef= React.useRef(null)

  const
    [ canvasState, _scs ]= React.useState({
      action: null,
      lastaction: null,
      item: null,
      size: { x:0, y:0 },
      coords: { x:0, y:0 },
      offset: { x:0, y:0 },
      origin: { x:0, y:0, zoom: 1.0 },
      zoom: Utils.getClosestIndex(_ZOOM_LEVELS, 1.0),
      dirty: 0,
      contextmenu: -1,
      millistamp: Date.now()
    }),
    canvasStateRef= React.useRef(canvasState),
    [childItems, set_childItems]= React.useState([]),
    itemUtils= React.useRef([])

  function merge_canvasState(new_state){ _scs({ ...Object.assign(canvasStateRef.current, { ...new_state, millistamp: Date.now() })})}
  function set_currentAction(new_action){ _scs({ ...Object.assign(canvasStateRef.current, { lastaction: canvasStateRef.current.action, action: new_action, millistamp: Date.now() })})}

  React.useEffect(()=>{
    if(canvasRef.current) {
      set_localState(_READYSTATE.check)
    }
  },[canvasRef.current])

  // state updates
  React.useEffect(()=> { async function handle(){
    if(localState== _READYSTATE.check){
      merge_canvasState({
        coords: {x:store.board.origin[0], y:store.board.origin[1] },
        dirty: Constants.CANVAS_DIRTY.all
      })
      set_localState(_READYSTATE.requireLoad)
    }
    else if(localState== _READYSTATE.requireLoad) {
      set_localState(_READYSTATE.loading)
      //console.log("loading content")
      const result= await actions.objects_board_get() // content gets into 'store.content'
      set_localState(result ? _READYSTATE.ready: _READYSTATE.errored)
    }
    else if(localState == _READYSTATE.loading){
    }
    else if(localState === _READYSTATE.ready){
      merge_canvasState({ dirty: Constants.CANVAS_DIRTY.data })
    }
    else if(localState == _READYSTATE.errored){
      console.log("error getting board data")
    }
  } handle() },[localState])
  // #endregion

  // #region --------------------------------------------------------------- MOUSE BUTTONS

  // mousedown
  React.useEffect(()=>{ function handle(){
    const
      zsort= pointerUtils.getZsort(canvasRef.current),
      click= pointer.current.click,
      buttons= pointer.current.button

    // context menu open/relocate

    if(!checkAction() && zsort===0 && click.button=== Constants.MOUSE_BTN_RIGHT) {
      setContextMenu(0, click.origin)
      return
    }

    if(checkAction()) {
      set_currentAction({ type: _ACTION_TYPE.end, abort: Constants.MOUSE_BTN_RIGHT })
      return
    }
    
    if(zsort===0 || click.button=== Constants.MOUSE_BTN_MIDDLE) _process_board_click(click, buttons, zsort)
    else if(click.button!== Constants.MOUSE_BTN_MIDDLE) _process_item_click(click, buttons)

    if(canvasState.contextmenu != -1) {
      const ctxz= pointerUtils.getZsort(document.body.querySelector(`[data-mid="${canvasState.contextmenu}"]`))
      if(ctxz < 0 || ctxz === 3){
        setContextMenu(-1)
        return
      }
    }
  
  } handle() },[pointer.current.notify.onmousedown])

  // mouseup
  React.useEffect(()=>{ function handle(){
    if(checkAction()) set_currentAction({ type: _ACTION_TYPE.end, abort: false })
  } handle() },[pointer.current.notify.onmouseup])

  // mousechange (secondary clicks / click state changes)
  React.useEffect(()=>{ function handle(){
    const 
      click= pointer.current.click,
      buttons= pointer.current.button

    if(checkAction()){

      if(click.button != Constants.MOUSE_BTN_RIGHT && buttons[Constants.MOUSE_BTN_RIGHT].stage > 0) {
        set_currentAction({ type: _ACTION_TYPE.end, abort: true })
        console.log("aborting...")
        return
      }

      if(checkAction(_ACTION_TYPE.board, _ACTION_ID.pan)){
        if(buttons[Constants.MOUSE_BTN_LEFT].stage > 0 && buttons[Constants.MOUSE_BTN_MIDDLE].stage > 0) {
          set_currentAction({ type: _ACTION_TYPE.end, abort: true })
          console.log("aborting too")
          return
        }
      }
    }
  } handle() },[pointer.current.notify.onmousechange])

  /** processes a click on the board canvas */
  function _process_board_click(click, buttons, zsort){
    if(!checkAction()){
      if(click.button === Constants.MOUSE_BTN_LEFT && zsort === 0 || click.button === Constants.MOUSE_BTN_MIDDLE && zsort >= -2) {
        const 
          xhalf= store.board.xhalf, // .475, not half
          coords= canvasState.coords
        merge_canvasState({
          action: { 
            type: _ACTION_TYPE.board,
            id: _ACTION_ID.pan, 
            middle: click.button === Constants.MOUSE_BTN_MIDDLE,
            origin: click.origin,
            limit: [
                [ -xhalf.x - coords.x, xhalf.x - coords.x ],
                [ -xhalf.y - coords.y, xhalf.y - coords.y ]
              ],
            zoominv: 1 / _ZOOM_LEVELS[canvasState.zoom]
          }
        })
      }
    }
  }

  // double click
  React.useEffect(()=>{
    if(pointer.current.double.button !== -1){

      if(pointerUtils.getZsort(canvasRef.current) === 0){
        const
          xhalf= store.board.xhalf, // .475, not half
          canvasCoords= pointerToCanvasCoords(pointer.current.coords),
          new_coords= {
            x: Utils.clamp(canvasCoords.x, -xhalf.x, xhalf.x),
            y: Utils.clamp(canvasCoords.y, -xhalf.y, xhalf.y),
          }

        merge_canvasState({
          coords: new_coords,
          dirty: Constants.CANVAS_DIRTY.coords
        })
      }
    }
  },[pointer.current.notify.onmousedouble])

  function pointerToCanvasCoords(mus_coords){
    const
      cur_coords= canvasState.coords,
      rect= selfRef.current.getBoundingClientRect(),
      ratio= 1/window.innerHeight * window.innerWidth,
      viewFactor= [ window.innerWidth*.5, window.innerHeight*.5 ],
      mus_point= [ (mus_coords.x - rect.x - viewFactor[0]) * -1.0, (mus_coords.y - rect.y - viewFactor[1]) * -1.0 ],
      zoominv= 1/_ZOOM_LEVELS[canvasState.zoom]

    return {
      x: cur_coords.x + (mus_point[0] * zoominv | 0),
      y: cur_coords.y + (mus_point[1] * zoominv | 0),
    }
  }

  /** processes a click on a board item, only left/right button allowed */
  function _process_item_click(click, buttons){
    if(!checkAction()){
      if(childItems.length > 0){

        const item= itemUtils.current.find(e=>e?.get()?.current.contains(click.element)??false)
        if(item) {

          if(click.button=== Constants.MOUSE_BTN_RIGHT) {
            
            const
              node= item.get().current,
              task= node.querySelectorAll("[data-item='task']")

            console.log(task)

            let type=1

            for(let t of task){
              if(t.contains(click.element)) {
                type=2
                break
              }
            }

            setContextMenu(type, click.origin, {item, element: click.element})
            return
          }
          else if(click.button === Constants.MOUSE_BTN_LEFT){
  
            const
              node= item.get().current,
              grab= node.querySelector("[data-knob='grab']"),
              resize= node.querySelector("[data-knob='resize']")
  
            if(click.element === grab || click.element === resize){
  
              const 
                mode= grab===click.element ? _ACTION_ID.grab : _ACTION_ID.resize,
                overlay= document.body.querySelector("#board-canvas-overlay"),
                top= canvasRef.current.querySelector("#board-canvas-top"),
                ghost= node.cloneNode(true)
  
              top.appendChild(ghost)
              
              node.style.setProperty("opacity", ".5")
  
              overlay.style.setProperty("--overlay-cursor", mode===_ACTION_ID.grab ? "move": "se-resize")
              overlay.style.setProperty("--overlay-pointerevents", "auto")

              const 
                rect= item.get().current.getBoundingClientRect(),
                invzoom= 1/_ZOOM_LEVELS[canvasState.zoom]
  
              set_currentAction({
                type: _ACTION_TYPE.item,
                id: mode,
                size: { x: (rect.right - rect.x) * invzoom, y: (rect.bottom - rect.y) * invzoom },
                rect,
                half: store.board.half,
                coords: item.get(Constants.ITEMDATA.coords),
                origin: pointer.current.click.origin,
                zoom: _ZOOM_LEVELS[canvasState.zoom],
                zoominv: invzoom,
                item: [item, ghost]
              })
            }
          }
        }
      }
    }
  }
  // #endregion

  // #region --------------------------------------------------------------- MOUSE POSITION
  // drive mouse position change related tasks based on current mode (panning/moving/resizing)
  React.useEffect(()=>{
    const mus= pointer.current
    if(mus.click.button != -1){
      if(checkAction(_ACTION_TYPE.board, _ACTION_ID.pan)) {     // PANNING
  
        const 
          action= canvasState.action,
          cursor= mus.coords,
          delta= [ cursor.x - action.origin.x, cursor.y - action.origin.y]
  
        merge_canvasState({
          offset: {
            x: Utils.clamp((delta[0] * action.zoominv) | 0, action.limit[0][0], action.limit[0][1]),
            y: Utils.clamp((delta[1] * action.zoominv) | 0, action.limit[1][0], action.limit[1][1])
          },
          dirty: Constants.CANVAS_DIRTY.coords | Constants.CANVAS_DIRTY.cursor
        })
      }
      else if(checkAction(_ACTION_TYPE.item, _ACTION_ID.grab)) {     // GRABBING
        
        const 
          action= canvasState.action,
          ghost= canvasState.action.item[1],
          size= canvasState.action.size

        const
          cursor= mus.coords,
          delta= [ cursor.x - (action.origin.x - action.coords.x * action.zoom), cursor.y - (action.origin.y - action.coords.y * action.zoom)],
          new_coords= {
            x: Utils.clamp((delta[0] * action.zoominv) | 0, -action.half.x, action.half.x-size.x),
            y: Utils.clamp((delta[1] * action.zoominv) | 0, -action.half.y, action.half.y-size.y)
          }

        ghost.style.setProperty("--item-coords-x", new_coords.x + "px")
        ghost.style.setProperty("--item-coords-y", new_coords.y + "px")
      }
      else if(checkAction(_ACTION_TYPE.item, _ACTION_ID.resize)) {     // RESIZING
  
        console.log("resizing")
      }
    }

  },[pointer.current.notify.onmousemove])
  // #endregion

  // #region --------------------------------------------------------------- ACTIONS

  // action finishing
  React.useEffect(()=>{
    if(checkAction(_ACTION_TYPE.end)){
      const last= canvasState.lastaction?? {}
      const new_state= {
        action: null,
        item: null,
        offset: { x:0, y:0 },
        dirty: Constants.CANVAS_DIRTY.transform | Constants.CANVAS_DIRTY.cursor
      }
      if(!canvasState.action.abort) {
        new_state.coords= { x: canvasState.coords.x+canvasState.offset.x, y: canvasState.coords.y+canvasState.offset.y }
      }
      if(last.item) {
        const overlay= document.body.querySelector("#board-canvas-overlay")

        if(!canvasState.action.abort){
          const new_coords= {
            x: parseInt(last.item[1].style.getPropertyValue('--item-coords-x').replace("px","")),
            y: parseInt(last.item[1].style.getPropertyValue('--item-coords-y').replace("px",""))
          }
  
          last.item[0].set({
            coords: new_coords, 
            dirty: Constants.ITEM_DIRTY.coords | Constants.ITEM_DIRTY.upload
          })
        }

        last.item[0].get().current.style.removeProperty("opacity")
        last.item[1].remove()

        overlay.style.removeProperty("--overlay-cursor")
        overlay.style.removeProperty("--overlay-pointerevents")

        new_state.item=null
      }
      merge_canvasState(new_state)
    }
  },[canvasState.action])

  function checkAction(type=null, id=null){
    if(type==null && id==null) return canvasState.action !== null
    return canvasState.action ? ( type!= null ? canvasState.action.type===type : true ) && ( id!= null ? canvasState.action.id===id : true ) : false
  }
  // #endregion

  // #region --------------------------------------------------------------- ZOOM 
  // handle zoom changes
  React.useEffect(()=>{
    // close contextual menu
    if(canvasState.contextmenu != -1) setContextMenu(-1)
      
    if(pointerUtils.getZsort(canvasRef.current.parentNode) >= -1 && !canvasState.action){

      const delta= pointer.current.wheel
      
      if(delta){
        const
          cur_zoom= canvasState.zoom,
          new_zoom= delta < 0 ? cur_zoom < _ZOOM_LEVELS.length-1 ? cur_zoom+1 : cur_zoom : cur_zoom > 0 ? cur_zoom-1 : cur_zoom
  
        if(new_zoom != cur_zoom) {
  
          const
            xhalf= store.board.xhalf, // .475, not half
            cur_coords= canvasState.coords,
            mus_coords= pointer.current.coords,
            viewFactor= [ window.innerWidth*.5, window.innerHeight*.5 ],
            mus_point= [ (mus_coords.x - viewFactor[0]) * -1.0, (mus_coords.y - viewFactor[1]) * -1.0 ],

            cur_zoomcomp= 1/_ZOOM_LEVELS[cur_zoom],
            new_zoomcomp= 1/_ZOOM_LEVELS[new_zoom],
            
            cur_offset= [ mus_point[0] * cur_zoomcomp, mus_point[1] * cur_zoomcomp ],
            new_offset= [ mus_point[0] * new_zoomcomp, mus_point[1] * new_zoomcomp ],
            new_coords= {
              x: Utils.clamp((cur_coords.x + (cur_offset[0] - new_offset[0])) | 0, -xhalf.x, xhalf.x),
              y: Utils.clamp((cur_coords.y + (cur_offset[1] - new_offset[1])) | 0, -xhalf.y, xhalf.y),
            }

          merge_canvasState({
            coords: new_coords,
            zoom: new_zoom,
            dirty: Constants.CANVAS_DIRTY.coords | Constants.CANVAS_DIRTY.zoom
          })
        }
      }
    }
  },[pointer.current.notify.onmousewheel])
  // #endregion

  // #region --------------------------------------------------------------- CONTEXTUAL MENU
  
  React.useEffect(()=>{
    window.addEventListener("contextmenu", _preventDefaultContextMenu)
    window.addEventListener(_CONTEXTMENU_CALLBACK_EVENT, handleContextualAction)
    return ()=>{ 
      window.removeEventListener("contextmenu", _preventDefaultContextMenu) 
      window.removeEventListener(_CONTEXTMENU_CALLBACK_EVENT, handleContextualAction)
    }
  },[])
  
  function _preventDefaultContextMenu(e){ if(pointerUtils.getZsort(canvasRef.current) >= 0) { e.preventDefault() } }

  function setContextMenu(mid, coords, data){
    if(mid >=0){
      const detail= {
        mid,
        coords,
        mode: mid > 0 ? 1 : 0,
        eventback: _CONTEXTMENU_CALLBACK_EVENT
      }

      const detailback= {
        mid,
        coords,
        point: pointerToCanvasCoords(coords),
        ...data
      }

      if(mid === 0){
        detail.items= [
          { id:0,   label: "contextmenu.add-list",      enabled:true,     hidden:false },
          { id:1,   label: "contextmenu.add-item",      enabled:false,    hidden:false },
          null,
          { id:2,   label: "contextmenu.paste",         enabled:false,    hidden:false },
          { id:3,   label: "contextmenu.from-data",     enabled:false,    hidden:false },
          null,
          { id:4,   label: "contextmenu.settings",      enabled:true,     hidden:false },
          { id:5,   label: "contextmenu.to-origin",     enabled:true,     hidden:false },
          { id:6,   label: "contextmenu.set-origin",    enabled:true,     hidden:false },   // hide this two if user is no board admin
          { id:7,   label: "contextmenu.reset-origin",  enabled:true,     hidden:false }    // hide this two if user is no board admin
        ]
        detail.detailback= detailback
      }

      if(mid === 1){
        detail.items= [
          { id:0,   label: "contextmenu.rename-list",   enabled:true,     hidden:false },
          { id:1,   label: "contextmenu.styles-list",   enabled:false,    hidden:false },
          { id:2,   label: "contextmenu.tags-list",     enabled:false,    hidden:false },
          null,
          { id:2,   label: "contextmenu.cut",           enabled:false,    hidden:false },
          { id:3,   label: "contextmenu.copy",          enabled:true,     hidden:false },
          { id:4,   label: "contextmenu.paste-over",    enabled:false,    hidden:false },
          { id:5,   label: "contextmenu.from-data",     enabled:false,    hidden:false },
          null,
          { id:6,   label: "contextmenu.archive-list",  enabled:true,     hidden:false },
          { id:7,   label: "contextmenu.delete-list",   enabled:true,     hidden:false }
        ]
        detail.detailback= detailback
      }
 
      if(mid === 2){
        detail.items= [
          { id:0,   label: "contextmenu.change-task",   enabled:true,     hidden:false },
          { id:1,   label: "contextmenu.styles-task",   enabled:false,    hidden:false },
          { id:2,   label: "contextmenu.tags-task",     enabled:false,    hidden:false },
          null,
          { id:3,   label: "contextmenu.cut",           enabled:false,    hidden:false },
          { id:4,   label: "contextmenu.copy",          enabled:true,     hidden:false },
          { id:5,   label: "contextmenu.paste-over",    enabled:false,    hidden:false },
          { id:6,   label: "contextmenu.from-data",     enabled:false,    hidden:false },
          null,
          { id:7,   label: "contextmenu.archive-task",  enabled:true,     hidden:false },
          { id:8,   label: "contextmenu.delete-task",   enabled:true,     hidden:false }
        ]
        detail.detailback= detailback
      }

      console.log(detailback)

      merge_canvasState({contextmenu: mid})
      window.dispatchEvent(new CustomEvent("k-contextmenu", { detail }))
    }
    else {
      merge_canvasState({contextmenu: -1})
      window.dispatchEvent(new CustomEvent("k-contextmenu"))
    }
  }

  async function handleContextualAction(e){
    const 
      new_canvasState= {},
      eventdata= e.detail
      
    setContextMenu(-1)

    if(eventdata.mid===0) {
      switch(eventdata.id){
        case 0: // create a list
          const newListResult= await actions.objects_instance_list_create(eventdata.point)
          if(newListResult) new_canvasState.dirty= Constants.CANVAS_DIRTY.data
          break;
        case 1:
          break
        case 5:
          const origin= canvasState.origin
          new_canvasState.coords= { x:origin.x, y:origin.y }
          new_canvasState.zoom= Utils.getClosestIndex(_ZOOM_LEVELS, origin.zoom)
          new_canvasState.dirty= Constants.CANVAS_DIRTY.transform
          break
        case 6:
          new_canvasState.origin= { ...canvasState.coords, zoom: _ZOOM_LEVELS[canvasState.zoom] }
          new_canvasState.dirty= Constants.CANVAS_DIRTY.upload
          break
        case 7:
          new_canvasState.origin= { x:0, y:0, zoom: 1.0 }
          new_canvasState.dirty= Constants.CANVAS_DIRTY.upload
          break
      }
      merge_canvasState(new_canvasState)
    }
    else {
      eventdata.item.cmCallback(e)
    }
  }

  // #endregion
  
  // #region --------------------------------------------------------------- UPDATES
  // apply canvas changes and clear the dirty state
  React.useEffect(()=>{
    if(canvasState.dirty>0) {
      const 
        dirty= canvasState.dirty,
        size= store.board.size,
        half= store.board.half,
        originStyle= canvasRef.current.parentNode.style,
        canvasStyle= canvasRef.current.style

      if(dirty & Constants.CANVAS_DIRTY.upload){
        console.log("upload board pls")
      }

      if(dirty & Constants.CANVAS_DIRTY.data){
        if(store.content){
          const lists= store.content.lists
          if(lists){
            itemUtils.current= lists && lists.length > 0 ? Array(lists.length) : null
            const react= lists.map((e,i)=>
              <List key={`${e.id}|${e.board}`} bref={[itemUtils, i]} {...e} />
            )
            set_childItems(react)
            //console.log(`board contains ${react.length} items`)
          }
        }
        //else console.log(`empty board with id: ${store.board.id}`)
      }

      if(dirty & Constants.CANVAS_DIRTY.size){
        originStyle.setProperty("--canvas-size-x", size.x.toString() + "px")
        originStyle.setProperty("--canvas-size-y", size.y.toString() + "px")
        originStyle.setProperty("--canvas-size-x-half", half.x.toString() + "px")
        originStyle.setProperty("--canvas-size-y-half", half.y.toString() + "px")
      }

      if(dirty & Constants.CANVAS_DIRTY.zoom){
        originStyle.setProperty("--canvas-zoom", _ZOOM_LEVELS[canvasState.zoom])
      }

      if((dirty & Constants.CANVAS_DIRTY.coords) || (dirty & Constants.CANVAS_DIRTY.origin)){
        const 
          coords= canvasState.coords,
          offset= canvasState.offset

        canvasStyle.setProperty("--canvas-coords-x", ((-half.x + coords.x+offset.x)|0) + "px" )
        canvasStyle.setProperty("--canvas-coords-y", ((-half.y + coords.y+offset.y)|0) + "px" )
      }

      if(dirty & Constants.CANVAS_DIRTY.style){
      }

      if(dirty & Constants.CANVAS_DIRTY.background){
        canvasStyle.setProperty("--canvas-background", store.board.background )
      }
      
      if(dirty & Constants.CANVAS_DIRTY.cursor){
        canvasStyle.setProperty("--canvas-cursor", checkAction(_ACTION_TYPE.board, _ACTION_ID.pan) ? "grabbing" : "auto" )
      }

      merge_canvasState({dirty:0})
    }
  },[canvasState.millistamp])
  // #endregion

  // #region --------------------------------------------------------------- RETURN 
	return (
    <div ref={selfRef} id="board-canvas-wrapper" className="bg-zinc-300 dark:bg-zinc-800">
      <div id="board-canvas-origin" className="relative pointer-skip">
        <div ref={canvasRef} id="board-canvas" className="flex px-8 py-4 gap-6 border-zinc-800 dark:border-zinc-300">
          <div id="board-canvas-background">
            { store.devPrefs.devRender &&
              <>
                <div className="marker-x bg-blue-800" />
                <div className="marker-y bg-red-800" />
              </>
            }
          </div>
          <div id="board-canvas-content">
            {childItems}
          </div>
          <div id="board-canvas-top" />
        </div>
      </div>
      <div id="board-canvas-overlay" />
      { store.devPrefs.devRender && _getDevBoxElement() }
    </div>
	)

  // #endregion
  
  // #region --------------------------------------------------------------- DEVELOPER SHIT
  // dev box
  function _getDevBoxElement(){
    const
      c= canvasState,
      p= pointer.current,
      zs= pointerUtils.getZsort(canvasRef.current?.parentElement?? null),
      czs= pointerUtils.getZsort(canvasRef.current?? null)

    return (
      <div className="devbox flex flex-col absolute bottom-8 left-4 text-stone-400 py-1 px-2 pointer-events-none">
        <span>canvasState= {`x:${c.coords.x} y:${c.coords.y} ox:${c.offset.x} oy:${c.offset.y} cz:${_ZOOM_LEVELS[c.zoom]}`}</span>
        <span>pointerState= { p ?
            `x:${p.coords.x} y:${p.coords.y} b:${zs>-2?1:0} s:${zs}/${czs} c:${p.button[0].stage}|${p.button[1].stage}|${p.button[2].stage}`
            :
            "waiting for canvas ref..."
          }
        </span>
      </div>
    )
  }
  // #endregion
}

export default Board
