import React, { useRef, useState } from "react";
import "./LoginSelector.css";
import { Link, useNavigate } from "react-router-dom";
import Logo42 from "../../assets/42_Logo.png";
import { SHA256 } from "crypto-js";

export default function LoginSelector() {
	const naviguate = useNavigate();

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

		fetch("http://localhost:3001/auth/local", {
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
				naviguate("/home");
				return;
			} else if (res.status == 400) {
				setErrorMessages((prevErrors) => ({
					...prevErrors,
					password: "Mot de passe incorrect",
				}));
				// setErrorMessages(prevErrors => ({...prevErrors, login: "Mot de passe oublié ?"}));
				return;
			} else if (res.status == 404) {
				setErrorMessages((prevErrors) => ({
					...prevErrors,
					username: "Nom d'utilisateur incorrect",
				}));
				return;
			}
		});
	}

	return (
		<div className="LoginSelector-body">
			<div className="LoginSelector-card">
				<div className="LoginSelector-card-content">
					<img
						className="LoginSelector-invert-effect LoginSelector-logo"
						src={Logo42}
						alt="Logo-ecole-42"
					/>
					<h3 className="LoginSelector-card-title">Transcendence</h3>

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
							/>
							{errorMessages.username && (
								<p className="LoginSelector-error">
									{errorMessages.username}
								</p>
							)}

							<input
								className="LoginSelector-button LoginSelector-input"
								type="password"
								minLength="8"
								placeholder="Mot de passe"
								ref={passwordInputRef}
								required
								autoComplete="off"
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
							{/* {errorMessages.login && <Link to="/forgotMail" className="LoginSelector-error">{errorMessages.login}</Link>} */}
						</form>
						<div className="LoginSelector-card-subtitle">
							<a
								href="http://localhost:3001/auth/42/login"
								className="FortyTwoLogin-button"
							>
								Se connecter avec 42
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
