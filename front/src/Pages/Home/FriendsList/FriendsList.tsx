import React, { useState } from "react";
import "./FriendsList.css"
import { Link } from "react-router-dom"
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBar from "./SearchBar/SearchBar";

export default function FriendsList() {

    return (
        <div className="FriendsList">
            <div className="FriendsList-title">
                Liste d'amis
            </div>
            <div className="FriendsList-search-bar-container">
                <SearchBar />
            </div>
            <div className="FriendsList-list">
                <div className="FriendsList-user">
                    {/* added user */}
                    user
                </div>
            </div>
            <Link to="/message" className="FriendsList-icon" style={{textDecoration: 'none', color: 'whitesmoke'}}>
                <FontAwesomeIcon icon={faComments} size="2x" />
            </Link>
        </div>
    );
}