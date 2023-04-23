import React, { useState, useEffect } from "react";
import "./Settings.css";
import loadingGif from "../../assets/Loading.mp4";
import Popup from "../Popup/Popup.tsx";
import { UserContext } from "../../context/UserContext";
import { useContext } from "react";
import { SHA256 } from "crypto-js";

export default function Settings() {
	const { user, setLastUpdate } = useContext(UserContext);

	const [qrCode, setQrCode] = useState(null);
	const [otpCode, setOtpCode] = useState("");
	const [is2faEnabled, setIs2faEnabled] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [nameInput, setNameInput] = useState("");
	const [errorMessage, setErrorMessage] = useState({});
	const [image, setImage] = useState("");
	const [loading, setLoading] = useState(true);
	const [isDfaOpen, setDfaIsOpen] = useState(false);
	const [isDelOpen, setDelIsOpen] = useState(false);
	const [password, setPassword] = useState("");
	
	useEffect(() => {
		const blob = document.getElementById("blob");
		const maxBlobHeight = window.innerHeight * 0.5;
		
		window.onpointermove = (event: PointerEvent) => {
			const { clientX, clientY } = event;
			if (clientY < maxBlobHeight) {
				blob?.animate(
					{
						left: `${clientX}px`,
					},
					{ duration: 3000, fill: "forwards" }
				);
			} else {
				blob?.animate(
					{
						left: `${clientX}px`,
						top: `${clientY}px`,
					},
					{ duration: 3000, fill: "forwards" }
				);
			}
		};
	}, []);
			
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
		setErrorMessage((prevErrors) => ({
			...prevErrors,
			username: "",
			image: "",
			otp: "",
			password: "",
		}));
		if (!selectedFile) {
			setErrorMessage((prevErrors) => ({
				...prevErrors,
				image: "Veuillez sélectionner une image",
			}));
			return;
		}
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
				setImage("");
				setLoading(true);
			} else {
				throw new Error("Failed to upload image");
			}
		} catch (error) {
			console.error(error);
		}
	};

	function handleNameChange() {
		setErrorMessage((prevErrors) => ({
			...prevErrors,
			username: "",
			image: "",
			otp: "",
			password: "",
		}));
		if (nameInput.length === 0) {
			setErrorMessage((prevErrors) => ({
				...prevErrors,
				username: "Le nom doit contenir au moins 1 caractère",
			}));
			return;
		} else if (nameInput.length > 15) {
			setErrorMessage((prevErrors) => ({
				...prevErrors,
				username: "Le nom doit contenir au plus 15 caractères",
			}));
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
					setNameInput("");
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
		console.log(`user login method is ${user.loginMethod}`);
		if (password.length === 0 && user.loginMethod === "LOCAL") {
			setErrorMessage((prevErrors) => ({
				...prevErrors,
				password: "Veuillez entrer votre mot de passe",
			}));
			return;
		}
		// TODO: Fetch user password from database and compare it to the one entered
		// fetch("http://localhost:3001/users/me/password", {
		// 	method: "PATCH",
		// 	headers: { "Content-Type": "application/json" },
		// 	credentials: "include",
		// }).then((response) => {
		// 	console.log(response);
		// });

		fetch("http://localhost:3001/users/me", {
			method: "DELETE",
			credentials: "include",
			body: JSON.stringify({ password: SHA256(password).toString() }),
			headers: { "Content-Type": "application/json" },
		}).then((response) => {
			if (response.status === 204) {
				handleDelClose();
				window.location.href = "http://localhost:5173/";
			} else {
				console.log(`Something went wrong with account deletion`);
			}
		});
	}

	async function handleVerifyOtp() {
		setErrorMessage((prevErrors) => ({
			...prevErrors,
			username: "",
			image: "",
			otp: "",
			password: "",
		}));
		if (otpCode.length < 6 || otpCode.length > 6) {
			setErrorMessage((prevErrors) => ({
				...prevErrors,
				otp: "Le code OTP doit contenir 6 caractères",
			}));
			return;
		}
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
				handleDfaClose();
				setOtpCode("");
				// setIsQrCodeShown(false);
			} else {
				setErrorMessage((prevErrors) => ({
					...prevErrors,
					otp: "Le code OTP est invalide",
				}));
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

	const handleDfaOpen = () => {
		setDfaIsOpen(true);
		handle2faToggle();
	};

	const handleDfaClose = () => {
		setOtpCode("");
		setDfaIsOpen(false);
		setErrorMessage((prevErrors) => ({
			...prevErrors,
			username: "",
			image: "",
			otp: "",
			password: "",
		}));
	};

	const handleDelOpen = () => {
		setDelIsOpen(true);
	};

	const handleDelClose = () => {
		setPassword("");
		setDelIsOpen(false);
		setErrorMessage((prevErrors) => ({
			...prevErrors,
			username: "",
			image: "",
			otp: "",
			password: "",
		}));
	};


	return (
		<div>
			<div id="blob"></div>
			<div id="blur"></div>
			<div className="Settings">

				<div className="Settings-recap">
					<img
						src={user.profilePicture}
						alt="Photo de profil"
						className="Settings-profile-picture"
					/>
					<p>Connecté en tant que {user.name}</p>
					<button
						onClick={handleLogout}
						className="Settings-button"
					>
						Se déconnecter
					</button>
				</div>

				<div className="Settings-profile">
					<h2>Votre profil:</h2>

					<div className="Settings-profile-image">
						<label className="Settings-label" htmlFor="file-upload">
							Modifiez votre photo:
						</label>
						<div className="Settings-profile-playload">
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
						<div className="Settings-profile-image-buttons">
							<input
								type="file"
								id="Settings-file-upload"
								className="Settings-label"
								accept="image/*"
								onChange={handleFileChange}
							/>
							<button
								onClick={handleUpload}
								className="Settings-button Settings-upload-button"
							>
								Valider
							</button>
						</div>
						{errorMessage.image && <div className="Settings-error">{errorMessage.image}</div>}
					</div>

					<div className="Settings-profile-name">
						<label className="Settings-label">
							Nouveau nom:
							<input
								className="Settings-input"
								type="text"
								value={nameInput}
								placeholder={user.name}
								onChange={handleChange}
							/>
						</label>
						{errorMessage.username && <div className="Settings-error">{errorMessage.username}</div>}
						<button
							onClick={handleNameChange}
							className="Settings-button Settings-upload-button"
						>
							Mettre à jour
						</button>
					</div>
				</div>
				<div className="Settings-account">
					<h2>Sécurité</h2>
					<button
						onClick={handleDfaOpen}
						className="Settings-button"
					>
						{qrCode && !is2faEnabled
							? "Regénérer le QR code"
							: is2faEnabled
							? "Supprimer la double authentification"
							: "Activer la double authentification"}
					</button>
					<Popup isOpen={isDfaOpen} onClose={handleDfaClose}>
						{qrCode && !is2faEnabled && (
							<div className="Settings-2fa-popup">
								<h3>Scannez le QR code avec votre téléphone</h3>
								<img src={`${qrCode.base64Qrcode}`} />
								<label className="Settings-label Settings-2fa-popup-label">
									Entrez le code à 6 chiffres:
									<input
										className="Settings-input"
										type="text"
										value={otpCode}
										onChange={(event) => setOtpCode(event.target.value)}
									/>
								</label>
								{errorMessage.otp && <div className="Settings-error">{errorMessage.otp}</div>}
								<div className="Settings-2fa-popup-buttons">
									<button
										onClick={handleDfaClose}
										className="Settings-button"
									>
										Annuler
									</button>
									<button
										onClick={handleVerifyOtp}
										className="Settings-button"
									>
										Valider
									</button>
								</div>
							</div>
						)}
					</Popup>
				</div>
				<div className="Settings-delete-account">
					<h2>Suppression du compte</h2>
					<button
						onClick={handleDelOpen}
						className="Settings-button Settings-delete-account-button"
					>
						Supprimer mon compte
					</button>
					<Popup isOpen={isDelOpen}>
						<div className="Settings-delete-account-popup">
							<h3>Êtes-vous sûr de vouloir supprimer votre compte ?</h3>
							<label className="Settings-label Settings-2fa-popup-label">
									Entrez votre mot de passe:
									<input
										className="Settings-input"
										type="password"
										value={password}
										onChange={(event) => setPassword(event.target.value)}
									/>
							</label>
							{errorMessage.password && <div className="Settings-error">{errorMessage.password}</div>}
							<div className="Settings-delete-account-popup-buttons">
								<button
									onClick={handleDelClose}
									className="Settings-button"
								>
									Annuler
								</button>
								<button
									onClick={handleAccountDeletion}
									className="Settings-button Settings-delete-account-button-final"
									id={password ? "Settings-delete-button" : ""}
								>
									Supprimer
								</button>
							</div>
						</div>
					</Popup>
				</div>
			</div>
		</div>
	);
}
