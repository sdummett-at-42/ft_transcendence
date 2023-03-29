import React, { useState } from "react";
import "./FriendsList.css"
import { Link } from "react-router-dom"
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBar from "./SearchBar/SearchBar";

export default function FriendsList() {

    const [friends, setFriends] = useState(null);

    const addFriend = (friend) => {
        fetch("http://localhost:3001/users", {
            method: "GET",
            credentials: "include"
        })
            .then((response) => response.json())
            .then(json => {
                const results = json.filter((user) => {
                    return (
                        friend &&
                        user &&
                        user.name &&
                        friend === user.name
                    );
                })
                setFriends(results);
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
                            {friends.name}
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