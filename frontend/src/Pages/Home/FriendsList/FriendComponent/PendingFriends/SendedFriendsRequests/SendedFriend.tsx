import React, { useEffect, useState } from "react";
import "../PendingFriend.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function SendedFriend(props) {

    type UserData = {
        name: string;
        id: number;
        profilePicture: string;
        elo: number;
    }

    const [friend, setFriend] = useState<UserData>();

    useEffect(() => {
        setFriend(props.props.receiver);
    }, [props.props.receiver]);

    const CancelRequest = (friend) => {
        // Cancel the friend request
        props.onCancelRequest(friend);
    }

  return (
    <div>
        {friend && (
            <div className="Friend-info">
                <div className="Friend-profile">
                    <div className="Friend-wrapper-profile-picture">
                        <img src={friend.profilePicture} alt={`Image de profile de ${friend.name}`} className="Friend-profile-picture" />
                        <div className={`Friend-circle-status Pending-friend-waiting`}></div>
                    </div>
                    <div className="Friend-name-status">
                        <h4 className="Friend-name">{friend.name}</h4>
                        <div className="Friend-message Pending-friend-waiting">En attente</div>
                    </div>
                </div>

                <div>
                    <FontAwesomeIcon icon={faClock} size="lg" id="PendingFriend-Validate-icon"/>
                </div>
                <button
                    className="PendingFriend-button PendingFriend-Declined"
                    onClick={() => CancelRequest(friend)}
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" id="PendingFriend-Declined-icon"/>
                </button>
            </div>
        )}
    </div>
  );
}