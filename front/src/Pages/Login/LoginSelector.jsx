import React from "react";
import "./LoginSelector.css"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoffee, faUser } from "@fortawesome/free-solid-svg-icons"
import { faGoogle } from "@fortawesome/free-brands-svg-icons"
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
                            Choose your sign-in method :
                        </div>
                    </div>

                    <div className="LoginSelector-card-subtitle">
                  
                        <Link className="LoginSelector-button" to="/login/auth42" >
                            <div className="LoginSelector-button-content">
                                <div className="LoginSelector-button-image">
                                    <FontAwesomeIcon icon={faCoffee} />
                                </div>
                                <div className="LoginSelector-button-text">Intra 42</div>
                            </div>
                        </Link>
                
                        <Link className="LoginSelector-button" to="/login/google">
                            <div className="LoginSelector-button-content">
                                <div className="LoginSelector-button-image">
                                    <FontAwesomeIcon icon={faGoogle} />
                                </div>
                                <div className="LoginSelector-button-text">Google</div>
                            </div>
                        </Link>
            
                        <Link className="LoginSelector-button" to="/login/transcendence">
                            <div className="LoginSelector-button-content">
                                <div className="LoginSelector-button-image">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <div className="LoginSelector-button-text">Other</div>
                            </div>
                        </Link>
    
                    </div>

                    <div className="LoginSelector-card-subtitle">
                        <div className="LoginSelector-card-subtitle-word">
                            No account ?
                        </div>
                        <Link className="LoginSelector-card-subtitle-word" to="/login/create-account">
                            Create an account
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}