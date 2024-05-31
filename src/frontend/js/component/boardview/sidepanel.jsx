import React from 'react'

import Constants from "../../app/constants.js"
import { Context } from "../../store/appContext.jsx"

import useClickDrag from '../../effects/useClickDrag.jsx'
import Utils from '../../app/utils.js'

const SidePanel=()=>{

  const
    { language }= React.useContext(Context),
    [ openState, set_openState ]= React.useState(true),
    [ panelSize, set_panelSize ]= React.useState({
      size: window.innerWidth*.25,
      offset: 0
    }),
    resizeRef= React.useRef(null),
    selfRef= React.useRef(null),
    [dragEffect, dragState]= useClickDrag(Constants.MOUSE_BTN_LEFT, resizeRef, selfRef)

  React.useEffect(()=>{
    if(dragEffect.delta) {
      console.log(dragEffect.delta[0])
      set_panelSize(Object.assign(panelSize, {offset:-dragEffect.delta[0]}))
    }
  },[dragEffect])

  React.useEffect(()=>{
    if(!dragState) set_panelSize({size: Utils.clamp(panelSize.size + panelSize.offset, window.innerWidth*.15, window.innerWidth*.45), offset:0})
  },[dragState])

  return (
    <div ref={selfRef} className={"k--board-sidepanel k--bg-boardpanels pointer-events-auto" + (openState ? " open" : "") }
      style={{
        "--sidepanel-size-x":Utils.clamp((panelSize.size+panelSize.offset), window.innerWidth*.15, window.innerWidth*.45) + "px",
        "--sidepanel-closemargin-x":-(panelSize.size+panelSize.offset) + "px"
        }}>
      
      <div className="k--sidepanel-handles flex flex-col w-5 h-full text-xl">
        { openState ?
        <>
          <button onClick={()=>{set_openState(!openState)}} className="k--boardpanels-btn-discrete min-h-12 flex mx-1">
            <i className="fa fa-solid fa-square-caret-right scale-y-150 my-auto" />
          </button>
          <div ref={resizeRef} className="k--boardpanels-btn-discrete k--sidepanel-resizer flex h-full cursor-w-resize">
            <i className="fa fa-solid fa-grip-lines-vertical mx-2 my-auto" />
          </div>
        </>
          :
          <button onClick={()=>{set_openState(!openState)}} className="k--boardpanels-btn-discrete k--sidepanel-resizer flex h-full" />
        }
      </div>

      <div className="k--sidepanel-body flex flex-col w-full pr-3">

        <div className="w-full min-h-12 border-b border-zinc-700" />

        <div className="flex flex-col h-full pl-2 pr-4 py-2 gap-2 overflow-y-scroll hidescroll-y">
          <div className="flex flex-col">
            <h2 className="font-bold text-xl">{language.get("common.description")}:</h2>
            <textarea type="text" resize="both" className="bg-transparent text-sm text-zinc-400" placeholder={language.get("placeholder.description")}/>
          </div>
          <div className="flex justify-between mx-6 font-bold text-xl">
            <button className="k--boardpanels-btn"><i className="fa fa-solid fa-book text-xl" /></button>
            <button className="k--boardpanels-btn"><i className="fa fa-regular fa-eye text-xl" /></button>
            <button className="k--boardpanels-btn"><i className="fa fa-regular fa-bookmark text-xl" /></button>
          </div>
          <div className="bg-zinc-700 min-h-px w-full" />
          <div className="flex flex-col mx-2 gap-2">
            <SidePanelExpandable label={language.get("board.common.tags")} icon="fa-solid fa-tag">
              { Array.from({length:8}).map((e,i)=>
                <span key={`e-${i}`}>eat {i+1} {i==0?"dick":"dicks"}</span>
              )}
            </SidePanelExpandable>
            <SidePanelExpandable label={language.get("board.common.styles")} icon="fa-solid fa-swatchbook">
              { Array.from({length:16}).map((e,i)=>
                <span key={`e-${i}`}>mount {i+1} {i==0?"horse":"horses"}</span>
              )}
            </SidePanelExpandable>
            <SidePanelExpandable label={language.get("board.common.items")} icon="fa-solid fa-cube">
              { Array.from({length:32}).map((e,i)=>
                <span key={`e-${i}`}>shot {i+1} {i==0?"kid":"kids"}</span>
              )}
            </SidePanelExpandable>
          </div>
          <div className="bg-zinc-700 h-px w-full" />
          <div className="flex flex-col mx-2 gap-2">
            <SidePanelButton label={language.get("panel.boardsettings.title")} icon="fa-solid fa-gear" />
            <SidePanelButton label={language.get("panel.announce.title")} icon="fa-solid fa-bullhorn" />
          </div>
        </div>
        <div className="w-full min-h-12 border-t border-zinc-700" />
      </div>
    </div>
  )
}

export default SidePanel

const SidePanelExpandable=({label, icon, expand, children})=>{
  const [ expanded, set_expanded ]= React.useState(expand ? true : false)
  
  return (
    <div className="k--sidepanel-expandable">
      <button className="k--boardpanels-btn flex w-full text-xl justify-between" onClick={()=>{set_expanded(!expanded)}}>
        <div className="flex gap-2">
          <i className={`fa ${icon} text-md my-auto`} />
          {label}
        </div>
        <i className={"fa fa-solid text-sm my-auto" + (expanded ? " fa-square-caret-up" : " fa-square-caret-down")} />
      </button>
      { expanded &&
        <div className="flex flex-col bg-black bg-opacity-15 px-4 mt-2 mr-4 py-2 rounded-lg border border-zinc-900">
          {children}
        </div>
      }
    </div>
  )
}

const SidePanelButton=({label, icon})=>{
  return (
    <button className="k--boardpanels-btn k--btn-icon-left flex w-full text-xl justify-between">
      <i className="fa fa-solid my-auto text-md fa-chevron-left" />
      <div className="flex gap-2">
        {label}
        <i className={`fa ${icon} text-md my-auto`} />
      </div>
    </button>
  )
}