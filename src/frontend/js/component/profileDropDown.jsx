import React, {useRef, useState, useEffect} from "react"
import { useNavigate } from "react-router-dom"
import { Context } from "../store/appContext.jsx"

const ProfileDropDown= ()=>{
  const
    { store, actions }= React.useContext(Context),
    nav = useNavigate()

  
  return (
    <div className="absolute right-2 top-16 min-w-48 mr-28">
      <div className="bg-stone-200 dark:bg-dark rounded-xl p-2 flex flex-col gap-2 f-body">
          <div className="mx-2 mt-2 text-stone-600 dark:text-gray-300  text-center">
              <ul>
                  <li className="w-full">{store.userData.username}</li>
                  <li className="w-full f-body-sm text-xs">{store.userData.email}</li>
              </ul>
          </div>
          <span className="h-[2px] bg-gray-400 dark:bg-gray-700 w-full mx-auto rounded-full my-1"></span>
          <div className="flex flex-col">
              <ul className="grid gap-2">
                <button onClick={()=>{nav("/settings")}} className="text-left w-full hover:bg-violet-950 cursor-pointer px-5">Account settings</button>
                <button onClick={()=>{nav("/contact")}} className="text-left w-full hover:bg-violet-950 cursor-pointer px-5">Support</button>
              </ul>
          </div>
          <span className="h-[2px] bg-gray-400 dark:bg-gray-700 w-full mx-auto rounded-full my-1"></span>
          <div className="mb-2">
            <ul>
              <button onClick={()=>{nav("/logout")}} className="text-left w-full text-red-600 hover:bg-red-950 cursor-pointer px-5">Log Out</button>
            </ul>
          </div>
      </div>
    </div>
  )
}

export default ProfileDropDown