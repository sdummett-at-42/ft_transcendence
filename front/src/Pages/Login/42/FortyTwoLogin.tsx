import React from "react";
import "./FortyTwoLogin.css"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
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
                    <h3 className="LoginSelector-card-title">Se connecter</h3>

                </div>
            </div>
        </div>
    );
}