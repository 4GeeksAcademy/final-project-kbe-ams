import React, {useContext, useEffect, useState} from "react"
import Constants from "../app/constants"
import SessionLogin from "../component/sessionLogin.jsx"
import SessionLogout from "../component/sessionLogout.jsx";


/* import { Context } from "../store/appContext"; */
import { useLocation, useNavigate } from "react-router-dom";

const SessionManagerView = ({ mode }) => {

	/* const { store, actions } = useContext(Context);
					const [email, setEmail] = useState("");
					const [password, setPassword] = useState("");
					const navigate = useNavigate(); */
					
	const [isSignUp, setIsSignUp] = useState(mode);
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
        setIsSignUp(mode);
    }, [location]);



					if(mode <= 1) {
						return (
							<SessionLogin mode = {mode} />
						)
					}

	return (
		<div className="w-full flex-auto text-center items-center">

			{ mode === Constants.SESSION_MODE_LOGOUT && (
				<SessionLogout/>
			)}

			{ mode === Constants.SESSION_MODE_RECOVER && (

				<div className="bg-dark w-full h-full flex items-center justify-center overflow-hidden">
					<div className="w-[960px] h-[593px] bg-w flex  justify-end items-center rounded-[5rem] relative">
						<div className="absolute justify-between text-black h-4/5 w-[36rem] m-5 flex items-center">
							
							<form className="max-w-sm mx-auto">
								<p className="text-primary-n text-xl f-body mb-10">You are about to reset your password</p>
								<div className="mb-5">
									<label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"></label>
									<input type="email" 
										id="email" 
										className="focus:outline-none shadow-sm bg-primary-l border border-gray-400 text-gray-900 text-sm rounded-lg focus:border-accent-n block w-full p-2.5 placeholder:text-gray-500" 
										placeholder="Your Email" 
										required />
								</div>
								<div className="mb-5">
									<label for="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"></label>
									<input type="password"
										id="password" 
										className="focus:outline-none shadow-sm bg-primary-l border border-gray-400 text-gray-900 text-sm rounded-lg focus:border-accent-n block w-full p-2.5 placeholder:text-gray-500" 
										placeholder="New Password" 
										required 
									 />
								</div>
								<div className="mb-5">
									<label for="repeat-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"></label>
									<input type="password" 
										id="repeat-password" 
										className=" focus:outline-none shadow-sm bg-primary-l border border-gray-400 text-gray-900 text-sm rounded-lg focus:border-accent-n block w-full p-2.5 placeholder:text-gray-500"
										placeholder="Repeat New Password" 
										required 
									/>
								</div>
								<button type="submit" className="mt-5 text-white f-body bg-primary-n hover:bg-transparent hover:text-dark border-primary-n border-2 hover:border-dark focus:ring-4 font-medium rounded-3xl text-sm px-5 py-2.5 text-center transition-all ease-in-out duration-500">
									Reset password
								</button>
								</form>
						</div>

						<div className="absolute w-[800px] h-[800px] rounded-full bg-dark right-[60%] flex items-center"> 
							<p className="left-[44%] relative text-4xl f-body text-primary-l">Forgot your password</p>
						</div> 
					</div>
				</div>
			)}

		</div>
	)
}

export default SessionManagerView