import React, { useState } from "react"
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext.jsx";

const SideNavbar = ({workspaces, boards}) => {
  const { language }= React.useContext(Context)

    const nav = useNavigate();
   

  return (
    <div className="w-1/6 border-r-[1px] border-gray-500 flex flex-col p-3 sticky h-full overflow-auto">
				<ul>
					<li onClick={()=>nav(`/dashboard`)} className="flex items-center hover:bg-gray-800 rounded-lg cursor-pointer p-3">
						<i className="fa-solid fa-house text-sm mr-5"></i>
						<p  className="text-sm f-body">Home</p>
					</li>
				</ul>
				<div id="divider" className="w-full h-[1px] bg-gray-500 mx-auto my-2"></div>
				<p className="text-[10px] m-1">Workspaces</p>
				<ul>
					{workspaces && workspaces.map((e, i)=>{
								return <li onClick={()=>nav(`/workspace/${e.id}`)} key={`li-ws-${i}`} className="flex ite ms-center hover:bg-gray-800 rounded-lg cursor-pointer p-3">
											<p className="text-sm f-body">{language.test(e.title)}</p>
										</li>
							})}
				</ul>
				<div id="divider" className="w-full h-[1px] bg-gray-500 mx-auto my-2"></div>
				<p className="text-[10px] m-1">Boards</p>
				<ul>
					{boards && boards.map((e, i)=>{
								return <li onClick={()=>nav(`/board/${e.id}`)} key={`li-bc-${i}`} className="flex items-center hover:bg-gray-800 rounded-lg cursor-pointer p-3">
											<p className="text-sm f-body">{language.test(e.name)}</p>
										</li>	
							})}

				</ul>
    </div>
  )
}

export default SideNavbar