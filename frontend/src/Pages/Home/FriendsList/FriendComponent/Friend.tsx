import React, { useEffect, useState } from "react";
import "./Friend.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faTableTennis, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';

interface Props {
    props: {
        name: string;
        id: number;
        profilePicture: string;
        elo: number;
    };
    isConnected: boolean;
}

export default function Friend(props: Props) {
    
    const [friend, setFriend] = useState(props.props);
    const [active, setActive] = useState<boolean>(props.isConnected);
    const [isDuelOpen, setIsDuelOpen] = useState<boolean>(false);
    const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        setFriend(props.props);
        setActive(props.isConnected);
    }, [props]);

    const handleDuel = () => {
        setIsDuelOpen(!isDuelOpen);
        if (isOptionsOpen) {
            setIsOptionsOpen(false);
        }
    }

    const handleOptions = () => {
        setIsOptionsOpen(!isOptionsOpen);
        if (isDuelOpen) {
            setIsDuelOpen(false);
        }
    }

    const handleRemoveFriend = () => {
        console.log("Remove friend");

    }

    const navigateToChat = (friend) => {
        console.log("naviger", friend);
        navigate(`/chat/${friend.id}/${friend.name}`);
    };

    return (
        <div>
            {friend && (
                <div className="Friend-info">

                    <div className="Friend-profile">
                        <div className="Friend-wrapper-profile-picture">
                            <img src={friend.profilePicture} alt={`Image de profile de ${friend.name}`} className="Friend-profile-picture" />
                            <div className={`Friend-circle-status ${active ? "Friend-online" : "Friend-offline"}`}></div>
                        </div>
                        <div className="Friend-name-status">
                            <h4 className="Friend-name">{friend.name}</h4>
                            <div className={`Friend-message ${active ? "Friend-online" : "Friend-offline"}`}>
                                {active ? "En ligne" : "Hors ligne"}
                            </div>
                        </div>
                    </div>

                    <button
                        className="PendingFriend-button"
                        onClick={()=>navigateToChat(friend)}
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
                            <div>Partie classée</div>
                            <div>Partie décontractée</div>
                        </div>
                    )}
                </div>
                <div className="Friend-dropdown">
                    <button
                        className="PendingFriend-button"
                        onClick={() => handleOptions()}
                    >
                        <FontAwesomeIcon icon={faEllipsisVertical} size="lg" />
                    </button>
                    {isOptionsOpen && (
                        <div className="Friend-dropdown-content">
                            <div>Regarder la partie</div>
                            <div onClick={() => handleRemoveFriend()}>Retirer des amis</div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}
        