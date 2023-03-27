import React, { useState } from "react";
import "./Home.css"
import FriendsList from "./FriendsList/FriendsList";
import HomeContent from "./HomeContent/HomeContent";

export default function Home() {

    const [results, setResults] = useState([]);

    return (
        <div>
            <div className="Home">
                <HomeContent />
                <FriendsList />
            </div>
        </div>
    );
}