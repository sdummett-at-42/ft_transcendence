import React, { useRef } from "react";
import "./CreateAccount.css"
import Logo42 from "../../../assets/42_Logo.png"
import { SHA256 } from "crypto-js"
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

export default function CreateAccount() {

    const usernameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const checkpasswordInputRef = useRef(null)
    const naviguate = useNavigate();

    function handleLoginForm() {

        const username = usernameInputRef.current.value;
        console.log(`username: ${username}`);
        const email = emailInputRef.current.value;
        console.log(`email: ${email}`);
        const password = passwordInputRef.current.value;
        console.log(`password: ${password}`);
        const checkPassword = checkpasswordInputRef.current.value;
        console.log(`checkPassword: ${checkPassword}`);

        if (!username || !email || !password || !checkPassword) {
            if (!username)
                console.log("No username provided");
            else if (!email)
                console.log("No email provided");
            else if (!password)
                console.log("No password provided");
            else if (!checkPassword)
                console.log("No checkPassword provided");
            return;
        }

        if (username.length < 3) {
            console.log("Username is too short");
            return;
        }

        if (!email.includes("@") || !email.includes(".") || email.length < 5) {
            console.log("Email is not valid");
            return;
        }

        if (password.length < 8 || checkPassword.length < 8) {
            console.log("Password is too short");
            return;
        }

        if (password !== checkPassword) {
            console.log("Password and checkPassword are not the same");            
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
                const myProps = { name: username, email: email };
                console.log(`myProps: ${JSON.stringify(myProps.name)}`);
                naviguate("/register/finalization", { state: myProps });
                return;
            }
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
                                minLength={3}
                                ref={usernameInputRef}
                                autoComplete="yes"
                                required
                            />

                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="email"
                                minLength={5}
                                placeholder="Adresse mail"
                                ref={emailInputRef}
                                required
                            />
                
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="password"
                                minLength={8}
                                placeholder="Mot de passe"
                                ref={passwordInputRef}
                                required
                            />

                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="password"
                                minLength={8}
                                ref={checkpasswordInputRef}
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