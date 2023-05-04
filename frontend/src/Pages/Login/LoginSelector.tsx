import React, { useEffect, useRef, useState } from "react";
import "./LoginSelector.css";
import { Link, useNavigate } from "react-router-dom";
import Logo42 from "../../assets/42_Logo.png";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import Loading from "../Loading/Loading";
import { SHA256 } from "crypto-js";

export default function LoginSelector() {
	const { user, isLoading, setLastUpdate } = useContext(UserContext);
	const navigate = useNavigate();

	const usernameInputRef = useRef();
	const passwordInputRef = useRef();

	const [errorMessages, setErrorMessages] = useState({});

	function handleLoginForm() {
		const username = usernameInputRef.current.value;
		const password = passwordInputRef.current.value;

		// Reset error messages
		setErrorMessages((prevErrors) => ({
			...prevErrors,
			username: "",
			password: "",
			login: "",
		}));

		if (!username || username.length < 3 || username.length > 16) {
			setErrorMessages((prevErrors) => ({
				...prevErrors,
				username: "Nom d'utilisateur invalide",
			}));
			return;
		}

		if (!password || password.length < 8) {
			setErrorMessages((prevErrors) => ({
				...prevErrors,
				password: "Mot de passe invalide",
			}));
			return;
		}

		const hashedPassword = SHA256(password).toString();

		fetch(`${import.meta.env.VITE_BACKENDURL}/auth/local`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				auth: "LOGIN",
				username: username,
				password: hashedPassword,
			}),
		}).then((res) => {
			if (res.status == 201) {
				setLastUpdate(Date.now());
				window.location.href = '/home';
				return;
			} else if (res.status == 400) {
				setErrorMessages((prevErrors) => ({
					...prevErrors,
					password: "Mot de passe incorrect",
				}));
				return;
			} else if (res.status == 404) {
				setErrorMessages((prevErrors) => ({
					...prevErrors,
					username: "Nom d'utilisateur incorrect",
				}));
				return;
			} else if (res.status === 202) {
				navigate("/login/2fa");
			} else if (res.status === 409) {
				setErrorMessages((prevErrors) => ({
					...prevErrors,
					password: "Vous avez utilise un autre moyen de connexion",
				}));
			}
		});
	}

	const handleUsernameKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault(); // Prevent form submission on Enter key press
			const passwordInput = document.querySelector('.LoginSelector-password');
			if (passwordInput) {
			  passwordInput.focus(); // Focus the password input field
			}
		}
	};
	const handlePasswordKeyDown = (event) => {
		if (event.key === "Enter") {
			event.preventDefault(); // Prevent form submission on Enter key press
			handleLoginForm();
		}
	}
	useEffect(() => {
		if (!isLoading && user)
			navigate("/home");
	}, [user, navigate, isLoading]);

	if (isLoading || user) {
		return <Loading />;
	} else
		return (
			<div className="LoginSelector-body">
				<div className="LoginSelector-card">
					<div className="LoginSelector-card-content">
						<img
							className="LoginSelector-invert-effect LoginSelector-logo"
							src={Logo42}
							alt="Logo-ecole-42"
						/>
						<h3 className="LoginSelector-card-title">
							Transcendence
						</h3>

						<div className="LoginSelector-card-subtitle">
							<div className="LoginSelector-card-subtitle-word">
								Choisissez votre methode de connexion:
							</div>
						</div>

						<div className="LoginSelector-card-subtitle">
							<form>
								<input
									className="LoginSelector-button LoginSelector-input"
									type="text"
									placeholder="Nom d'utilisateur"
									ref={usernameInputRef}
									required
									onKeyDown={handleUsernameKeyDown}
								/>
								{errorMessages.username && (
									<p className="LoginSelector-error">
										{errorMessages.username}
									</p>
								)}

								<input
									className="LoginSelector-button LoginSelector-input LoginSelector-password"
									type="password"
									minLength="8"
									placeholder="Mot de passe"
									ref={passwordInputRef}
									required
									autoComplete="off"
									onKeyDown={handlePasswordKeyDown}
								/>
								{errorMessages.password && (
									<p className="LoginSelector-error">
										{errorMessages.password}
									</p>
								)}

								<input
									className="LoginSelector-button LoginSelector-input LoginSelector-submit"
									type="button"
									value="Se connecter"
									onClick={(e) => {
										handleLoginForm();
									}}
								/>
							</form>
							<div className="LoginSelector-card-subtitle">

								<a
									href={`${import.meta.env.VITE_BACKENDURL}/auth/42/login`}
									className="FortyTwoLogin-button"
									>
										<div className="FortyTwoLogin-button-content">
										Se connecter avec 42

										</div>
								</a>
							</div>
						</div>

						<div className="LoginSelector-card-subtitle">
							<div className="LoginSelector-card-subtitle-word">
								Vous n'avez pas de compte ?
							</div>
							<Link
								className="LoginSelector-card-subtitle-word"
								to="/register"
							>
								Inscrivez-vous
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
}
