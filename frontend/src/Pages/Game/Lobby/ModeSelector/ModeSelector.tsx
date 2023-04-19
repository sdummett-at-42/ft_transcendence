import React from "react";
import "../Lobby.css"
import RankedIcon from "../../../../assets/crown-logo.png"
import CustomIcon from "../../../../assets/custom-logo.png"

export default function ModeSelector(props) {

    const { setDispSelector, setRanked, setCustom} = props;

    return (
        <div className="Lobby-selector">
            <h1 className="Lobby-title">
                    Choisissez votre mode de jeu:
            </h1>
            <div className="Lobby-buttons-container">
                <div
                    onClick={() => (setDispSelector(false), setRanked(true))}
                    className="Lobby-selector-button"
                >
                    <img src={RankedIcon} alt="" />
                    <div className="Lobby-info">
                        <h1>Classée</h1>
                        <p>Affrontez d'autres joueurs et grimpez dans le classement</p>
                    </div>
                </div>
                <div
                    onClick={() => (setDispSelector(false), setCustom(true))}
                    className="Lobby-selector-button"
                >
                    <img src={CustomIcon} alt="" />
                    <div className="Lobby-info">
                        <h1>Décontractée</h1>
                        <p>Défiez vos amis dans une partie entièrement personnalisé </p>
                    </div>
                </div>
            </div>
        </div>
    )
}