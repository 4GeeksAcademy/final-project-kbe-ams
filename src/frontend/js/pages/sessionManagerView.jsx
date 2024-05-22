import React from "react"
import SessionLogin from "../component/sessionLogin.jsx"

const SessionManagerView = ({ mode }) => {

	if(mode <= 1) {
		return (
			<SessionLogin mode = {mode} />
		)
	}


	return (
		<div className="w-full flex-auto text-center items-center mt-5">
			<h1>Hello world // SessionManager View // Handles Auth // mode: {mode}</h1>
		</div>
	)
}

export default SessionManagerView