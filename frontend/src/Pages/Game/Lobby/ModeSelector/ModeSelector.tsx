import React, { useState } from "react";
import "../Lobby.css"

export default function ModeSelector(props) {

    const { setDispSelector, setRanked, setCustom} = props;

    return (
        <div className="Lobby-selector">
            <h1 className="Lobby-title">
                    Choisissez votre mode de jeu:
            </h1>
            <div className="Lobby-buttons-container">
                <button
                    onClick={() => (setDispSelector(false), setCustom(true))}
                    className="Lobby-selector-button"
                >
                    Personnalisee
                </button>
                <button
                    onClick={() => (setDispSelector(false), setRanked(true))}
                    className="Lobby-selector-button"
                >
                    Classee
                </button>
            </div>
        </div>
    )
}