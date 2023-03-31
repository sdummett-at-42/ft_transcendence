import React, { useRef } from "react";
import "./CreateAccount.css"
import Logo42 from "../../../assets/42_Logo.png"
import { SHA256 } from "crypto-js"
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

export default function CreateAccount() {

    const usernameInputRef = useRef();
    const emailInputRef =useRef();
    const passwordInputRef = useRef();
    const naviguate = useNavigate();

    function handleLoginForm() {
        const username = usernameInputRef.current.value;
        const email = emailInputRef.current.value;
        const password = passwordInputRef.current.value;

        if (!username || !password || ! email) {
            console.log("No username/password/email provided");
            return;
        }

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
                naviguate("/register/finalization");
                return;
            }
        })
    }

    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <Link to="/register" style={{color: 'white', textDecoration: 'none'}} id="Login-backward">
                        <FontAwesomeIcon icon={faAnglesLeft} size="2x"/>
                    </Link>

                    <img className="LoginSelector-invert-effect LoginSelector-logo" src={Logo42} alt="Logo-ecole-42" />

                    <h3 className="LoginSelector-card-title">Creer un compte:</h3>
                    
                    <div className="LoginSelector-card-subtitle">

                    <form>
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="text"
                                placeholder="Pseudonyme"
                                ref={usernameInputRef}
                                required
                            />

                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="email"
                                placeholder="Adresse mail"
                                ref={emailInputRef}
                                required
                            />
                
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="password"
                                placeholder="Mot de passe"
                                ref={passwordInputRef}
                                required
                            />

                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="password"
                                placeholder="Confirmer"
                                required
                            />
            
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