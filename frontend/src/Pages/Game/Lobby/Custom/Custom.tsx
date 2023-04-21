import React, { useContext, useRef } from "react";
import "./Custom.css"
import { UserContext } from "../../../../context/UserContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"

export default function Custom(props) {

    const { user, gameSocketRef } = useContext(UserContext);
    const { setDispSelector, setCustom } = props;
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

    return (
    <div>
        <div className="Lobby-queue">
            <div className="Lobby-custom-header">
                <div className="Lobby-recap-backward">
                    <FontAwesomeIcon icon={faChevronLeft} size="2xl" onClick={() => (setDispSelector(true), setCustom(false))} className="Lobby-backward" />
                    <h1 className="Lobby-recap">Partie décontractée</h1>
                </div>

                <div className="Lobby-customize-game-button">

                </div>
            </div>
            <div className="Custom-lobby">

                <div className="Ranked-mid-column">
                    <div className="screen">  
                        <div className="screen-image"></div>  
                        <div className="screen-overlay"></div>  
                        <div className="screen-content">
                            <img src={user.profilePicture} alt="user pp" className="screen-icon" />
                            <div className="screen-user">
                                <span className="name" data-value={user.name} onMouseOver={onMouseOver} ref={h1Ref}>{user.name}</span>
                                <p className="link" >{user.elo}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="Ranked-mid-column">
                    <div className="screen">  
                        <div className="screen-image"></div>  
                        <div className="screen-overlay"></div>  
                        <div className="screen-content">
                            <img src={user.profilePicture} alt="user pp" className="screen-icon" />
                            <div className="screen-user">
                                <span className="name" data-value={user.name} onMouseOver={onMouseOver} ref={h1Ref}>{user.name}</span>
                                <p className="link" >{user.elo}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button className="cybr-btn" onClick={() => gameSocketRef.current.emit('joinQueue')}>
                Lancer la partie<span aria-hidden>_</span>
                <span aria-hidden className="cybr-btn__glitch">Lancer la partie_</span>
                <span aria-hidden className="cybr-btn__tag">R25</span>
            </button>
        </div>
    </div>
    );
}