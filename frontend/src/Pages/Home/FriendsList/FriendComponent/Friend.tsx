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

    useEffect(() => {
        const users = async function FetchUsers() {
            const response = await fetch('http://localhost:3001/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const data = await response.json();
            return data;    
        }

        const user = users().then((data) => {
            data.forEach((user) => {
                if (user.id === props.props) {
                    setFriend(user);
                }
            });
        }
        );
    }, [props]);

  return (
    <div>
        {friend && (
            <div className="friend__info">
                <img src={friend.profilePicture} alt="profilePicture" className="Friend-profile-picture" />
                <h4>{friend.name}</h4>
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