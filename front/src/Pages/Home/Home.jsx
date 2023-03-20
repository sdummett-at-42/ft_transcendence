import React from "react";
import "./Home.css"
import { Link } from "react-router-dom"
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import homeVideo from "../../assets/home-background.mp4"

export default function Home() {

    return (
        <div>
            <div className="Home-content">
                <div className="Home-game">
                    <video src={homeVideo} autoPlay loop muted className="Home-video"/>
                    <div className="Home-game-text">
                        Play the mighty pong !
                        <Link to="/game">
                            <FontAwesomeIcon icon={faPlay} size="4x" />
                        </Link>
                    </div>
                </div>
                <div className="Home-friend">
                    Friend
                </div>
            </div>
        </div>
    );
}