import React, { useEffect, useState } from "react";
import "./Friend.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faTableTennis, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

export default function Friend(props, online) {
 
    type UserData = {
        name: string;
        id: number;
        profilePicture: string;
        elo: number;
    }

    const [friend, setFriend] = useState<UserData>();
    const [onlineStatus, setOnlineStatus] = useState<boolean>(false);

    useEffect(() => {
        setFriend(props.props);
    }, [props]);

    console.log(online);
    useEffect(() => {
        // setOnline(onlineStatus);
    }, [online]);

  return (
    <div>
        {friend && (
            <div className="friend__info">
                <img src={friend.profilePicture} alt="profilePicture" className="Friend-profile-picture" />
                <div className="Friend-name">
                    <h4>{friend.name}</h4>
                    {onlineStatus && (
                        <div className="Friend-online-status">
                            <div className="Friend-online-status-circle"></div>
                            <p>En ligne</p>
                        </div>
                    )}
                    {!onlineStatus && (
                        <div className="Friend-online-status">
                            <div className="Friend-offline-status-circle"></div>
                            <p>Hors ligne</p>
                        </div>
                    )}
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