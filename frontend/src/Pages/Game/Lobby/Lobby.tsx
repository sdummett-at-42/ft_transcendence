import React, { useContext, useEffect, useState } from "react";
import "./Lobby.css"
import { UserContext } from "../../../context/UserContext"
import FriendsList from "../../Home/FriendsList/FriendsList";
import { useNavigate } from "react-router-dom";

export default function Lobby() {

    const { user, gameSocketRef } = useContext(UserContext);
    const navigate = useNavigate();
    const [dispSelector, setDispSelector] = useState(true);

    const handleJoinGame = (data) => {
        console.log('Joining game');
        console.log(data);
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
                    <div className="Lobby-selector">
                        <p>
                            Choose a game mode:
                        </p>
                        <button onClick={() => setDispSelector(false)}>Classic</button>
                        <button onClick={() => setDispSelector(false)}>Ranked</button>
                    </div>
                )}
                {!dispSelector && (
                    <div className="Lobby-queue">
                        <h1>Lobby</h1>
                        <button onClick={() => gameSocketRef.current.emit('joinQueue')}>Join Queue</button>
                    </div>
                )}
            </div>
            <FriendsList />
        </div>
    )
}