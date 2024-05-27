import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/_styles.miguel.css";

function SessionLogin({ mode }) {
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
                        <h1>{isSignUp ? 'Sign In' : 'Create Account'}</h1>
                        <div className="social-icons">
                            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        {isSignUp == 1 && (
                            <>
                                <div><input type="email" placeholder="Email" /></div>
                                <div><input type="password" placeholder="Password" /></div>
                                <div><button>Login</button></div>
                                <div><a href="/recover">Forget Your Password?</a></div>
                            </>
                        )}
                        {isSignUp == 0 && (
                            <>
                                <div><input type="text" placeholder="Name" /></div>
                                <div><input type="email" placeholder="Email" /></div>
                                <div><input type="password" placeholder="Password" /></div>
                                <div><button>Sign Up</button></div>
                            </>
                        )}
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className={`toggle-panel toggle-left ${isSignUp ? 'hidden' : ''}`}>
                            <h1>Hello, Friend!</h1>
                            <p>Create an account to access all site features</p>
                            <button onClick={() => { navigate("/signup"); toggleForm(); }}>Sign up</button>
                        </div>
                        <div className={`toggle-panel toggle-right ${isSignUp ? '' : 'hidden'}`}>
                            <h1>Welcome Back!</h1>
                            <p>Enter your credentials to access all site features</p>
                            <button onClick={() => { navigate("/login"); toggleForm(); }}>Login</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SessionLogin;
