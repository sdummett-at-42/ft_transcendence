import React, { useState, useEffect, useContext } from "react";
import "./FriendsList.css"
import { Link, useNavigate } from "react-router-dom";
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBar from "./SearchBar/SearchBar";
import { UserContext } from "../../../context/UserContext";
import Friend from "./FriendComponent/Friend";
import ReceivedFriend from "./FriendComponent/PendingFriends/ReceivedFriendsRequests/ReceivedFriend";
import SendedFriend from "./FriendComponent/PendingFriends/SendedFriendsRequests/SendedFriend";

export default function FriendsList() {

    type UserData = {
        name: string;
        id: number;
        profilePicture: string;
        elo: number;
    }

    const navigate = useNavigate();
    const { user, friendSocketRef } = useContext(UserContext);

    // Store all friends of the user
    const [friends, setFriends] = useState<UserData[]>([]);
    // Store all received friend requests of the user
    const [friendsPending, setFriendsPending] = useState<UserData[]>([]);
    // Store all sent friend requests of the user
    const [friendsRequests, setFriendsRequests] = useState<UserData[]>([]);

    // Fetch all friends of the user
    useEffect(() => {
        async function getFriends() {
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

            setFriends(ListOfFriends);
        } 

        async function getPendingFriends() {
            // Get all received friend requests of the user from the database and set the state
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

                setFriendsPending(ReceivedPendingFriends);
            }

        async function getRequestFriends() {
            // Get all sended friend requests of the user from the database and set the state
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

            setFriendsRequests(SentPendingFriends);
        }

        getFriends();
        getPendingFriends();
        getRequestFriends();
    }, []);

    const handleFriendRequest = (data) => {
        console.log(data);
        async function getPendingFriends() {
            // Get all received friend requests of the user from the database and set the state
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

                setFriendsPending(ReceivedPendingFriends);
            }
        getPendingFriends();
        console.log("friend request received");
    }

    const handleFriendRequestAccepted = (data) => {
        console.log(data);
        async function getFriends() {
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
            setFriends(ListOfFriends);
        }
        getFriends();
        console.log("friend request accepted");
    }

    const handleFriendConnected = (data) => {
        console.log(data);
        console.log("friend connected");
    }

    const handleFriendDisconnected = (data) => {
        console.log(data);
        console.log("friend disconnected");
    }

    // Handle the socket events
    useEffect(() => {
        friendSocketRef.current.on('friendRequestReceived', handleFriendRequest);
        friendSocketRef.current.on('friendRequestAccepted', handleFriendRequestAccepted);
        friendSocketRef.current.on('friendConnected', handleFriendConnected);
        friendSocketRef.current.on('friendDisconnected', handleFriendDisconnected);
    }, [handleFriendRequest,
        friendSocketRef
    ]);


    const [isShaking, setIsShaking] = useState(false);

    // Handle the search bar input
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
        if (!getUser || getUser.id === user.id || friendsRequests.some(friend => friend.id === getUser.id) || friends.some(friend => friend.id === getUser.id)) {
            setIsShaking(true);
            setTimeout(() => { setIsShaking(false) }, 1000);
            return;
        }

        if (friendsPending.some(friend => friend.id === getUser.id)) {
            AcceptFriend(getUser);
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
                    setFriendsRequests([...friendsRequests, getUser]);
                }
            })
    }

    const AcceptFriend = async (friend) => {
        await fetch("http://localhost:3001/friends/requests", {
            credentials: 'include',
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "friendId": friend.id
            }),
        })
            .then(res => {
                if (res.status == 401) {
                    navigate("/unauthorized");
                }
                else if (res.status == 200) {
                    setFriends([...friends, friend]);
                    setFriendsPending(friendsPending.filter(friendPending => friendPending.id !== friend.id));
                }
            })
    }

    const RefusedFriend = async (friend) => {
        console.log(friend);
        await fetch("http://localhost:3001/friends/requests", {
            credentials: 'include',
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "friendId": friend.id
            }),
        })
            .then(res => {
                if (res.status == 401) {
                    navigate("/unauthorized");
                }
                else if (res.status == 200) {
                    console.log("friend request refused");
                    setFriendsPending(friendsPending.filter(friendPending => friendPending.id !== friend.id));
                }
            })
    }

    const CancelRequest = async (friend:UserData) => {
        console.log(friend);
        // await fetch("http://localhost:3001/friends/requests", {
        //     credentials: 'include',
        //     method: 'DELETE',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         "friendId": friend.id
        //     }),
        // })
        //     .then(res => {
        //         if (res.status == 401) {
        //             navigate("/unauthorized");
        //         }
        //         else if (res.status == 200) {
        //             console.log("friend request canceled");
        //         }
        //     }
        //     )
        setFriendsRequests(friendsRequests.filter(friendRequests => friendRequests.id !== friend.id));
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
                <div>
                    {friends && (friends.map((friend, index) => {
                        return (
                            <div key={index}>
                                <Friend props={friend} />
                            </div>
                            );
                        }))}
                </div>
                <div>
                    {friendsPending && (friendsPending.map((friend, index) => {
                        return (
                            <div key={index}>
                                <ReceivedFriend
                                    props={friend}
                                    onAcceptFriend={AcceptFriend}
                                    onRefusedFriend={RefusedFriend}
                                />
                            </div>
                            );
                        }))}
                </div>
                <div>
                    {friendsRequests && (friendsRequests.map((friend, index) => {
                        return (
                            <div key={index}>
                                <SendedFriend
                                    props={friend}
                                    onCancelRequest={CancelRequest}
                                />
                            </div>
                            );
                        }))}
                </div>
            </div>
            <Link to="/message" className="FriendsList-messages" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                <FontAwesomeIcon icon={faComments} size="2x" />
            </Link>
        </div>
    );
}