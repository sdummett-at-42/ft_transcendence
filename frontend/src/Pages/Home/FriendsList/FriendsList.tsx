import React, { useState, useEffect } from "react";
import "./FriendsList.css"
import { Link, useNavigate } from "react-router-dom";
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBar from "./SearchBar/SearchBar";

export default function FriendsList() {

    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [friendsPending, setFriendsPending] = useState(null);

    const addFriend = async (friend) => {
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

        console.log(getUser);
        setFriends([...friends, getUser]);
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
                        friends.forEach(element => {
                            return (

                                <div key={element.id}>
                            <div className="FriendsList-profil-picture">
                                {element.profilPicture}
                            </div>
                            <div className="FriendsList-name">
                                {element.name}
                            </div>
                            <div className="FriendsList-state">
                                {/* Status de l'utilisateur (online - offline) */}
                            </div>
                        </div>
                            );
                        })
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