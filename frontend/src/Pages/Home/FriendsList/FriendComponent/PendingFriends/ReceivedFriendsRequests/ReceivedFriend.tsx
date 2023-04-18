import React, { useEffect, useState } from "react";
import "../PendingFriend.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function ReceivedFriend(props) {

    type UserData = {
        name: string;
        id: number;
        profilePicture: string;
        elo: number;
    }

    const [friend, setFriend] = useState<UserData>();

    useEffect(() => {
        setFriend(props.props.sender);
    }, [props.props.sender]);

    const AcceptFriend = (friend) => {
        // Accept the friend request
        props.onAcceptFriend(friend);
    }

    const RefuseFriend = (friend) => {
        // Decline the friend request
        props.onRefusedFriend(friend);
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
                        <div className="Friend-message Pending-friend-waiting">Demande d'ami</div>
                    </div>
                </div>

                <button
                    className="PendingFriend-button PendingFriend-Validate"
                    onClick={() => AcceptFriend(friend)}
                >
                    <FontAwesomeIcon icon={faCheck} size="lg" id="PendingFriend-Validate-icon"/>
                </button>
                <button
                    className="PendingFriend-button PendingFriend-Declined"
                    onClick={() => RefuseFriend(friend)}    
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" id="PendingFriend-Declined-icon"/>
                </button>
            </div>
        )}
    </div>
  );
}