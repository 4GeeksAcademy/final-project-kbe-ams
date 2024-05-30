import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext.jsx';


const Contact = () => {
    
    
    const nav = useNavigate();
    const { store, actions }= React.useContext(Context)
    
    const handleLogOut = async(e) =>{
        e.preventDefault();
        e.stopPropagation();
    
        const triedToLogOut = await actions.accounts_logout() ;
        if (triedToLogOut) {
            console.log("u just tried to log out")
            
    }}
    
  return (

    <div className="bg-dark w-full h-full flex items-center justify-center overflow-hidden text-center flex-col">
					<div className="w-[960px] h-[593px] bg-w flex  justify-end items-center rounded-[5rem] relative">
						<div className="absolute justify-between text-black h-4/5 w-[36rem] m-5 flex items-center">
							
							<form className="max-w-sm mx-auto w-4/5">
								<p className="text-primary-n text-xl f-body mb-10">Contact Us</p>
								<div className="mb-5">
									<label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"></label>
									<input type="email" 
										id="email" 
										className="focus:outline-none shadow-sm bg-primary-l border border-gray-400 text-gray-900 text-sm rounded-lg focus:border-accent-n block w-full p-2.5 placeholder:text-gray-500" 
										placeholder="Your Email" 
										required />
								</div>
								<div className="mb-5">
									<label htmlFor="text" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"></label>
									<textarea type="text" cols={4} rows={2}
										id="text" 
										className="h-[9rem] focus:outline-none shadow-sm bg-primary-l border border-gray-400 text-gray-900 text-sm rounded-lg focus:border-accent-n block w-full p-2.5 placeholder:text-gray-500" 
										placeholder="Writte here" 
										required />
								</div>
								<button type="submit" className="mt-5 text-white f-body bg-primary-n hover:bg-transparent hover:text-dark border-primary-n border-2 hover:border-dark focus:ring-4 font-medium rounded-3xl text-sm px-5 py-2.5 text-center transition-all ease-in-out duration-500">
									Send Email
								</button>
								</form>
						</div>

						<div className="absolute w-[800px] h-[800px] rounded-full bg-dark right-[60%] flex items-center"> 
							<p className="left-[60%] relative text-4xl f-body text-primary-l">Any error <br /> or question? </p>
						</div> 

					</div>

                    { store.userData &&
                        <button onClick={()=>{nav("/dashboard")}}
                                className="mt-8 f-body border rounded-[30px] px-7 py-2 bg-w text-black hover:bg-transparent hover:text-white transition duration-300 ease-in-out"
                        >
                            Return to dashboard
                        </button>
                    }
				</div>
  )
}

export default Contact