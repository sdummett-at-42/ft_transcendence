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
    const [friends, setFriends] = useState([] as any);
    // Store all received friend requests of the user
    const [receivedRequests, setReceivedRequests] = useState([] as any);
    // Store all sent friend requests of the user
    const [sendRequests, setSendRequests] = useState([] as any);
    // Store the online status
    const [onlineStatus, setOnlineStatus] = useState([] as any);

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
            const ListOfUsers = await fetch("http://localhost:3001/users", {
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
            const friendsList = ListOfUsers.filter(user => ListOfFriends.includes(user.id));
            setFriends(friendsList);
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
                setReceivedRequests(ReceivedPendingFriends);
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
                setSendRequests(SentPendingFriends);
        }

        getFriends();
        getPendingFriends();
        getRequestFriends();
    }, []);

    const handleFriendRequest = (data) => {
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
            setReceivedRequests(ReceivedPendingFriends);
            }
        getPendingFriends();
    };

    const handleFriendRequestAccepted = (data) => {
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
            const ListOfUsers = await fetch("http://localhost:3001/users", {
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
            const friendsList = ListOfUsers.filter(user => ListOfFriends.includes(user.id));
            setFriends(friendsList);
            setSendRequests(sendRequests.filter(friend => friend.receiver.id != data.id));

        }
        getFriends();
    };

    const handleFriendRequestCanceled = (data) => {
        setReceivedRequests(receivedRequests.filter(friend => friend.sender.id != data.id));
    };

    const handleFriendConnected = (data) => {
        setOnlineStatus([...onlineStatus, data]);
    };

    const handleFriendDisconnected = (data) => {
        // setOnlineStatus(onlineStatus.filter(friend => friend.id != data.id));
    };

    // Handle the socket events
    useEffect(() => {

        friendSocketRef.current.on('friendRequestReceived', handleFriendRequest);
        friendSocketRef.current.on('friendRequestAccepted', handleFriendRequestAccepted);
        friendSocketRef.current.on('friendRequestCanceled', handleFriendRequestCanceled);
        friendSocketRef.current.on('friendConnected', handleFriendConnected);
        friendSocketRef.current.on('friendDisconnected', handleFriendDisconnected);

        return () => {
            friendSocketRef.current.off('friendRequestReceived', handleFriendRequest);
            friendSocketRef.current.off('friendRequestAccepted', handleFriendRequestAccepted);
            friendSocketRef.current.off('friendRequestCanceled', handleFriendRequestCanceled);
            friendSocketRef.current.off('friendConnected', handleFriendConnected);
            friendSocketRef.current.off('friendDisconnected', handleFriendDisconnected);
        };
    }, [
        handleFriendRequest,
        handleFriendRequestAccepted,
        handleFriendRequestCanceled,
        handleFriendConnected,
        handleFriendDisconnected,
        friendSocketRef]);

    const [isShaking, setIsShaking] = useState(false);

    // Handle the search bar input
    const addFriend = async (friend:string) => {
        // Fetch the user list from the database and filter the user that matches the input
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

        // Check if the user is already a friend or if the user is already in the friend request list or if the user is the current user
        if (!getUser || getUser.id === user.id || sendRequests.some(friend => friend.receiver.id === getUser.id) || friends.some(friend => friend.id === getUser.id)) {
            setIsShaking(true);
            setTimeout(() => { setIsShaking(false) }, 1000);
            return;
        }
        
        // Check if the user is already in the pending friend request list
        if (receivedRequests.some(friend => friend.sender.id === getUser.id)) {
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
                else if (res.status == 201) {
                    return res.json();
                }
            })
            .then(res => {
                setSendRequests([...sendRequests, res]);
            });
    }

    const AcceptFriend = async (friend:UserData) => {
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
                    setReceivedRequests(receivedRequests.filter(receivedRequest => receivedRequest.sender.id !== friend.id));
                }
            })
    }

    const RefusedFriend = async (friend:UserData) => {
        await fetch("http://localhost:3001/friends/requests/received", {
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
                else if (res.status == 204) {
                    setReceivedRequests(receivedRequests.filter(receivedRequest => receivedRequest.sender.id !== friend.id));
                }
            });
    }

    const CancelRequest = async (friend:UserData) => {
        await fetch("http://localhost:3001/friends/requests/sended", {
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
                else if (res.status == 204) {
                    setSendRequests(sendRequests.filter(sendRequest => sendRequest.receiver.id !== friend.id));
                }
            });
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
                    {friends.map((friend, index) => {
                        return (
                            <div key={index}>
                                <Friend
                                    props={friend}
                                    isConnected={onlineStatus.some(online => online.id === friend.id)}
                                />
                            </div>
                            );
                        })}
                </div>
                <div>
                    {receivedRequests.map((friend, index) => {
                        return (
                            <div key={index}>
                                <ReceivedFriend
                                    props={friend}
                                    onAcceptFriend={AcceptFriend}
                                    onRefusedFriend={RefusedFriend}
                                />
                            </div>
                            );
                        })}
                </div>
                <div>
                    {sendRequests.map((friend, index) => {
                        return (
                            <div key={index}>
                                <SendedFriend
                                    props={friend}
                                    onCancelRequest={CancelRequest}
                                />
                            </div>
                            );
                        })}
                </div>
            </div>
            <Link to="/message" className="FriendsList-messages" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                <FontAwesomeIcon icon={faComments} size="2x" />
            </Link>
        </div>
    );
}