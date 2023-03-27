import React, { useState } from "react";
import "./FriendsList.css"
import { Link } from "react-router-dom"
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBar from "./SearchBar/SearchBar";

export default function FriendsList() {

    const [friend, setFriend] = useState([]);

    return (
        <div className="FriendsList">
            <div className="FriendsList-title">
                Liste d'amis
            </div>
            <div className="FriendsList-search-bar-container">
                <SearchBar props={setFriend} />
            </div>
            <div className="FriendsList-list">
                <div className="FriendsList-user">
                    <div>
                        {friend.name}
                    </div>
                </div>
            </div>
            <Link to="/message" className="FriendsList-messages" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                <FontAwesomeIcon icon={faComments} size="2x" />
            </Link>
        </div>
    );
}