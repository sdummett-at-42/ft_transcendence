import React from "react";
import "./Home.css"
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Home() {

    return (
        <div>
            <div className="Home-content">
                <div className="Home-game">
                    Play the mighty pong !
                    <div className="Home-button-play">
                        <FontAwesomeIcon icon={faPlay} size="4x" />
                    </div>
                </div>
                <div className="Home-friend">
                    Friend
                </div>
            </div>
        </div>
    );
}