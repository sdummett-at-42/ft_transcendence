import React, { useContext, useEffect, useState } from "react";
import "./Lobby.css"
import { UserContext } from "../../../context/UserContext"
import FriendsList from "../../Home/FriendsList/FriendsList";
import { useNavigate } from "react-router-dom";
import ModeSelector from "./ModeSelector/ModeSelector";
import Custom from "./Custom/Custom";
import Ranked from "./Ranked/Ranked";

export default function Lobby() {

    const { user, gameSocketRef } = useContext(UserContext);
    const navigate = useNavigate();
    const [dispSelector, setDispSelector] = useState(true);
    const [ranked, setRanked] = useState(false);
    const [custom, setCustom] = useState(false);

    const handleJoinGame = (data) => {
        console.log('Joining game');
        console.log(data);
        // gameSocketRef.current.emit("joinGame", data)
        navigate(`/game/${data}`);
    }

    // Handle the socket events
    useEffect(() => {

        gameSocketRef.current.on('goInGame', handleJoinGame);

        return () => {
            gameSocketRef.current.off('goInGame', handleJoinGame);
        };
    }, [
        handleJoinGame,
        gameSocketRef
    ]);

    return (
        <div className="Lobby">
            <div className="Lobby-content">
                {dispSelector && (
                    <ModeSelector setDispSelector={setDispSelector} setRanked={setRanked} setCustom={setCustom} />
                )}
                {(!dispSelector && ranked) && (
                    <Ranked setDispSelector={setDispSelector} setRanked={setRanked} />
                )}
                {(!dispSelector && custom) && (
                    <Custom setDispSelector={setDispSelector} setCustom={setCustom} />
                )}
            </div>
            <FriendsList />
        </div>
    )
}