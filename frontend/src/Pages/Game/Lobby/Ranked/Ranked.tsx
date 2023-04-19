import React, { useContext } from "react";
import "./Ranked.css"
import { UserContext } from "../../../../context/UserContext";

export default function Ranked(props) {

    const { gameSocketRef } = useContext(UserContext);
    const { setDispSelector, setRanked } = props;

    return (
    <div>
        <div className="Lobby-queue">
            <button
                onClick={() => (setDispSelector(true), setRanked(false))}
            >
                Retour a la selection de mode
            </button>
            <h1>Ranked Lobby</h1>
            <button onClick={() => gameSocketRef.current.emit('joinQueue')}>Join Queue</button>
        </div>
    </div>
    );
}