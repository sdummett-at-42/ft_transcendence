import React from "react";
import "./FortyTwoLogin.css"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import Logo42 from "../../../assets/42_Logo.png"

export default function FortyTwoLogin() {
    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <Link to="/" className="Login-backward">
                        <FontAwesomeIcon icon={faChevronLeft} size="2x" />
                    </Link>

                    <img className="LoginSelector-invert-effect LoginSelector-logo" src={Logo42} alt="Logo-ecole-42" />
                    <h3 className="Login-card-title">Se connecter avec un compte 42</h3>
                        <div className="Login-form">

                        <form>
                            <div className="Login-username">
                                Nom d'utilisateur:
                                <input type="text" name="username" required placeholder="username" />
                            </div>
                            <div className="Login-password">
                                Mot de passe:
                                <input type="password" name="password" required placeholder="password" />
                            </div>
                            <div className="Login-submit">
                                <input type="submit" value="Se connecter" />
                            </div>
                        </form>
                        </div>
                        {/* <FontAwesomeIcon icon={faEye} />
                        <FontAwesomeIcon icon={faEyeSlash} /> */}
                </div>
            </div>
        </div>
    );
}