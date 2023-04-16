import React, { useContext } from "react";
import "./Game.css"
import { UserContext } from "../../context/UserContext"

export default function Game() {

    const { user, gameSocketRef } = useContext(UserContext);

    return (
        <div>
            <h1>Game</h1>
        </div>
    )
}