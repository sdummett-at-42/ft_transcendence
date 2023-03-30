import React from "react";
import "./LoginFortyTwo.css"
import Logo42 from "../../../assets/42_Logo.png"

export default function LoginFortyTwo() {

    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <img className="LoginSelector-invert-effect LoginSelector-logo" src={Logo42} alt="Logo-ecole-42" />
                    <h3 className="LoginSelector-card-title">Transcendence</h3>

                    <div className="FortyTwoLogin-center">

                        <div className="LoginSelector-card-subtitle">
                            <div className="LoginSelector-card-subtitle-word">
                                S'authentifier avec 42OAuth:
                            </div>
                        </div>

                        <div className="LoginSelector-card-subtitle">

                            <a href="http://localhost:3001/auth/42/login" className="FortyTwoLogin-button">
                                <div className="FortyTwoLogin-button-content">
                                    Se connecter
                                </div>
                            </a>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}