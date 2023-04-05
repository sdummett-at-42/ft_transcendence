import React from "react"
import { Link } from "react-router-dom"
import "./Unauthorized.css"

export default function Unauthorized() {
    return (
        <div id="Unauthorized">
            <h1 id="Unauthorized-title">You have been disconnected</h1>

            <Link to="/" id="Unauthorized-link">
                <h3>Clic here to be redirect to the login page</h3>
            </Link>
        </div>
    );
}