import React, { useContext } from "react";
import "./Home.css"
import FriendsList from "./FriendsList/FriendsList";
import HomeContent from "./HomeContent/HomeContent";
import Invitation from "../Invitation/Invitation";
import { UserContext } from "../../context/UserContext";

export default function Home() {

	const { user } = useContext(UserContext);
	if (!user)
		window.location.href = `${import.meta.env.VITE_FRONTENDURL}/`;

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