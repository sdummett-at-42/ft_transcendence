import React from "react";
import "./Navbar.css"
import { Link } from "react-router-dom";
import Logo42 from "../../assets/42_Logo.png"

export default function Navbar() {

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
                <Link to="/profil/:self" style={{textDecoration: 'none', color: 'whitesmoke'}}>Profile</Link>
            </div>
        </nav>
    );
}