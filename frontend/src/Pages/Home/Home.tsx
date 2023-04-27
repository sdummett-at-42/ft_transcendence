import React from "react";
import "./Home.css"
import FriendsList from "./FriendsList/FriendsList";
import HomeContent from "./HomeContent/HomeContent";
import Invitaion from "../Invitaion/Invitaion";

export default function Home() {

    return (
        <div>
            <div className="Home">
                <HomeContent />
                <FriendsList />
                <Invitaion />
            </div>
        </div>
    );
}