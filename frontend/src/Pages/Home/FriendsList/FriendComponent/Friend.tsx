import React, { useEffect, useState, useContext } from "react";
import "./Friend.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faTableTennis, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { UserContext } from "./../../../../context/UserContext"
import Popup from "../../../Popup/Popup";


interface Props {
    props: {
        name: string;
        id: number;
        profilePicture: string;
        elo: number;
    };
    isRemoved: (data) => void;
    isConnected: boolean;
    isInGame: boolean;
}

export default function Friend(props: Props) {

    const [friend, setFriend] = useState(props.props);
    const [active, setActive] = useState<boolean>(props.isConnected);
    const [inGame, setInGame] = useState<boolean>(props.isInGame);
    const [isDuelOpen, setIsDuelOpen] = useState<boolean>(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
    const [isRemoved, setIsRemoved] = useState<boolean>(false);
    const { user, gameSocketRef } = useContext(UserContext);


    useEffect(() => {
        setFriend(props.props);
        setActive(props.isConnected);
        setInGame(props.isInGame);
    }, [props]);

    const navigate = useNavigate();
    const handleDuel = () => {
        setIsDuelOpen(!isDuelOpen);
        if (isOptionsOpen) {
            setIsOptionsOpen(false);
        }
    }

    const openPopup = () => {
        setIsRemoved(true);
    }
    
    const handleRemoveFriend = () => {
        props.isRemoved(friend);
    }

    const navigateToChat = (friend) => {
        navigate(`/chat/${friend.id}/${friend.name}`);
    };

    const sendGameInvitationA = (friend) =>{
        gameSocketRef.current.emit('sendInvitationGame',  { idTarget: friend.id, type: "ranked", nameTarget: user?.name });
        handleDuel();
       
    }

    const sendGameInvitationB = (friend) =>{
        gameSocketRef.current.emit('sendInvitationGame', { idTarget: friend.id, type: "custom", nameTarget: user?.name});
        handleDuel();
    }

    return (
        <div>
            {friend && (
                <div className="Friend-info">

                    <div className="Friend-profile">
                        <div className="Friend-wrapper-profile-picture">
                            <img src={friend.profilePicture} alt={`Image de profile de ${friend.name}`} className="Friend-profile-picture" />
                            <div className={`Friend-circle-status ${active ? (inGame ? "Friend-Game" : "Friend-online") : "Friend-offline"}`}></div>
                        </div>
                        <div className="Friend-name-status">
                            <h4 className="Friend-name">{friend.name}</h4>
                            <div className={`Friend-message ${active ? (inGame ? "Friend-Game" : "Friend-online") : "Friend-offline"}`}>
                                {active ? (inGame ? "En Partie" : "En ligne") : "Hors ligne"}
                            </div>
                        </div>
                    </div>

                    <button
                        className="PendingFriend-button"
                        onClick={() => navigateToChat(friend)}
                    >
                        <FontAwesomeIcon icon={faMessage} size="lg" />
                    </button>
                    <div className="Friend-dropdown">
                        <button
                            className="PendingFriend-button"
                            onClick={() => handleDuel()}
                        >
                            <FontAwesomeIcon icon={faTableTennis} size="lg" />
                        </button>
                        {isDuelOpen && (
                            <div className="Friend-dropdown-content">
                                <div onClick={()=> sendGameInvitationA(friend)}>Partie classée</div>
                                <div onClick={()=> sendGameInvitationB(friend)}>Partie décontractée</div>
                            </div>
                        )}
                    </div>
                    <div className="Friend-dropdown">
                        <button
                            className="PendingFriend-button"
                            onClick={() => openPopup()}
                        >
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>
                    </div>
                </div>
            )}
        <Popup isOpen={isRemoved} isClose={() => setIsRemoved(false)}>
            <div className="RoomCreate-screen-card" >
                <div className="RoomCreate-screen-card-overlay"></div>
                <div className="RoomCreate-screen-card-content">
					<div className="RoomCreate-screen-card-content-body">
                        <div className="Profile-screen-card-text">
                            <h2>Voulez-vous suppimer {friend.name} de vos amis ?</h2>
                        </div>
                        <div className="RoomCreate-button-wrapper">
                            <button className="Settings-button" onClick={() => setIsRemoved(false)}>Annuler</button>
                            <button className="Settings-button" onClick={() => handleRemoveFriend()}>Supprimer</button>
                        </div>
                    </div>
                </div>
            </div>
        </Popup>
        </div>
    );
}

