import React, { useContext, useEffect, useState } from "react";
import "./Game.css"
import Canvas from "./Canvas";
import { UserContext } from "../../../context/UserContext"
import { Shape } from "../../../../../backend/src/modules/game/entities/game.entities"

export default function Game() {
    const id = window.location.pathname.split('/')[2];
    const room = "game" + id;

    const { user, gameSocketRef } = useContext(UserContext);

    const [scoreP1, setScoreP1] = useState<number>(0);
    const [scoreP2, setScoreP2] = useState<number>(0);
    const [timer, setTimer] = useState<number>(0);
    const [elements, setElements] = useState<Shape[]>([]);

    /* ****************** *\
    |* Handle Input Event *|
    \* ****************** */

    const handleImage = (data : Shape[]) => {
        console.log("image:", data);
        setElements(data);
    }

    const handleScore = (data) => {
        if (data.side === 1)
            setScoreP1(data.score);
        else 
            setScoreP2(data.score);
    }

    const handleVictory = (data) => {
        // TODO
        // victory
        // ajouter victory abandon
    }

    const handleTimer = (data) => {
        setTimer(data);
    }

    // const handleConnectGame = () => {
    //     const msg = "User have join the game Y has player X.";
    //     gameSocketRef.current.emit("joinGame", {roomId : room, message : msg});
    // }

    // Handle the socket events
    useEffect(() => {

        gameSocketRef.current.on('image', handleImage);
        gameSocketRef.current.on('score', handleScore);
        gameSocketRef.current.on('VictoryScore', handleVictory);
        gameSocketRef.current.on('gameTimer', handleTimer);
        // gameSocketRef.current.on('connect', handleConnectGame);

        return () => {
            gameSocketRef.current.off('image', handleImage);
            gameSocketRef.current.off('score', handleScore);
            gameSocketRef.current.off('VictoryScore', handleVictory);
            gameSocketRef.current.off('gameTimer', handleTimer);
            // gameSocketRef.current.on('connect', handleConnectGame);
        };
    }, [
        handleImage,
        // handleScore,
        handleVictory,
        handleTimer,
        // handleConnectGame,
        gameSocketRef
    ]);

    return (
        <div>
            <h1>Game</h1>
            <div id="timer">Time = {timer}</div>
            <div id="Scorep1">Player 1 = {scoreP1}</div>
            <div id="Scorep2">Player 2 = {scoreP2}</div>
            <Canvas elements={elements} room={room} socketRef={gameSocketRef}/>
        </div>
    )
}