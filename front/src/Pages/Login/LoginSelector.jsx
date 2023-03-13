import React from "react";
import "./LoginSelector.css"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoffee, faUser } from "@fortawesome/free-solid-svg-icons"
import { faGoogle } from "@fortawesome/free-brands-svg-icons"

export default function LoginSelector() {

    return (
        <div>
            <div className="card">
                <div className="card-content">

                    <img className="invert-effect logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/1200px-42_Logo.svg.png" alt="Logo-ecole-42" />
                    <h3 className="card-title">Transcendence</h3>

                    <div className="card-subtitle">
                        <div className="card-subtitle-word">
                            Choose your sign-in method :
                        </div>
                    </div>

                    <div className="card-subtitle">
                  
                        <Link className="button" to="/login/auth42" >
                            <div className="button-content">
                                <div className="button-image">
                                    <FontAwesomeIcon icon={faCoffee} />
                                </div>
                                <div className="button-text">Intra 42</div>
                            </div>
                        </Link>
                
                        <Link className="button" to="/login/google">
                            <div className="button-content">
                                <div className="button-image">
                                    <FontAwesomeIcon icon={faGoogle} />
                                </div>
                                <div className="button-text">Google</div>
                            </div>
                        </Link>
            
                        <Link className="button" to="/login/transcendence">
                            <div className="button-content">
                                <div className="button-image">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <div className="button-text">Other</div>
                            </div>
                        </Link>
    
                    </div>

                    <div className="card-subtitle">
                        <div className="card-subtitle-word">
                            No account ?
                        </div>
                        <Link className="card-subtitle-word" to="/login/create-account">
                            Create an account
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}