import React from "react";
import "./LoginSelector.css"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import Logo42 from "../../assets/42_Logo.png"

export default function LoginSelector() {

    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <img className="LoginSelector-invert-effect LoginSelector-logo" src={Logo42} alt="Logo-ecole-42" />
                    <h3 className="LoginSelector-card-title">Transcendence</h3>

                    <div className="LoginSelector-card-subtitle">
                        <div className="LoginSelector-card-subtitle-word">
                            Chosissez votre methode de connexion:
                        </div>
                    </div>

                    <div className="LoginSelector-card-subtitle">

                        <form method="post" action="http://localhost:3001/auth/transcendence">
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="email"
                                placeholder="Adresse mail"
                                required
                            />
                
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="password"
                                placeholder="Mot de passe"
                                required
                            />
            
                            <input
                                className="LoginSelector-button LoginSelector-input LoginSelector-submit"
                                type="submit"
                                value="Se connecter"
                            />

                        </form>

                        <Link className="LoginSelector-button" to="/login/intra42">
                            <div className="LoginSelector-button-content">
                                <div className="LoginSelector-button-image">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <div className="LoginSelector-button-text">Intra 42</div>
                            </div>
                        </Link>
    
                    </div>

                    <div className="LoginSelector-card-subtitle">
                        <div className="LoginSelector-card-subtitle-word">
                            Pas de compte ?
                        </div>
                        <Link className="LoginSelector-card-subtitle-word" to="/register">
                            Creer un compte
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}