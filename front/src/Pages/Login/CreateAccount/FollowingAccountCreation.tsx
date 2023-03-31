import React, { useRef } from "react";
import "./FollowingAccountCreation.css"
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

export default function FollowingAccountCreation() {

    const usernameInputRef = useRef();
    const naviguate = useNavigate();

    function handleLoginForm() {
        const username = usernameInputRef.current.value;

        if (!username) {
            console.log("No username provided");
            return;
        }

        fetch('http://localhost:3001/users/me', {
            method: 'PATCH',
			headers: { "Content-Type": "application/json" },
			credentials: 'include',
            body: JSON.stringify({
                name: username,
                email: "xx",
                profilePicture: "https://sain-et-naturel.ouest-france.fr/wp-content/uploads/2022/01/face-test-1-1024x684.jpg"
            }),
        })
        .then(res => {
            if (res.status == 200) {
                naviguate("/home");
                return;
            }
        })
    }

    return (
        <div className="LoginSelector-body">
            <div className="LoginSelector-card">
                <div className="LoginSelector-card-content">

                    <Link to="/" style={{color: 'white', textDecoration: 'none'}} id="Login-backward">
                        <FontAwesomeIcon icon={faAnglesLeft} size="2x"/>
                    </Link>

                    <h3 className="LoginSelector-card-title">Choisissez votre photo de profile:</h3>
                    
                    <div className="LoginSelector-card-subtitle">

                    <form>
                            <input
                                className="LoginSelector-button LoginSelector-input"
                                type="text"
                                placeholder="Pseudonyme"
                                ref={usernameInputRef}
                                required
                            />
            
                            <input
                                className="LoginSelector-button LoginSelector-input LoginSelector-submit Button-submit-video"
                                type="button"
                                value="Valider"
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