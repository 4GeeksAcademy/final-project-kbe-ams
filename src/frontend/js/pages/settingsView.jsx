import React from "react"
import { useNavigate } from "react-router-dom"

import { Context } from "../store/appContext.jsx"

const SettingsView = () => {
  const { store, actions }= React.useContext(Context)
  const nav = useNavigate();
  
	return (
		<div className="w-full bg-dark  flex flex-col flex-auto items-center justify-center">

      { store.userData &&
      <div>

        
       
      </div>
        
        
      }      
      { store.userData ?
        <div className="flex-col flex items-center justify-center">
          <div className="mb-5">
            <p >{store.userData.displayname}, thank you for using KeQQu &lt;3</p>
            <div className="h-[1px] bg-red-500"></div>
          </div>

          <div className="flex flex-col w-[68rem] h-[42rem] border-[1px] border-white rounded-[5rem] items-center justify-center">
            <div className="flex w-4/6 m-10 items-center">
              <img className="rounded-full h-min w-5/12"
                src={store.userData.avatar} alt="no img" />
                <div className="pl-12 w-full h-full">
                  <ul className="flex h-full flex-col justify-around">
                    <li className="my-2">
                      <p className="ml-2 f-body-sm text-gray-400">username</p>
                      <div id="divider" className="h-[1px] bg-gray-500 w-full"></div>
                      <p className="ml-2 f-tittle text-lg mt-1">{store.userData.username}</p>
                    </li>
                    <li  className="my-2">
                      <p className="ml-2 f-body-sm text-gray-400">alias</p>
                      <div id="divider" className="h-[1px] bg-gray-500 w-full"></div>
                      <p className="ml-2 f-tittle text-lg mt-1">{store.userData.displayname}</p>
                    </li>
                    <li  className="my-2">
                      <p className="ml-2 f-body-sm text-gray-400">email</p>
                      <div id="divider" className="h-[1px] bg-gray-500 w-full"></div>
                      <p className="ml-2 f-tittle text-lg mt-1">{store.userData.email}</p>
                    </li>
                  </ul>
                </div>
            </div>
            <div className="w-full flex text-end">
              <button className="mt-5 f-body justify-self-end w-full text-red-500 hover:bg-transparent hover:text-white transition duration-300 ease-in-out"
                      onClick={()=>nav('/logout')}
              >
                Log out
              </button>

            </div>
          </div>
            <button onClick={()=>{nav("/dashboard")}}
              className="mt-5 f-body border rounded-[30px] px-7 py-2 bg-w text-black hover:bg-transparent hover:text-white transition duration-300 ease-in-out"
            >
                Return to dashboard
            </button>
          
          
          
          
        </div>
        :
        <p>no user logged</p>
      }
      
      { !store.userData &&
        <p >please log in</p>
      }
    </div>
	)
}

export default SettingsView