import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Constants from "./app/constants.js"

import DevTools from "./app/devtools.jsx"

import Navbar from "./component/navbar.jsx"

import LandingView from "./pages/landingView.jsx" // Landing page when logged out (correct naming for old "home")
import SessionManagerView from "./pages/sessionManagerView.jsx" // signup / login / forgot password / logout screen / account removed screen

import SettingsView from "./pages/settingsView.jsx" // profile/account settings
//import ProfileView from "./pages/profileView.jsx" // user's public profile

import DashboardView from "./pages/dashboardView.jsx" // landing page when logged in
import WorkspaceView from "./pages/workspaceView.jsx" // workspace manager
//import TeamView from "./pages/teamView.jsx" // team manager
//import ProjectView from "./pages/projectView.jsx" // project view
import BoardView from "./pages/boardView.jsx" // board view

import Contact from "./pages/contact.jsx" //contact view

import { Redirector, NotFound_Generic, HealthCheck, CreamyFap } from "./app/internal.jsx" // redirector, generic 404, health check, paja a la crema
import GlobalListener from "./app/globalListener.jsx" // redirector, generic 404, health check, paja a la crema

import appContext, { Context } from "./store/appContext.jsx"

const 
  authBase= <Redirector url="/dashboard" replace/>,
  noAuthBase= <Redirector url="/login" replace/>

const Layout = () => {
  const 
    { store }= React.useContext(Context)

  function preventAuth(element){ return !store.userData ? element : authBase }
  function preventVisitor(element){ return store.userData ? element : noAuthBase }

  // strict means it wont accept trailing slashes, so "/settings" works while "/settings/" not
  // exact means exact, needed in some cases where we don't want "parent" routes to interfere in children ones
  return (
    <BrowserRouter>
        <DevTools />
        <Routes>
            <Route strict path="/healthcheck" element={<HealthCheck />} exact />
            <Route strict path="/creamyfap" element={<CreamyFap />} exact />
            <Route strict path="/404" element={<NotFound_Generic />} exact />
            <Route path="*" element={
              <>
              <Navbar />
              <Routes>
                  <Route path="/" element={preventAuth(<LandingView />)} exact />
                  
                  <Route strict path="/signup" element={preventAuth(<SessionManagerView mode={Constants.SESSION_MODE_SIGNUP}/>)} />
                  <Route strict path="/login" element={preventAuth(<SessionManagerView mode={Constants.SESSION_MODE_LOGIN}/>)} />
                  <Route strict path="/logout" element={preventVisitor(<SessionManagerView mode={Constants.SESSION_MODE_LOGOUT}/>)} />
                  <Route strict path="/recover" element={<SessionManagerView mode={Constants.SESSION_MODE_RECOVER}/>} />
                  <Route strict path="/farewell" element={<SessionManagerView mode={Constants.SESSION_MODE_DELETED}/>} />
      
                  <Route strict path="/settings" element={preventVisitor(<SettingsView />)} />

                  <Route strict path="/contact" element={<Contact />} />

                  <Route strict path="/dashboard" element={preventVisitor(<DashboardView />)} />
                  <Route strict path="/workspace/:wid" element={preventVisitor(<WorkspaceView />)} />
                  <Route strict path="/board/:bid" element={preventVisitor(<BoardView />)}/>
                  
                  <Route path="*" element={<Redirector url="/404" replace/>} />
              </Routes>
              </>
            } />
        </Routes>
        <GlobalListener />
    </BrowserRouter>
  )
}

export default appContext(Layout)
