import React, { useEffect, useState } from "react";
import "./Friend.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

export default function Friend(props) {
 
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

  return (
    <div>
        {friend && (
            <div className="friend__info">
                <img src={friend.profilePicture} alt="profilePicture" className="Friend-profile-picture" />
                <h4>{friend.name}</h4>
                <button>
                    <FontAwesomeIcon icon={faMessage} />
                </button>
                <button>
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
            </div>
        )}
    </div>
  );
}