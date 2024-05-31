import React from "react"
import { useNavigate } from "react-router-dom";

import { Context } from "../store/appContext.jsx";

import SideNavbar from "../component/sideNavbar.jsx";
import BoardCard from "../component/cards/boardCard.jsx";
import WorkspaceCard from "../component/cards/workspaceCard.jsx";

const DashboardView = () => {
  const
    { store, actions }= React.useContext(Context)

  const
    [lastVisited, set_lastVisited] = React.useState([]),
    [workspaces, set_workspaces] = React.useState([]),
    [boards, set_boards] = React.useState([])

  React.useEffect(()=>{ async function handle(){
    const 
      _workspaces = await actions.workspaces_user(),
      _boards = await actions.boards_user()

    console.log("workspaces:", _workspaces)
    console.log("boards:", _boards)
      
    set_lastVisited([_workspaces?.last, _boards?.last])

    set_workspaces([ ..._workspaces?.owned??[], ..._workspaces?.active??[] ])
    set_boards([ ..._boards?.owned??[], ..._boards?.active??[] ])
    
    actions.setNavbarBreadcumb([
      ["çtitle.dashboard", "/dashboard"]
    ])
      
  } handle() },[])
	
	const handleCreateNewWorkspace = async(e) =>{
    e.preventDefault(); e.stopPropagation()

		const new_workspace = await actions.workspaces_instance_create();
		if(new_workspace) set_workspaces([new_workspace, ...workspaces]) // put new on the left
  }

	const handleCreateNewBoard = async(e) =>{
    e.preventDefault(); e.stopPropagation()

		const new_board = await actions.boards_instance_create();
		if(new_board) set_boards([new_board, ...boards]) // put new on the left
  }

	return (
		<div className="w-full bg-dark flex h-screen overflow-hidden">
{/*--------- Side NavBar --------------------------------------------------------------------------------*/}
			<SideNavbar workspaces={workspaces} boards={boards}/>

{/*--------- Show Projects -----------------------------------------------------------------------------------*/}
			<div className="p-12 w-5/6 overflow-auto">
				<div className="flex flex-col gap-5">
					{ (lastVisited[0] || lastVisited[1]) &&
					  <div>
					  	<div className="flex gap-3 items-center">
					  		<i className="fa-thin fa-clock"></i>
					  		<p className="f-body">Viewed recently</p>
					  	</div>
					  	<div id="divider" className="w-full h-[1px] bg-gray-500 mx-auto my-2"></div>
					  	<div className="flex items-center gap-10 my-4">
                <>
                  { lastVisited[0] != null && 
                    <WorkspaceCard data={lastVisited[0]} />	
                  }
                  { lastVisited[1] != null && 
                    <BoardCard data={lastVisited[1]} />	
                  }
                </>
					  	</div>
					  </div>
          }
					<div>
						<div className="flex gap-3 items-center">
							<p className="f-body">Workspaces</p>
							<div className="flex items-center ml-4">
								<button className="w-6 h-6 border-[1px] border-white rounded-md hover:bg-white hover:border-none">
									<i  onClick={handleCreateNewWorkspace}
										className="fa-regular fa-plus hover:text-black"></i>

								</button>
								<p className=" text-gray-400 ml-2">create a new workspace</p>
							</div>
						</div>
						<div id="divider" className="w-full h-[1px] bg-gray-500 mx-auto my-2"></div>
						<div className="flex items-center gap-10 my-4 w-full flex-wrap">
							
							<div onClick={handleCreateNewWorkspace} className="flex flex-col gap-3">
								<p className="ml-1 text-sm">+</p>
								<button className="w-60 h-36 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700">Create a new workspace</button>
							</div>

							{workspaces && workspaces.map((e, i)=> e ?
								<WorkspaceCard key={`wc-${i}`} data={e} /> : null
							)}
						</div>
					</div>
					<div>
						<div className="flex gap-3 items-center">
							<p className="f-body">Boards</p>
							<div className="flex items-center ml-4">
								<button className="w-6 h-6 border-[1px] border-white rounded-md hover:bg-white hover:border-none">
									<i  onClick={handleCreateNewBoard}
										className="fa-regular fa-plus hover:text-black"></i>

								</button>
								<p className=" text-gray-400 ml-2">create a new board</p>
							</div>
						</div>
						<div id="divider" className="w-full h-[1px] bg-gray-500 mx-auto my-2"></div>
						<div className="flex items-center gap-10 my-4 w-full flex-wrap">
							
							<div onClick={handleCreateNewBoard} className="flex flex-col gap-3">
								<p className="ml-1 text-sm">+</p>
								<button className="w-60 h-36 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700">Create a new board</button>
							</div>
							{boards && boards.map((e, i)=> e ?
								<BoardCard key={`bc-${i}`} data={e} /> : null	
							)}

						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default DashboardView