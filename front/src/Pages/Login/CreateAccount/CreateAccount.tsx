import React, { useRef, useState } from "react";
import "./CreateAccount.css"
import Logo42 from "../../../assets/42_Logo.png"
import { SHA256 } from "crypto-js"
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";
import Joi from "joi";
import validEmail from "../../../assets/validEmail";

export default function CreateAccount() {
    
    const schema = Joi.object({
        username: Joi.string().min(3).max(16).required(),
        email: Joi.string().email({ tlds: { allow: validEmail } }).required(),
        password: Joi.string().min(8).required(),
        checkPassword: Joi.string().min(8).required(),
    });
    
    const usernameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const checkpasswordInputRef = useRef(null)
    const [errorMessages, setErrorMessages] = useState({});
    const naviguate = useNavigate();

    function handleLoginForm() {

        const username = usernameInputRef.current.value;
        const email = emailInputRef.current.value;
        const password = passwordInputRef.current.value;
        const checkPassword = checkpasswordInputRef.current.value;

        // Reset error messages
        setErrorMessages(prevErrors => ({...prevErrors, username: "", email: "", password: "", checkPassword: ""}));

        // Validate input
        const { error } = schema.validate({ username, email, password, checkPassword });

        // If error, display error message
        if (error) {
            const newError = {};
            error.details.forEach(errorDetail => {
                if (errorDetail.context.key === "username")
                    newError[errorDetail.context.key] = "Nom d'utilisateur invalide";
                else if (errorDetail.context.key === "email")
                    newError[errorDetail.context.key] = "Email invalide";
                else if (errorDetail.context.key === "password")
                    newError[errorDetail.context.key] = "Mot de passe invalide";
                else if (errorDetail.context.key === "checkPassword")
                    newError[errorDetail.context.key] = "Mot de passe de vérification invalide";
            });
            setErrorMessages(prevErrors => ({...prevErrors, ...newError}));
            return;
        }

        // Check if passwords match
        if (password !== checkPassword) {
            setErrorMessages(prevErrors => ({...prevErrors, checkPassword: "Les mots de passe ne correspondent pas"}));         
            return;
        }

        // Hash password
        const hashedPassword = SHA256(password).toString();

        fetch('http://localhost:3001/auth/local', {
            method: 'POST',
			headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                auth: "REGISTER",
                username: username,
                email: email,
                password: hashedPassword,
            }),
        })
        .then(res => {
            if (res.status == 201) {
                const myProps = { name: username, email: email };
                naviguate("/register/finalization", { state: myProps });
                return;
            }
            else if (res.status == 409) { // Conflict
                const msg = res.json();
                msg.then((msg) => {
                    if (msg.message === "Username already registered.")
                        setErrorMessages(prevErrors => ({...prevErrors, username: "Le nom d'utilisateur est déjà pris"}));
                    else if (msg.message === "Email already registered.")
                        setErrorMessages(prevErrors => ({...prevErrors, email: "L'email est déjà pris"}));
                    return;
                });

            }
        });
    }

    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <Link to="/" style={{color: 'white', textDecoration: 'none'}} id="Login-backward">
                        <FontAwesomeIcon icon={faAnglesLeft} size="2x"/>
                    </Link>

                    <img className="LoginSelector-invert-effect LoginSelector-logo" src={Logo42} alt="Logo-ecole-42" />

                    <h3 className="LoginSelector-card-title">Creer un compte:</h3>
                    
                    <div className="LoginSelector-card-subtitle">

                    <form>
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="text"
                                placeholder="Nom d'utilisateur"
                                minLength={3}
                                ref={usernameInputRef}
                                autoComplete="yes"
                                required
                            />
                            {errorMessages.username && <p className="LoginSelector-error">{errorMessages.username}</p>}

                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="email"
                                minLength={5}
                                placeholder="Adresse mail"
                                ref={emailInputRef}
                                required
                            />
                            {errorMessages.email && <p className="LoginSelector-error">{errorMessages.email}</p>}
                
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="password"
                                minLength={8}
                                placeholder="Mot de passe"
                                ref={passwordInputRef}
                                required
                            />
                            {errorMessages.password && <p className="LoginSelector-error">{errorMessages.password}</p>}

                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="password"
                                minLength={8}
                                ref={checkpasswordInputRef}
                                placeholder="Confirmer"
                                required
                            />
                            {errorMessages.checkPassword && <p className="LoginSelector-error">{errorMessages.checkPassword}</p>}
            
                            <input
                                className="LoginSelector-button LoginSelector-input LoginSelector-submit Button-submit-video"
                                type="button"
                                value="Continuer"
                                onClick={e => {
                                    handleLoginForm();
                                }}
                            />

                        </form>
    
                    </div>

                </div>
            </div>
        </div>
    );
}