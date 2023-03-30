import React from "react";
import "./Login.css"
import Logo42 from "../../assets/42_Logo.png"

export default function Login() {

    return (
        <div className="Login-body">
            <div className="Login-card">
                <div className="Login-card-content">

                    <img className="Login-invert-effect Login-logo" src={Logo42} alt="Logo-ecole-42" />
                    <h3 className="Login-card-title">Transcendence</h3>

                    <div className="Login-card-subtitle">
                        <div className="Login-card-subtitle-word">
                            S'authentifier avec 42OAuth:
                        </div>
                    </div>

                    <div className="Login-card-subtitle">

                        <a href="http://localhost:3001/auth/42/login" className="Login-button">
                            <div className="Login-button-content">
                                <div className="Login-button-text">
                                    Se connecter
                                </div>
                            </div>
                        </a>

                    </div>
                </div>
            </div>
        </div>
    );
}