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
                    <img src={RankedIcon} alt="" draggable="false" />
                    <div className="Lobby-info">
                        <h1 className="Lobby-mode-name">Classée</h1>
                        <p className="Lobby-mode-text">
                            Affrontez d'autres joueurs et grimpez dans le classement.
                            Parviendriez-vous à devenir le maitre incontesté de Pong ?
                        </p>
                    </div>
                </div>
                <div
                    onClick={() => (setDispSelector(false), setCustom(true))}
                    className="Lobby-selector-button"
                >
                    <img src={CustomIcon} alt="" draggable="false" />
                    <div className="Lobby-info">
                        <h1 className="Lobby-mode-name">Décontractée</h1>
                        <p className="Lobby-mode-text">
                            Défiez vos amis dans une partie entièrement personnalisée.
                            Ici pas de classement, juste du fun !
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}