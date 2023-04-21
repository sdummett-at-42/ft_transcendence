import React, { useEffect, useState } from "react";
import "./Friend.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faTableTennis, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";


export default function Friend(props) {
    
    type UserData = {
        name: string;
        id: number;
        profilePicture: string;
        elo: number;
    }

    const [friend, setFriend] = useState<UserData>();
    const [active, setActive] = useState<boolean>(false);

    useEffect(() => {
        setFriend(props.props);
        setActive(props.isConnected);
    }, [props]);

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
                >
                    <FontAwesomeIcon icon={faMessage} size="lg" />
                </button>
                <button
                    className="PendingFriend-button"
                >
                    <FontAwesomeIcon icon={faTableTennis} size="lg" />
                </button>
                <button
                    className="PendingFriend-button"
                >
                    <FontAwesomeIcon icon={faEllipsisVertical} size="lg" />
                </button>
            </div>
        )}
    </div>
  );
}