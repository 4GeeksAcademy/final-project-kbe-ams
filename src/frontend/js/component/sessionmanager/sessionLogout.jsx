import React from 'react'
import { useNavigate } from 'react-router-dom';
import { Context } from '../../store/appContext.jsx';

const SessionLogout = () => {
    const { store, actions }= React.useContext(Context)
    const navigate = useNavigate();
    

    const handleLogOut = async(e) =>{
        e.preventDefault();
		e.stopPropagation();

		const triedToLogOut = await actions.accounts_logout() ;
		if (triedToLogOut) {
			console.log("u just tried to log out")
			
    }}

  return (
    <div className="bg-dark w-full h-full flex items-center justify-center overflow-hidden">
					<div className="w-[960px] h-[593px] bg-w flex  justify-end items-center rounded-[5rem] relative">
						<div className="absolute justify-between text-black h-4/5 w-[36rem] m-5 flex items-center">
							
							<div className="max-w-sm mx-auto">
								<p className="text-primary-n text-xl f-body mb-10">Are you sure you want to log out?</p>
								
                                <div className='flex justify-around'>
                                    <button onClick={handleLogOut}
                                    type="submit" className="mt-5 text-dark f-body bg-transparent hover:bg-dark hover:text-white border-primary-n border-2 hover:border-dark focus:ring-4 font-medium rounded-3xl text-sm px-5 py-2.5 text-center transition-all ease-in-out duration-500">
                                        Yes
                                    </button>
                                    <button onClick= {()=>{navigate('/dashboard')}}
                                        type="submit" className="mt-5 text-white f-body bg-primary-n hover:bg-transparent hover:text-dark border-primary-n border-2 hover:border-dark focus:ring-4 font-medium rounded-3xl text-sm px-5 py-2.5 text-center transition-all ease-in-out duration-500">
                                        Go back to dashboard
                                    </button>
                                </div>
							</div>
						</div>

						<div className="absolute w-[800px] h-[800px] rounded-full bg-dark right-[60%] flex items-center"> 
							<p className="left-[55%] relative text-4xl f-body text-primary-l">Are you sure?</p>
						</div> 
					</div>
		</div>
  )
}

export default SessionLogout