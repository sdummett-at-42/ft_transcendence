import { useState } from "react";
import './TwoFactor.css';

export default function TwoFactor() {
	const [otp, setOtp] = useState("");
	const [error, setError] = useState("");

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
					window.location.href = "http://localhost:5173/home";
				} else if (response.status === 401) {
					window.location.href = "http://localhost:5173/";
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
			<h2>Two Factor Authentication</h2>
			<form onSubmit={handleSubmit}>
				<label htmlFor="otp-input">Enter OTP Code:</label>
				<input
					type="text"
					id="otp-input"
					value={otp}
					onChange={(event) => setOtp(event.target.value)}
				/>
				<button type="submit">Login</button>
			</form>
			{error && <p className="error-message">{error}</p>}
		</div>
	);
}
