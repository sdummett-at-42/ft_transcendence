import React, { useRef } from "react";
import "./ForgotMail.css"
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

export default function ForgotMail() {

    const emailInputRef = useRef(null);

    function handleLoginForm() {
        const email = emailInputRef.current.value;
        console.log(email);
    }

    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <Link to="/" style={{color: 'white', textDecoration: 'none'}} id="Login-backward">
                        <FontAwesomeIcon icon={faAnglesLeft} size="2x"/>
                    </Link>

                    <h3 className="LoginSelector-card-title">Renseigner votre addresse mail: </h3>
                    
                    <div className="LoginSelector-card-subtitle">

                    <form>
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="email"
                                placeholder="Adresse mail"
                                ref={emailInputRef}
                                required
                            />
            
                            <input
                                className="LoginSelector-button LoginSelector-input LoginSelector-submit Button-submit-video"
                                type="button"
                                value="Recuperer mon mot de passe"
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