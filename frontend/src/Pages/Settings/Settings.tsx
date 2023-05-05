import React, { useState, useEffect } from "react";
import "./Settings.css";
import loadingGif from "../../assets/Loading.mp4";
import Popup from "../Popup/Popup.tsx";
import { UserContext } from "../../context/UserContext";
import { useContext } from "react";
import { SHA256 } from "crypto-js";
import Invitation from "../Invitation/Invitation";
import Blob from "../Blob/Blob";

export default function Settings() {
	const { user, setLastUpdate } = useContext(UserContext);
	if (!user)
		window.location.href = `${import.meta.env.VITE_FRONTENDURL}/`;


	// Handle name change
	const [nameInput, setNameInput] = useState("");
	
	// Handle image change
	const [loading, setLoading] = useState(true);
	const [image, setImage] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);

	// Handle 2FA
	const [qrCode, setQrCode] = useState(null);
	const [otpCode, setOtpCode] = useState("");
	const [isDfaOpen, setDfaIsOpen] = useState(false);
	
	// Handle delete account
	const [isDelOpen, setDelIsOpen] = useState(false);
	const [password, setPassword] = useState("");
	
	// Handle errors
	const [errorMessage, setErrorMessage] = useState({});
	
	// Handle blob movement
	useEffect(() => {
		const blob = document.getElementById("blob");
		
		window.onpointermove = (event: PointerEvent) => {
			const { clientX, clientY } = event;
			blob?.animate({
				left: `${clientX}px`,
				top: `${clientY}px`,
			}, { duration: 3000, fill: "forwards" });
		};
	}, []);

	// Handle user logout
	function handleLogout() {
		fetch(`${import.meta.env.VITE_BACKENDURL}/auth/logout`, {
			method: "DELETE",
			credentials: "include",
		})
			.then(() => {
				window.location.href = `${import.meta.env.VITE_FRONTENDURL}/`;
			})
			.catch((error) => {
				console.error("Logout failed: ", error);
			});
	};

	// Handle image preview
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

	// Handle image upload
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
				`${import.meta.env.VITE_BACKENDURL}/images/${user.id}`,
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
			}
			else if (response.status === 401) {
				window.location.href = "/"
				return null;
			} 
			else {
				throw new Error("Failed to upload image");
			}
		} catch (error) {}
	};

	// Return true if str is alphanumeric
	function isAlphanumeric(str: string): boolean {
		return (/^[a-zA-Z0-9]+$/.test(str));
	};

	// Handle name change
	function handleChange(event) {
		setNameInput(event.target.value);
		setErrorMessage("");
	};

	// Handle name update on Enter key press
	const handleNewNameKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleNameChange();
		}
	};

	// Handle name update
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
		} else if (!isAlphanumeric(nameInput)) {
			setErrorMessage((prevErrors) => ({
				...prevErrors,
				username: "Le nom ne doit contenir que des caractères alphanumériques",
			}));
			return;
		}
		fetch(`${import.meta.env.VITE_BACKENDURL}/users/me`, {
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
				} else if (response.status === 409) {
					setErrorMessage((prevErrors) => ({
						...prevErrors,
						username: "Le nom d'utilisateur est déjà pris",
					}));
				}
				else if (response.status === 401) {
					window.location.href = "/"
					return null;
				}
			})
			.catch((error) => {
				console.error(error);
			});
	};

	// Handle 2fa popup compared to user's 2fa status
	async function handle2faToggle() {
		if (!user.twofactorIsEnabled) {
			const response = await fetch(
				`${import.meta.env.VITE_BACKENDURL}/auth/2fa/generate`,
				{
					method: "GET",
					credentials: "include",
				}
			);
			if (response.status === 401) {
				window.location.href = "/"
				return null;
			}
			const qrCodeData = await response.json();
			setQrCode(qrCodeData);
			setOtpCode("");
			setDfaIsOpen(true);
		} else {
			const response = await fetch(
				`${import.meta.env.VITE_BACKENDURL}/auth/2fa/disable`,
				{
					method: "PATCH",
					credentials: "include",
				}
			);
			if (response.status === 401) {
				window.location.href = "/"
				return null;
			}
			setQrCode(null);
			setLastUpdate(Date.now());
		}
	};

	// Handle 2fa code when user presses Enter key
	const handle2faKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault(); // Prevent form submission on Enter key press
			handleVerifyOtp(); // Click the button
		}
	};

	// Handle 2fa code verification
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
				`${import.meta.env.VITE_BACKENDURL}/auth/2fa/verify`,
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
			else if (response.status === 401) {
				window.location.href = "/"
				return null;
			}

			const { secretVerified } = await response.json();
			if (secretVerified) {
				handleDfaClose();
				setOtpCode("");
				setLastUpdate(Date.now());
			} else {
				setErrorMessage((prevErrors) => ({
					...prevErrors,
					otp: "Le code OTP est invalide",
				}));
			}
		} catch (error) {
			console.error(error);
		}
	};

	// Handle 2fa popup close
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

	// Handle delete account
	function handleAccountDeletion() {
		if (password.length === 0 && user.loginMethod === "LOCAL") {
			setErrorMessage((prevErrors) => ({
				...prevErrors,
				password: "Veuillez entrer votre mot de passe",
			}));
			return;
		}

		fetch(`${import.meta.env.VITE_BACKENDURL}/users/me`, {
			method: "DELETE",
			credentials: "include",
			body: JSON.stringify({ password: SHA256(password).toString() }),
			headers: { "Content-Type": "application/json" },
		}).then((response) => {
			if (response.status === 204) {
				handleDelClose();
				window.location.href = `${import.meta.env.VITE_FRONTENDURL}/`;
			} 
			else if (response.status === 401) {
				window.location.href = "/"
				return null;
			}
			else {	
				setErrorMessage((prevErrors) => ({
					...prevErrors,
					password: "Mot de passe incorrect",
				}));
			}
		});
	};

	// Handle delete account popup open
	const handleDelOpen = () => {
		setDelIsOpen(true);
	};

	// Handle delete account popup close
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
			<Blob/>
			<div className="Settings">

				<div className="Settings-recap">
					<img
						src={user.profilePicture}
						alt="Photo de profil"
						className="Settings-profile-picture"
						draggable="false"
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
										draggable="false"
									/>
									)}
								</div>
							)}
						</div>
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

					<div className="Settings-profile-name">
						<label className="Settings-label">
							Nouveau nom:
							<input
								className="Settings-input"
								type="text"
								value={nameInput}
								placeholder={user.name}
								onChange={handleChange}
								onKeyDown={handleNewNameKeyDown}
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
						onClick={handle2faToggle}
						className="Settings-button"
					>
						{qrCode && !user.twofactorIsEnabled
							? "Regénérer le QR code"
							: user.twofactorIsEnabled
							? "Supprimer la double authentification"
							: "Activer la double authentification"}
					</button>
						<Popup isOpen={isDfaOpen} isClose={handleDfaClose}>
						{qrCode && !user.twofactorIsEnabled && (
							<div className="Settings-2fa-popup">
								<h3>Scannez le QR code avec votre téléphone</h3>
								<img src={`${qrCode.base64Qrcode}`} draggable="false" />
								<label className="Settings-label Settings-2fa-popup-label">
									Entrez le code à 6 chiffres:
									<input
										className="Settings-input"
										type="text"
										value={otpCode}
										onChange={(event) => setOtpCode(event.target.value)}
										onKeyDown={handle2faKeyDown}
										autoFocus
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
					<Popup isOpen={isDelOpen} isClose={handleDelClose}>
						<div className="Settings-delete-account-popup">
							<h3>
								Êtes-vous sûr de vouloir supprimer votre compte ?
							</h3>

							{user.loginMethod === "LOCAL" ? (
								<label className="Settings-label Settings-2fa-popup-label">
									Entrez votre mot de passe:
									<input
										className="Settings-input"
										type="password"
										value={password}
										onChange={(event) =>
											setPassword(event.target.value)
										}
										autoFocus
									/>
								</label>
							) : null}
							{errorMessage.password && (
								<div className="Settings-error">
									{errorMessage.password}
								</div>
							)}
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
									id={
										password
											? "Settings-delete-button"
											: user.loginMethod != "LOCAL"
											? "Settings-delete-button"
											: ""
									}
								>
									Supprimer
								</button>
							</div>
						</div>
					</Popup>
					<Invitation />
				</div>
			</div>
		</div>
	);
}
