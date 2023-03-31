import React, { useRef } from "react";
import "./CreateAccount.css"
import Logo42 from "../../../assets/42_Logo.png"
import bcrypt from "bcryptjs"
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

const salt = bcrypt.genSaltSync(10);

export default function CreateAccount() {

    const usernameInputRef = useRef();
    const emailInputRef =useRef();
    const passwordInputRef = useRef();

    function handleLoginForm() {
        const username = usernameInputRef.current.value;
        const email = emailInputRef.current.value;
        const password = passwordInputRef.current.value;

        if (!username || !password || ! email) {
            console.log("No username/password/email provided");
            return;
        }

        const hashedPassword = bcrypt.hashSync(password, salt);

        fetch('http://localhost:3001/auth/local', {
            method: 'POST',
            body: JSON.stringify({
                auth: "REGISTER",
                username: username,
                email: email,
                password: hashedPassword,
            }),
        })
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
                                type="submit"
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