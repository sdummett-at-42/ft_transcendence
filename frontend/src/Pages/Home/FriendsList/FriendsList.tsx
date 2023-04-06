import React, { useState } from "react";
import "./FriendsList.css"
import { Link } from "react-router-dom"
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBar from "./SearchBar/SearchBar";

export default function FriendsList() {

    const [friends, setFriends] = useState(null);
    const [friendsPending, setFriendsPending] = useState(null);

    const addFriend = async (friend) => {

        await fetch("http://localhost:3001/friends/requests", {
            method: "POST",
            credentials: "include",
            body: friend
        })

        await fetch("http://localhost:3001/friends", {
            method: "GET",
            credentials: "include"
        })
            .then((response) => response.json())
            .then(json => {
                const results = json.filter((user) => {
                    return (
                        friend &&
                        user &&
                        friend === user.name
                    );
                })
                setFriends(results);
                console.log(results);
            });
        
        await fetch("http://localhost:3001/friends/requests/sended", {
            method: "GET",
            credentials: "include"
        })
            .then((response) => response.json())
            .then(json => {
                const results = json.filter((user) => {
                    return (
                        friend &&
                        user &&
                        friend === user.name
                    );
                })
                setFriendsPending(results);
                console.log(results);
        });
    }

    return (
        <div className="FriendsList">
            <div className="FriendsList-title">
                Liste d'amis
            </div>
            <div className="FriendsList-search-bar-container">
                <SearchBar onAddFriend={addFriend} />
            </div>
            <div className="FriendsList-list">
                <div className="FriendsList-user">
                    {friends && (
                        <div key={friends.id}>
                            <div className="FriendsList-profil-picture">
                                {friends.profilPicture}
                            </div>
                            <div className="FriendsList-name">
                                {friends.name}
                            </div>
                            <div className="FriendsList-state">
                                {/* Status de l'utilisateur (online - offline) */}
                            </div>
                        </div>
                    )}
                </div>
                <div className="FriendsList-user-pending">
                    {friendsPending && (
                        <div key={friendsPending.id}>
                            <div className="FriendsList-profil-picture">
                                {friendsPending.profilPicture}
                            </div>
                            <div className="FriendsList-name">
                                {friendsPending.name}
                            </div>
                            <div className="FriendsList-state">
                                {/* Status de l'utilisateur (online - offline) */}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Link to="/message" className="FriendsList-messages" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                <FontAwesomeIcon icon={faComments} size="2x" />
            </Link>
        </div>
    );
}