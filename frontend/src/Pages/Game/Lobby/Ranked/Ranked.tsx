import React, { useContext } from "react";
import "./Ranked.css"
import { UserContext } from "../../../../context/UserContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"

export default function Ranked(props) {

    const { user, gameSocketRef } = useContext(UserContext);
    const { setDispSelector, setRanked } = props;

    return (
    <div>
        <div className="Lobby-queue">
            <div className="Lobby-recap-backward">
                <FontAwesomeIcon icon={faChevronLeft} size="2xl" onClick={() => (setDispSelector(true), setRanked(false))} />
                <h1>Partie classée</h1>
            </div>
            <div className="Ranked-mid-column">
                <div className="Ranked-player-info">
                    <img src={user.profilePicture} alt="" />
                    <p>{user.name}</p>
                    <p>{user.elo}</p>
                </div>
                <button onClick={() => gameSocketRef.current.emit('joinQueue')}>Trouver un match</button>
            </div>
        </div>
    </div>
    );
}