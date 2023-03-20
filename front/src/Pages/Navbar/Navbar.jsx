import React from "react";
import "./Navbar.css"
import { Link } from "react-router-dom";

export default function Navbar() {

    return (
        <nav className="Navbar-nav">
            <div className="Navbar-nav-section" id="Navbar-left">
                <Link to="/home"><img className="LoginSelector-invert-effect Navbar-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/1200px-42_Logo.svg.png" alt="Logo-ecole-42" /></Link>
                <Link to="/game">
                    <div className="arrow-pointer">
                        Pong
                    </div>
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