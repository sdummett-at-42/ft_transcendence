import React from "react";
import "./LoginFortyTwo.css"
import Logo42 from "../../../assets/42_Logo.png"
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

export default function LoginFortyTwo() {

    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <Link to="/" style={{color: 'white', textDecoration: 'none'}} id="Login-backward">
                        <FontAwesomeIcon icon={faAnglesLeft} size="2x"/>
                    </Link>

                    <img className="LoginSelector-invert-effect LoginSelector-logo" src={Logo42} alt="Logo-ecole-42" />
                    <h3 className="LoginSelector-card-title">Transcendence</h3>

                    <div className="FortyTwoLogin-center">

                        <div className="LoginSelector-card-subtitle">
                            <div className="LoginSelector-card-subtitle-word">
                                S'authentifier avec 42OAuth:
                            </div>
                        </div>

                        <div className="LoginSelector-card-subtitle">

                            <a href={`${import.meta.env.VITE_BACKENDURL}/auth/42/login`} className="FortyTwoLogin-button">
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