import React, { useContext, useRef, useState } from "react";
import "./Ranked.css"
import { UserContext } from "../../../../context/UserContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import Popup from "../../../Popup/Popup.tsx";

export default function Ranked(props) {

    const { user, gameSocketRef } = useContext(UserContext);
    const { setDispSelector, setRanked } = props;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const h1Ref = useRef<HTMLHeadingElement>(null);

    let interval = null;

    const onMouseOver = (event: React.MouseEvent<HTMLHeadingElement>) => {  
        let iteration = 0;

        clearInterval(interval);

        interval = setInterval(() => {
            if (!h1Ref.current) return;
            h1Ref.current.innerText = h1Ref.current.dataset.value
                .split("")
                .map((letter, index) => {
                    if(index < iteration) {
                        return h1Ref.current?.dataset.value[index];
                    }
                    return letters[Math.floor(Math.random() * 26)]
                })
                .join("");

            if(iteration >= h1Ref.current.dataset.value.length){ 
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);
    }

    const [isOpen, setIsOpen] = useState(false);

    const handleButtonClick = () => {
        setIsOpen(true);
        gameSocketRef.current.emit('joinQueue', {type: "ranked"});
    };

    const handleClose = () => {
        gameSocketRef.current.emit('leaveQueue');
        setIsOpen(false);
    };

    return (
    <div>
        <div className="Lobby-queue">
            <div className="Lobby-recap-backward">
                <FontAwesomeIcon icon={faChevronLeft} size="2xl" onClick={() => (setDispSelector(true), setRanked(false))} className="Lobby-backward" />
                <h1 className="Lobby-recap">Partie classée</h1>
            </div>
            <div className="Ranked-mid-column">
                <div className="Ranked-screen">  
                    <div className="Ranked-screen-overlay"></div>  
                    <div className="Ranked-screen-content">
                        <img src={user.profilePicture} alt="user pp" className="Profile-picture" />
                        <div className="Ranked-screen-user">
                            <span className="name" data-value={user.name} onMouseOver={onMouseOver} ref={h1Ref}>{user.name}</span>
                            <p className="link" >{user.elo}</p>
                        </div>
                        <button className="cybr-btn" onClick={handleButtonClick}>
                            Trouver un match<span aria-hidden>_</span>
                            <span aria-hidden className="cybr-btn__glitch">Trouver un match_</span>
                            <span aria-hidden className="cybr-btn__tag">R25</span>
                        </button>
                        <Popup isOpen={isOpen} isClose={handleClose} children={null}>
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
    );
}