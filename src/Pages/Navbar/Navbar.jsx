import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {

    return (
        <nav>
            <Link to="/">Login Select</Link>
            <Link to="/home">Accueil</Link>
            <Link to="/profil/:self">Profil</Link>
        </nav>
    );
}