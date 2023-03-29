import React, { useState, useEffect } from "react";
import "./Navbar.css"
import { Link } from "react-router-dom";
import Logo42 from "../../assets/42_Logo.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGear } from "@fortawesome/free-solid-svg-icons"

export default function Navbar() {

    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    // fetch data
    const fetchUserData = async () => {
        const response = await fetch("http://localhost:3001/users/me", {
            credentials: 'include',
            method: "GET"
        });
        const data = await response.json();
        setUserData(data);
    };


    return (
        <nav className="Navbar-nav">
            <div className="Navbar-nav-section" id="Navbar-left">
                <Link to="/home"><img className="Login-invert-effect Navbar-logo" src={Logo42} alt="Logo-ecole-42" /></Link>
                <Link to="/game" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                    Pong
                </Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-mid">
                <Link to="/succes" style={{textDecoration: 'none', color: 'whitesmoke'}}>Succes</Link>
                <Link to="/stats" style={{textDecoration: 'none', color: 'whitesmoke'}}>Statistique</Link>
                <Link to="/message" style={{textDecoration: 'none', color: 'whitesmoke'}}>Messages</Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-right">
                <div>
                    {userData && (
                        <div id="Navbar-profil">
                            <img id="Navbar-profil-picture" className="Navbar-logo" src="https://play-lh.googleusercontent.com/IeNJWoKYx1waOhfWF6TiuSiWBLfqLb18lmZYXSgsH1fvb8v1IYiZr5aYWe0Gxu-pVZX3" alt="myProfilePicture" />
                            <div id="Navbar-profil-name">
                                {userData.name}
                            </div>
                            <div id="Navbar-profil-elo">
                                elo: {userData.elo}
                            </div>
                        </div>
                    )}
                </div>
                <div id="Navbar-option">
                    <Link to="/profil/:self">
                        <FontAwesomeIcon icon={faUserGear} style={{textDecoration: 'none', color: 'whitesmoke'}} size="lg" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}