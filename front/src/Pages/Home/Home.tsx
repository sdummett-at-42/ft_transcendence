import React from "react";
import "./Home.css"
import { Link } from "react-router-dom"
import { faPlay, faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import homeVideo from "../../assets/home-background.mp4"
import userImage from "../../assets/Sample_User_Icon.png"

export default function Home() {

    return (
        <div>
            <div className="Home-content">
                <div className="Home-game">
                    <video src={homeVideo} autoPlay loop muted className="Home-video"/>
                    <div className="Home-game-text">
                        Play the mighty pong !
                        <Link to="/game" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                            <FontAwesomeIcon icon={faPlay} size="4x" />
                        </Link>
                    </div>
                </div>
                <div className="Home-friend">
                    <div className="Home-friend-menu">
                        Liste d'amis
                    </div>
                    <div className="Home-friend-list">
                        <div className="Home-friend-user">
                            <img src={userImage} className="Home-friend-user-ico" style={{height: '5vmin', width: '5vmin', verticalAlign: 'middle'}}/>
                            <div className="Home-friend-user-name">Ami 1</div>
                            <div className="Home-friend-user-status">online</div>

                        </div>
                    </div>
                    <Link to="/message" className="Home-friend-icon" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                        <FontAwesomeIcon icon={faComments} size="2x" />
                    </Link>
                </div>
            </div>
        </div>
    );
}