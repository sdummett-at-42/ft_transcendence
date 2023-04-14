import React, { useEffect, useState } from "react";
import "./SendedFriend.css";
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
        console.log(friend);
        props.onCancelRequest(friend);
    }


  return (
    <div>
        {friend && (
            <div className="friend__info">
                <img src={friend.profilePicture} alt="Photo de profil" className="Friend-profile-picture" />
                <h4>{friend.name}</h4>
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