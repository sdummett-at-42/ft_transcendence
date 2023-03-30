import React from "react";
import "./CreateAccount.css"
import Logo42 from "../../../assets/42_Logo.png"

export default function CreateAccount() {
    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <img className="LoginSelector-invert-effect LoginSelector-logo" src={Logo42} alt="Logo-ecole-42" />

                    <h3 className="LoginSelector-card-title">Creer un compte:</h3>
                    
                    <div className="LoginSelector-card-subtitle">

                    <form method="post" action="http://localhost:3001/register/transcendence">
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="text"
                                placeholder="Pseudonyme"
                                required
                            />

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
                                className="LoginSelector-button LoginSelector-input"
                                type="password"
                                placeholder="Confirmer"
                                required
                            />
            
                            <input
                                className="LoginSelector-button LoginSelector-input LoginSelector-submit Button-submit-video"
                                type="submit"
                                value="Continuer"
                            />

                        </form>
    
                    </div>

                </div>
            </div>
        </div>
    );
}