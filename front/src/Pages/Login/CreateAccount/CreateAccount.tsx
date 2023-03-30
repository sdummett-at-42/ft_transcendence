import React from "react";
import "./CreateAccount.css"
import Logo42 from "../../../assets/42_Logo.png"

export default function CreateAccount() {
    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <img className="LoginSelector-invert-effect LoginSelector-logo" src={Logo42} alt="Logo-ecole-42" />

                    <h3 className="LoginSelector-card-title">Se connecter avec un compte Transcendence</h3>
                    
                    <div className="LoginSelector-card-subtitle">

                        <form className="Transcendence-form">
                            <input type="text" placeholder="username" className="Transcendence-username" />
                            <input type="password" placeholder="password" className="Transcendence-password" />
                            <input type="button" value="Se connecter" className="Transcendence-button"/>
                        </form>
    
                    </div>

                </div>
            </div>
        </div>
    );
}