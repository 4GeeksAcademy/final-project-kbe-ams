import React from "react"
import { useNavigate } from "react-router-dom"
import { Context } from "../../store/appContext.jsx"

const NavbarBreadcumb= ()=>{
  const 
    { language, store, actions }= React.useContext(Context),
    nav= useNavigate()

  return (
    <div className="flex p-2">
      { store.siteData.breadcumb && 
        <>
          <div className="flex font-body font-bold text-xl text-stone-600 dark:text-zinc-500 select-none gap-2">
            {
              store.siteData.breadcumb.map((e,i)=>{
                const last= store.siteData.breadcumb.length -1 == i
                return (
                  <div key={`bci-${i}`} className="flex gap-1">
                    <span className="whitespace-pre font-black text-2xl text-purple-800 dark:text-accent-n scale-y-150 -mt-1">&gt;</span>
                    <button key={`ncb-${i}`} className="px-2 h-8 rounded-xl hover:bg-stone-200 dark:hover:bg-gray-800" onClick={e[1] ? ()=>{nav(e[1])} : null}>{language.test(e[0])}</button>
                  </div>
                )
              })
            }
          </div>
        </>
      }
    </div>
  ) 
}

export default NavbarBreadcumb

