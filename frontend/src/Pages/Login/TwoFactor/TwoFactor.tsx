import React, { useState, useContext, useEffect } from "react";
import "./TwoFactor.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";
import Loading from "../../Loading/Loading";

export default function TwoFactor() {
	const { user, isLoading, setLastUpdate } = useContext(UserContext);
	const navigate = useNavigate();
	const [otp, setOtp] = useState("");
	const [error, setError] = useState("");
	const [isShaking, setIsShaking] = useState(false);

	const handleSubmit = (event) => {
		event.preventDefault();
		fetch("http://localhost:3001/auth/2fa/validate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ otp }),
			credentials: "include",
		})
			.then((response) => {
				if (response.ok) {
					setLastUpdate(Date.now());
					navigate("/home");
				} else if (response.status === 401) {
					navigate("/");
				} else if (response.status === 400) {
					setError("Invalid OTP code");
					setIsShaking(true);
					setTimeout(() => {
						setIsShaking(false);
					}, 1000);
				}
			})
			.catch((error) => {
				console.error(error);
				setError("An error occurred. Please try again later.");
			});
	};

	useEffect(() => {
		if (!isLoading && user) navigate("/home");
	}, [user, navigate, isLoading]);

	if (isLoading || user) {
		return <Loading />;
	} else
		return (
			<div className="auth-container">
				<h2 className="auth-h2">Two Factor Authentication</h2>
				<form className="auth-form" onSubmit={handleSubmit}>
					<label htmlFor="otp-input" className="auth-label">
						Enter OTP Code:
					</label>
					<input
						autoComplete="off"
						type="text"
						id="otp-input"
						className={`auth-input ${isShaking ? "shake" : ""}`}
						value={otp}
						onChange={(event) => setOtp(event.target.value)}
						autoFocus
					/>
					<button type="submit" className="auth-button">
						Login
					</button>
				</form>
				{error && <p className="error-message">{error}</p>}
			</div>
		);
}
