import React, { useState } from "react";
import "./Home.css"
import FriendsList from "./FriendsList/FriendsList";
import HomeContent from "./HomeContent/HomeContent";

export default function Home() {

    return (
        <div>
            <div className="Home">
                <HomeContent />
                <FriendsList />
            </div>
        </div>
    );
}