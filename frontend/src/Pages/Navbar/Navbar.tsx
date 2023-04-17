import React, { useState, useEffect, useContext } from "react";
import "./Navbar.css"
import { Link, useNavigate } from "react-router-dom";
import Logo42 from "../../assets/42_Logo.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGear } from "@fortawesome/free-solid-svg-icons"
import { UserContext } from "../../context/UserContext"

export default function Navbar() {

    const { user, setUser } = useContext(UserContext);
    const naviguate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    // fetch data
    const fetchUserData = async () => {
        const response = await fetch("http://localhost:3001/users/me", {
            credentials: 'include',
            method: "GET"
        })
            .then(res => {
                if (res.status == 401) {
                    naviguate("/unauthorized");
                    return;
                }
                return res.json();
            });
        const data = await response;
        setUser(data);
    };


    return (
        <nav className="Navbar-nav">
            <div className="Navbar-nav-section" id="Navbar-left">
                <Link to="/home"><img className="LoginSelector-invert-effect Navbar-logo" src={Logo42} alt="Logo-ecole-42" /></Link>
                <Link to="/lobby" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                    Pong
                </Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-mid">
                <Link to="/achievements" style={{textDecoration: 'none', color: 'whitesmoke'}}>Succes</Link>
                <Link to="/stats" style={{textDecoration: 'none', color: 'whitesmoke'}}>Statistique</Link>
                <Link to="/message" style={{textDecoration: 'none', color: 'whitesmoke'}}>Messages</Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-right">
                <div>
                    {user && (
                        <div id="Navbar-profil">
                            <img id="Navbar-profil-picture" className="Navbar-logo" src={user.profilePicture} alt="myProfilePicture" />
                            <div id="Navbar-profil-name">
                                {user.name}
                            </div>
                        </div>
                    )}
                </div>
                <div id="Navbar-option">
                    <button
                        id="Navbar-profile-button"
                        onClick={(e) => naviguate(`/profile/${user.name}`)}
                    >
                        <FontAwesomeIcon icon={faUserGear} style={{textDecoration: 'none', color: 'whitesmoke'}} size="lg" />
                    </button>
                </div>
            </div>
        </nav>
    );
}