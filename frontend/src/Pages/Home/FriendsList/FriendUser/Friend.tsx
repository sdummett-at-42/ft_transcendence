import React, { useEffect, useState } from "react";
import "./Friend.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";

export default function Friend(key, props) {
 
    const FriendId = key.current;
    const navigate = useNavigate();

    // console.log(props);

    type UserData = {
        name: string;
        id: number;
        profilePicture: string;
        elo: number;
    }

    const [friend, setFriend] = useState<UserData>();

    useEffect(() => {
        async function FindUserWithId(id: number) {
            console.log("FindUserWithId");
            console.log(id);
            const getUser = await fetch("http://localhost:3001/users", {
                credentials: 'include',
                method: 'GET'
            })
            .then(res => {
                if (res.status == 401) {
                    navigate("/unauthorized");
                }
                else if (res.status == 200) {
                    return res.json();
                }
            })
            .then(res => {
                const dataFriend = res.filter(element => console.log(element.id == id));
                console.log(dataFriend);
                return dataFriend.at(0);
            });
            setFriend(getUser);
            // console.log(getUser);
        }
        console.log(FriendId);
        FindUserWithId(FriendId);
    }, []);

  return (
    <div className="friend">
        {friend && ({friend})}
    </div>
  );
}