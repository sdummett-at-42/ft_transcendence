import React from "react";
import "./Navbar.css"
import { Link } from "react-router-dom";
import Logo42 from "../../assets/42_Logo.png"

export default function Navbar() {

    return (
        <nav className="Navbar-nav">
            <div className="Navbar-nav-section" id="Navbar-left">
                <Link to="/home"><img className="LoginSelector-invert-effect Navbar-logo" src={Logo42} alt="Logo-ecole-42" /></Link>
                <Link to="/game">
                    Pong
                </Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-mid">
                <Link to="/succes">Succes</Link>
                <Link to="/stats">Statistique</Link>
            </div>

            <div className="Navbar-nav-section" id="Navbar-right">
                <Link to="/profil/:self">Profile</Link>
            </div>
        </nav>
    );
}