import React, { useState, useEffect } from "react";
import "./Settings.css";
import loadingGif from "../../assets/Loading.mp4";
import { UserContext } from "../../context/UserContext";
import { useContext } from "react";

export default function Settings() {
	const { user, setLastUpdate } = useContext(UserContext);

	const [qrCode, setQrCode] = useState(null);
	const [otpCode, setOtpCode] = useState("");
	const [is2faEnabled, setIs2faEnabled] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [nameInput, setNameInput] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [image, setImage] = useState("");
	const [loading, setLoading] = useState(true);

	if (!user) {
		return <p>Loading...</p>;
	}

	const handleFileChange = (event) => {
		setLoading(true);
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onloadend = () => {
			setImage(reader.result);
			setSelectedFile(event.target.files[0]);
			setLoading(false);
		};
	};

	const handleUpload = async () => {
		const formData = new FormData();
		formData.append("image", selectedFile);
		try {
			const response = await fetch(
				`http://localhost:3001/images/${user.id}`,
				{
					method: "PATCH",
					credentials: "include",
					body: formData,
				}
			);
			if (response.ok) {
				setLastUpdate(Date.now());
				alert("Image updated successfully!");
			} else {
				throw new Error("Failed to upload image");
			}
		} catch (error) {
			console.error(error);
		}
	};

	function handleNameChange() {
		if (nameInput.length === 0) {
			setErrorMessage("Name should be 1 character or more");
			return;
		} else if (nameInput.length > 15) {
			setErrorMessage("Name should not exceed 15 characters");
			return;
		}
		fetch("http://localhost:3001/users/me", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				name: nameInput,
			}),
		})
			.then(async (response) => {
				if (response.ok) {
					setLastUpdate(Date.now());
				} else {
					console.log(await response.json());
					throw new Error("Failed to update name");
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}

	function handleChange(event) {
		setNameInput(event.target.value);
		setErrorMessage("");
	}

	function handlePasswordChange() {
		console.log("handlePasswordChange");
		// TODO: Implement password change
	}

	function handleLogout() {
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

			<h2>Paramètres</h2>
			<img
				src={user.profilePicture}
				alt="Photo de profil"
				className="Settings-profile-picture"
			/>
			<p>Connecté en tant que {user.name}</p>

			<div className="Settings-profile">
				<h2>Votre profil:</h2>

				<div className="Settings-profile-image">
					<label htmlFor="file-upload">
						Modifiez votre photo de profil:
					</label>
					<div>
						{loading ? (
							<video
								src={loadingGif}
								autoPlay
								loop
								muted
								className="Settings-profile-video-playload"
							/>
						) : (
							<div>
								{image && (
									<img
										src={image}
										alt="Nouvelle image de profil"
										className="Settings-profile-image-playload"
									/>
								)}
							</div>
						)}
					</div>
					<br />
					<input
						type="file"
						id="file-upload"
						accept="image/*"
						onChange={handleFileChange}
					/>
					<br />
					<button onClick={handleUpload}>Upload</button>
				</div>

				<div>
					<label>
						Name:
						<input
							type="text"
							value={nameInput}
							onChange={handleChange}
							/>
					</label>
					{errorMessage && <div>{errorMessage}</div>}
					<button onClick={handleNameChange}>Change Name</button>
				</div>
			</div>
			<div className="Settings-account">
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
		</div>
	);
}
