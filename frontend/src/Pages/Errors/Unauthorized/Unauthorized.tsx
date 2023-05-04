import React from "react"
import { Link } from "react-router-dom"
import "./Unauthorized.css"

export default function Unauthorized() {
    return (
        <div id="Unauthorized">
            <h1 id="Unauthorized-title">
                Vous avez été redirigé vers cette page car vous n'êtes pas autorisé à accéder à cette page.
            </h1>

            <Link to="/" id="Unauthorized-link">
                <h3>
                    Cliquez ici pour revenir a la page d'accueil
                </h3>
            </Link>
        </div>
    );
}