import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../styles/_styles.miguel.css";
import { Context } from "../../store/appContext";

function SessionLogin({ mode }) {
    const { store, actions } = useContext(Context);

    const [isSignUp, setIsSignUp] = useState(mode);
    const location = useLocation();
    const navigate = useNavigate();

    //--- inputs ----------------------------------
    const [username, setUsername] = useState("");
	const [displayname, setDisplayname] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState("true");

    const validarEmail = (email) => {
		const verifyEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return verifyEmail.test(email);
	  }
    

    const handleLogIn = async(e) =>{
        e.preventDefault();
		e.stopPropagation();
		
		console.log(email, password)

        const account = email;
		const triedToLogin = await actions.accounts_login(account, password, remember);
		if (triedToLogin) {
			 navigate("/dashboard") 
			console.log(store)
    }} 

    const handleSignUp = async(e) =>{
        e.preventDefault();
		e.stopPropagation();
		
		console.log(email, password)

        if (!validarEmail(email)) {
			alert("Por favor, introduce un email válido.");
			return;
		  }

		const triedToSignUp = await actions.accounts_signup(username, displayname, email, password, remember);
		if (triedToSignUp) {
			navigate("/login") 
			console.log(store)
    }}
    //------------------------------------------

    useEffect(() => {
        setIsSignUp(mode);
    }, [location]);

    // Function to toggle between sign-up and sign-in
    const toggleForm = () => {
        setIsSignUp(!isSignUp);
    };

    return (
        <div className="session-login-container bg-dark h-full">
            <div className={`container ${isSignUp ? 'active' : ''}`} id="container">
                <div className={`form-container ${isSignUp ? 'sign-up' : 'sign-in'}`}>
                    <form>
                        <h1 className="text-b f-body">{isSignUp ? 'Log In' : 'Create an Account'}</h1>
                        <div className="social-icons">
                            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        {isSignUp == 1 && (
                            <>
                                <div className="w-5/6 mb-2">
                                    <input className="text-black"
                                            type="email" 
                                            value={email}   
                                            onChange={(e)=> setEmail(e.target.value)}                                   
                                            placeholder="Email" />
                                    <input className="text-black"
                                            type="password"  required
                                            value={password}
                                            onChange={(e)=> setPassword(e.target.value)}
                                            placeholder="Password"
                                    />
                                </div>
                                <button type="button" className="f-body bg-primary-n border-[1px] border-primary-n hover:bg-transparent hover:text-black transition-all ease-in-out duration-500"
                                    onClick={handleLogIn} >
                                        Login
                                </button>
                                <div className="mt-1"><a className="f-body-sm" 
                                href="/recover">Forgot Your Password?</a></div>
                            </>
                        )}
                        {isSignUp == 0 && (
                            <>
                                <div className="w-5/6 mb-2">
                                    <input className="text-black"
                                            type="text" 
                                            value={username}
                                            onChange={(e)=> {setUsername(e.target.value);
                                                                setDisplayname(e.target.value);} 
                                            }
                                            placeholder="Name" 
                                    />
                                    <input className="text-black"
                                            type="email" 
                                            value={email}
                                            onChange={(e)=> setEmail(e.target.value)}
                                            placeholder="Email" 
                                    />
                                    <input className="text-black"
                                            type="password" 
                                            value={password}
                                            onChange={(e)=> setPassword(e.target.value)}
                                            placeholder="Password" 
                                    />
                                </div>
                                <button type="button" className="f-body bg-primary-n border-[1px] border-primary-n hover:bg-transparent hover:text-black transition-all ease-in-out duration-500"
                                    onClick={handleSignUp}>
                                    Sign Up
                                </button>
                            </>
                        )}
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className={`toggle-panel toggle-left ${isSignUp ? 'hidden' : ''}`}>
                            <h5 className="f-body text-xl">Don't have an account?</h5>
                            <p className="f-body-sm">Create an account to access all site features</p>
                            <button className=" f-body bg-transparent border-[1px] border-black text-b hover:bg-primary-n hover:text-white transition-all ease-in-out duration-500" 
                            onClick={() => { navigate("/signup"); toggleForm(); }}>Sign up</button>
                        </div>
                        <div className={`toggle-panel toggle-right ${isSignUp ? '' : 'hidden'}`}>
                            <h5 className="f-body text-xl">You already have an account?</h5>
                            <p className="f-body-sm">Enter your credentials to access all site features</p>
                            <button className="f-body bg-transparent border-[1px] border-black text-b hover:bg-primary-n hover:text-white transition-all ease-in-out duration-500" 
                                    onClick={() => { navigate("/login"); toggleForm(); }}>Login</button>
                        </div>
                    </div>
                </div>
            </div>
		</div>
    );
}

export default SessionLogin;