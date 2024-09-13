
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

export const Login = () => {
	const { store, actions } = useContext(Context);
	const navigate = useNavigate();

	async function submitform(e) {
		e.preventDefault();
		let formData = new FormData(e.target);
		let email = formData.get("email");
		let password = formData.get("password");
		console.log({ email, password });
		let logged = await actions.login(email, password);
		if (logged) navigate("/");
	}

	return (
		<div className="container mt-5">
			<div className="card p-4">
				<h3 className="text-center mb-4">Login</h3>
				<form onSubmit={submitform} className="form">
					<div className="mb-3">
						<label htmlFor="email" className="form-label">Email</label>
						<input
							type="email"
							name="email"
							className="form-control"
							id="email"
							aria-describedby="emailHelp"
							placeholder="Enter your email"
						/>
					</div>
					<div className="mb-3">
						<label htmlFor="password" className="form-label">Password</label>
						<input
							type="password"
							name="password"
							className="form-control"
							id="password"
							placeholder="Enter your password"
						/>
					</div>
					<button type="submit" className="btn btn-primary w-100">
						Log in
					</button>
					<div className="mt-3 text-center">
						<span>Don't have an account? <Link to="#">Sign up</Link></span>
					</div>
				</form>
			</div>
		</div>
	);
};
