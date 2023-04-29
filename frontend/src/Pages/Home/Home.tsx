import React from "react";
import "./Home.css"
import FriendsList from "./FriendsList/FriendsList";
import HomeContent from "./HomeContent/HomeContent";
import Invitation from "../Invitation/Invitation";

export default function Home() {

    return (
        <div>
            <div className="Home">
                <HomeContent />
                <FriendsList />
                <Invitation />
            </div>
        </div>
    );
}