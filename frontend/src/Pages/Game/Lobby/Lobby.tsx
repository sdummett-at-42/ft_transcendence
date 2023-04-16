import React, { useContext, useEffect } from "react";
import "./Lobby.css"
import { UserContext } from "../../../context/UserContext"
import FriendsList from "../../Home/FriendsList/FriendsList";
import { useNavigate } from "react-router-dom";

export default function Lobby() {

    const { user, gameSocketRef } = useContext(UserContext);
    const navigate = useNavigate();

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
        <div>
            <h1>Lobby</h1>
            <button onClick={() => gameSocketRef.current.emit('joinQueue')}>Join Queue</button>
            <FriendsList />
        </div>
    )
}