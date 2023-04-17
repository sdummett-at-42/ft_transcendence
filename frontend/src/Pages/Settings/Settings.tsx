import { useState, useEffect } from "react";
import "./Settings.css";

export default function Settings() {
	const [user, setUser] = useState(null);
	const [qrCode, setQrCode] = useState(null);
	const [otpCode, setOtpCode] = useState("");
	const [is2faEnabled, setIs2faEnabled] = useState(false);

	useEffect(() => {
		async function fetchUser() {
			const response = await fetch("http://localhost:3001/users/me", {
				method: "GET",
				credentials: "include",
			});
			const userData = await response.json();
			setUser(userData);
			setIs2faEnabled(userData.twofactorIsEnabled);
		}

		fetchUser();
	}, []);

	if (!user) {
		return <p>Loading...</p>;
	}

	function handleNameChange() {
		console.log("handleNameChange");
		fetch("http://localhost:3001/users/me", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				name: user.name,
			}),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to update name");
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function handlePasswordChange() {
		console.log("handlePasswordChange");
		// TODO: Implement password change
	}

	function handleLogout() {
		console.log("handleLogout");
		fetch("http://localhost:3001/auth/logout", {
			method: "DELETE",
			credentials: "include",
		})
			.then(() => {
				window.location.href = "http://localhost:5173/";
			})
			.catch((error) => {
				console.error("Logout failed: ", error);
			});
	}

	function handleAccountDeletion() {
		console.log("handleAccountDeletion");
		fetch("http://localhost:3001/users/me", {
			method: "DELETE",
			credentials: "include",
		}).then((response) => {
			window.location.href = "http://localhost:5173/";
		});
	}

	async function handleVerifyOtp() {
		try {
			const response = await fetch(
				"http://localhost:3001/auth/2fa/verify",
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ otp: otpCode }),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to verify OTP code");
			}

			const { secretVerified } = await response.json();
			if (secretVerified) {
				setIs2faEnabled(true);
				setOtpCode("");
				alert("OTP code verified successfully!");
				// setIsQrCodeShown(false);
			} else {
				alert("Invalid OTP code, please try again.");
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function handle2faToggle() {
		if (!is2faEnabled) {
			const response = await fetch(
				"http://localhost:3001/auth/2fa/generate",
				{
					method: "GET",
					credentials: "include",
				}
			);
			const qrCodeData = await response.json();
			setQrCode(qrCodeData);
			setOtpCode("");
			// setIsQrCodeShown(true);
		} else {
			const response = await fetch(
				"http://localhost:3001/auth/2fa/disable",
				{
					method: "PATCH",
					credentials: "include",
				}
			);
			setIs2faEnabled(false);
			// setIsQrCodeShown(false);
			setQrCode(null);
		}
	}

	return (
		<div className="Settings">
			<h2>Settings</h2>
			<p>Logged in as {user.name}</p>
			<div>
				<label>
					Name:
					<input
						type="text"
						value={user.name}
						onChange={(event) =>
							setUser({ ...user, name: event.target.value })
						}
					/>
				</label>
				<button onClick={handleNameChange}>Change Name</button>
			</div>
			<button onClick={handleLogout}>Logout</button>
			<button onClick={handleAccountDeletion}>Delete Account</button>
			{qrCode && !is2faEnabled && (
				<div>
					<img src={`${qrCode.base64Qrcode}`} />
					<label>
						OTP Code:
						<input
							type="text"
							value={otpCode}
							onChange={(event) => setOtpCode(event.target.value)}
						/>
					</label>
					<button onClick={handleVerifyOtp}>Verify</button>
				</div>
			)}
			<button onClick={handle2faToggle}>
				{qrCode && !is2faEnabled
					? "Regenerate"
					: is2faEnabled
					? "Disable 2FA"
					: "Enable 2FA"}
			</button>
		</div>
	);
}
