import React, { useEffect, useState } from "react";
import "./ReceivedFriend.css";
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

    const DeclineFriend = (friend) => {
        // Decline the friend request
        props.onDeclineFriend(friend);
    }

  return (
    <div>
        {friend && (
            <div className="friend__info">
                <img src={friend.profilePicture} alt="Photo de profil" className="Friend-profile-picture" />
                <h4>{friend.name}</h4>
                <button
                    className="PendingFriend-button PendingFriend-Validate"
                    onClick={() => AcceptFriend(friend)}
                >
                    <FontAwesomeIcon icon={faCheck} size="lg" id="PendingFriend-Validate-icon"/>
                </button>
                <button
                    className="PendingFriend-button PendingFriend-Declined"
                    onClick={() => DeclineFriend(friend)}    
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" id="PendingFriend-Declined-icon"/>
                </button>
            </div>
        )}
    </div>
  );
}