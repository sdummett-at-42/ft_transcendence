import React, { useContext } from "react";
import "./Custom.css"
import { UserContext } from "../../../../context/UserContext";

export default function Custom(props) {

    const { gameSocketRef } = useContext(UserContext);
    const { setDispSelector, setCustom } = props;

    return (
    <div>
        <div className="Lobby-queue">
            <button 
                onClick={() => (setDispSelector(true), setCustom(false))}
                className="Lobby-queue-back"
            >
                Retour a la selection de mode
            </button>
            <h1>Perso Lobby</h1>
            <button onClick={() => gameSocketRef.current.emit('joinQueue')}>Lancer la partie</button>
        </div>
    </div>
    );
}