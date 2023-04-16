import React, { useContext, useEffect } from "react";
import "./Game.css"
import { UserContext } from "../../../context/UserContext"

export default function Game() {

    const { user, gameSocketRef } = useContext(UserContext);

    const handleImage = (data) => {
        console.log('image');
        console.log(data);
    }
    const handleScore = (data) => {
        console.log('score');
        console.log(data);
    }
    const handleVictory = (data) => {
        console.log('VictoryScore');
        console.log(data);
    }
    const handleTimer = (data) => {
        console.log('Timer');
        console.log(data);
    }

    // Handle the socket events
    useEffect(() => {

        gameSocketRef.current.on('image', handleImage);
        gameSocketRef.current.on('score', handleScore);
        gameSocketRef.current.on('VictoryScore', handleVictory);
        gameSocketRef.current.on('gameTimer', handleTimer);

        return () => {
            gameSocketRef.current.off('image', handleImage);
            gameSocketRef.current.off('score', handleScore);
            gameSocketRef.current.off('VictoryScore', handleVictory);
            gameSocketRef.current.off('gameTimer', handleTimer);
        };
    }, [
        handleImage,
        handleScore,
        handleVictory,
        handleTimer,
        gameSocketRef
    ]);

    return (
        <div>
            <h1>Game</h1>
        </div>
    )
}