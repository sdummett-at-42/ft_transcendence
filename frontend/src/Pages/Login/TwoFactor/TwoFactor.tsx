import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './TwoFactor.css';

export default function TwoFactor() {
	const [otp, setOtp] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

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
					navigate("/home");
				} else if (response.status === 401) {
					navigate("/");
				} else if (response.status === 400) {
					setError("Invalid OTP code");
				}
			})
			.catch((error) => {
				console.error(error);
				setError("An error occurred. Please try again later.");
			});
	};

	return (
		<div className="auth-container">
			<h2 className="auth-h2">Two Factor Authentication</h2>
			<form
				className="auth-form"
				onSubmit={handleSubmit}
			>
				<label
					htmlFor="otp-input"
					className="auth-label"
				>
					Enter OTP Code:
				</label>
				<input
					autoComplete="off"
					type="text"
					id="otp-input"
					className="auth-input"
					value={otp}
					onChange={(event) => setOtp(event.target.value)}
				/>
				<button
					type="submit"
					className="auth-button"
				>
					Login
				</button>
			</form>
			{error && <p className="error-message">{error}</p>}
		</div>
	);
}
