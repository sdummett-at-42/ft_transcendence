import React, { useContext, useRef, useState } from "react";
import "./Custom.css"
import { UserContext } from "../../../../context/UserContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import Popup from "../../../Popup/Popup";

export default function Custom(props) {

    const { user, gameSocketRef } = useContext(UserContext);
    const { setDispSelector, setCustom } = props;

    const [isOpen, setIsOpen] = useState(false);
    
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const myNameRef = useRef<HTMLHeadingElement>(null);
    let interval = null;

    const onMyName = (event: React.MouseEvent<HTMLHeadingElement>) => {  
        let iteration = 0;

        clearInterval(interval);

        interval = setInterval(() => {
            if (!myNameRef.current) return;
            myNameRef.current.innerText = myNameRef.current.dataset.value
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return myNameRef.current?.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if(iteration >= myNameRef.current.dataset.value.length){ 
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);
    }

    const handleButtonClick = () => {
        setIsOpen(true);
        gameSocketRef.current.emit('joinQueue', {type: "custom"});
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
    <div>
        <div className="Lobby-queue">
            <div className="Lobby-custom-header">
                <div className="Lobby-recap-backward">
                    <FontAwesomeIcon icon={faChevronLeft} size="2xl" onClick={() => (setDispSelector(true), setCustom(false))} className="Lobby-backward" />
                    <h1 className="Lobby-recap">Partie décontractée</h1>
                </div>

                <div className="Ranked-mid-column">
                <div className="Custom-screen">  
                    <div className="Custom-screen-overlay"></div>  
                    <div className="Custom-screen-content">
                        <img src={user.profilePicture} alt="user pp" className="Profile-picture" />
                        <div className="Custom-screen-user">
                            <span className="name" data-value={user.name} onMouseOver={onMyName} ref={myNameRef}>{user.name}</span>
                            <p className="link" >{user.elo}</p>
                        </div>
                        <button className="cybr-btn" onClick={handleButtonClick}>
                            Trouver un match<span aria-hidden>_</span>
                            <span aria-hidden className="cybr-btn__glitch">Trouver un match_</span>
                            <span aria-hidden className="cybr-btn__tag">R25</span>
                        </button>
                        <Popup isOpen={isOpen} isClose={handleClose}>
                            <div className="Ranked-popup">
                                <h2 className="Ranked-popup-text">En attente d'un adversaire...</h2>
                                <button
                                    onClick={handleClose}
                                    className="Settings-button"
                                >
                                    Quitter la file d'attente
                                </button>
                            </div>
                        </Popup>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
    );
}