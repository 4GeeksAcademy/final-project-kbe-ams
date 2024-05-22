import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/_styles.miguel.css";

function SessionLogin({mode}) {
    const [isSignUp, setIsSignUp] = useState(mode);
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        setIsSignUp(mode);
    }, [location]);

    // Function to toggle between sign-up and sign-in
    const toggleForm = () => {
        setIsSignUp(!isSignUp);
    };

    return (
        <div className="session-login-container">
            <div className={`container ${isSignUp ? 'active' : ''}`} id="container">
                <div className={`form-container ${isSignUp ? 'sign-up' : 'sign-in'}`}>
                    <form>
                        <h1>{isSignUp ? 'Create Account' : 'Sign In'}</h1>
                        <div className="social-icons">
                            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        {isSignUp && <span>or use your email for registration</span>}
                        {isSignUp && <input type="text" placeholder="Name" />}
                        <input type="email" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        {isSignUp && <button>Sign Up</button>}
                        {!isSignUp && <a href="#">Forget Your Password?</a>}
                        {!isSignUp && <button>Login</button>}
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className={`toggle-panel toggle-left ${isSignUp ? 'hidden' : ''}`}>
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all of site features</p>
                            <button onClick={() => {navigate("/signup")}}>Login</button>
                        </div>
                        <div className={`toggle-panel toggle-right ${isSignUp ? '' : 'hidden'}`}>
                            <h1>Hello, Friend!</h1>
                            <p>Register with your personal details to use all of site features</p>
                            <button onClick={() => {navigate("/login")}}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SessionLogin;
