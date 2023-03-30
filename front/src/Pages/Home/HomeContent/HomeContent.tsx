import React, { useState } from "react";
import "./HomeContent.css"
import { Link } from "react-router-dom"
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import homeVideo from "../../../assets/home-background.mp4"

export default function HomeContent() {

    return (
        <div className="HomeContent">
            <video src={homeVideo} autoPlay loop muted className="HomeContent-video"/>
            <div className="HomeContent-text">
                Play the mighty pong !
                <Link to="/game" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                    <FontAwesomeIcon icon={faPlay} size="4x" />
                </Link>
            </div>
        </div>
    );
}