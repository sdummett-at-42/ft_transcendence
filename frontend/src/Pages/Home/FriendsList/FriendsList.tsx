import React, { useState, useEffect, useContext } from "react";
import "./FriendsList.css"
import { Link, useNavigate } from "react-router-dom";
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBar from "./SearchBar/SearchBar";
import { UserContext } from "../../../context/UserContext";
import Friend from "./FriendUser/Friend";

export default function FriendsList() {

    type UserData = {
        name: string;
        id: number;
        profilePicture: string;
        elo: number;
    }

    const navigate = useNavigate();
    const { user, friendSocketRef } = useContext(UserContext);

    const [friends, setFriends] = useState<UserData[]>([]);
    const [friendsPending, setFriendsPending] = useState<UserData[]>([]);

    useEffect(() => {
        async function getAllFriends() {
            // Get all friends of the user from the database and set the state
            const ListOfFriends = await fetch("http://localhost:3001/friends", {
                credentials: 'include',
                method: 'GET'
            })
                .then(res => {
                    if (res.status == 401) {
                        navigate("/unauthorized");
                    }
                    else if (res.status == 200) {
                        return res.json();
                }});

            // console.log(`Friend in database: `);
            // console.log(ListOfFriends);
            setFriends(ListOfFriends);
        } 

        async function getAllPendingFriends() {
            // Get all pending friends of the user from the database and set the state
            const ReceivedPendingFriends = await fetch("http://localhost:3001/friends/requests/received", {
                credentials: 'include',
                method: 'GET'
            })
                .then(res => {
                    if (res.status == 401) {
                        navigate("/unauthorized");
                    }
                    else if (res.status == 200) {
                        return res.json();
                }});
        
            const SentPendingFriends = await fetch("http://localhost:3001/friends/requests/sended", {
                credentials: 'include',
                method: 'GET'
            })
                .then(res => {
                    if (res.status == 401) {
                        navigate("/unauthorized");
                    }
                    else if (res.status == 200) {
                        return res.json();
                }});

            // console.log(`Pending friends in database: `);
            // console.log(ReceivedPendingFriends);
            setFriendsPending(ReceivedPendingFriends);
            // console.log(SentPendingFriends);
            setFriendsPending(prevFriendsPending => [...prevFriendsPending, ...SentPendingFriends]);
        }
        getAllFriends();
        getAllPendingFriends();
    }, []);

    const handleFriendRequest = (data) => {
        console.log(data);
        fetch("http://localhost:3001/friends/requests", {
            credentials: 'include',
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "friendId": data.id
            }),
        });
        console.log("friend request received");
    }

    useEffect(() => {
        friendSocketRef.current.on('friendRequestReceived', handleFriendRequest);
    }, [handleFriendRequest,
        friendSocketRef
    ]);


    const [isShaking, setIsShaking] = useState(false);

    const addFriend = async (friend) => {

        // Check if user is valid and if not, shake the search bar
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
                const dataFriend = res.filter(element => element.name === friend);
                return dataFriend.at(0);
            });
        if (!getUser || getUser.id === user.id) {
            console.log("user not found");
            setIsShaking(true);
            setTimeout(() => { setIsShaking(false) }, 1000);
            return;
        }

        // Send friend request
        await fetch("http://localhost:3001/friends/requests", {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "friendId": getUser.id
            }),
        })
            .then(res => {
                if (res.status == 401) {
                    navigate("/unauthorized");
                }
                else if (res.status == 200) {
                    console.log("friend request sent");
                    setFriendsPending([...friendsPending, getUser]);
                }
            })

    }

    return (
        <div className="FriendsList">
            <div className="FriendsList-title">
                Liste d'amis
            </div>
            <div className={`FriendsList-search-bar-container ${isShaking ? "shake" : ""}`}>
                <SearchBar onAddFriend={addFriend} />
            </div>
            <div className="FriendsList-list">
                <div className="FriendsList-user">
                    {friends && (friends.map((friend) => {
                        return <Friend key={friend.id} props={friend} />
                        }))}
                </div>
                <div className="FriendsList-user-pending">
                    {/* {friendsPending && (<Friend props={friendsPending} />)}; */}
                </div>
            </div>
            <Link to="/message" className="FriendsList-messages" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                <FontAwesomeIcon icon={faComments} size="2x" />
            </Link>
        </div>
    );
}